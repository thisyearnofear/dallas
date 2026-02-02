/**
 * Case Study Gallery Component
 * Displays submitted case studies with their validation status
 */

import { FunctionalComponent } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { PublicKey, Connection } from '@solana/web3.js';
import { WalletContext } from '../context/WalletContext';
import { SOLANA_CONFIG, getRpcEndpoint } from '../config/solana';

interface CaseStudyDisplay {
  pubkey: string;
  protocol: string;
  submittedAt: Date;
  validationStatus: 'pending' | 'approved' | 'rejected';
  approvalCount: number;
  reputationScore: number;
  compressionRatio: number;
  hasAttentionToken: boolean;
}

export const CaseStudyGallery: FunctionalComponent = () => {
  const walletContext = useContext(WalletContext);
  const { publicKey } = walletContext;
  
  const [caseStudies, setCaseStudies] = useState<CaseStudyDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'mine'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCaseStudies();
  }, [publicKey, filter]);

  const loadCaseStudies = async () => {
    setLoading(true);
    setError(null);

    try {
      const connection = new Connection(getRpcEndpoint(), 'confirmed');
      const programId = new PublicKey(SOLANA_CONFIG.blockchain.caseStudyProgramId);

      // Fetch all case study accounts from the program
      // CaseStudy account size: 8 + 32 + 32 + (4 + 46) + 32 + 1 + 2 + 8 + 1 + 4 + 4 + 1 + 1 + 1 + 1 + 32 + 2 + (1 + 32) + (1 + 8) = 254 bytes
      const accounts = await connection.getProgramAccounts(programId, {
        filters: [
          { dataSize: 254 }, // Exact size of CaseStudy account
        ],
      });

      const parsed: CaseStudyDisplay[] = [];

      for (const { pubkey, account } of accounts) {
        try {
          // Parse the account data (simplified - matches Anchor layout)
          const data = account.data;
          if (data.length < 200) continue; // CaseStudy is 254 bytes

          // Skip discriminator (8 bytes)
          let offset = 8;

          // ephemeral_id (32 bytes)
          offset += 32;

          // submitter (32 bytes)
          const submitterBytes = data.slice(offset, offset + 32);
          const submitter = new PublicKey(submitterBytes);
          offset += 32;

          // ipfs_cid - String (4 byte length + data)
          const ipfsCidLen = data.readUInt32LE(offset);
          offset += 4;
          const ipfsCid = data.slice(offset, offset + ipfsCidLen).toString('utf8');
          offset += ipfsCidLen;

          // treatment_protocol - String (4 byte length + data) - ACTUAL PROTOCOL NAME
          const treatmentProtocolLen = data.readUInt32LE(offset);
          offset += 4;
          const treatmentProtocol = data.slice(offset, offset + treatmentProtocolLen).toString('utf8');
          offset += treatmentProtocolLen;

          // metadata_hash (32 bytes)
          offset += 32;

          // treatment_category (1 byte)
          const treatmentCategory = data.readUInt8(offset);
          offset += 1;

          // duration_days (2 bytes)
          const durationDays = data.readUInt16LE(offset);
          offset += 2;

          // created_at (8 bytes, i64)
          const createdAt = Number(data.readBigInt64LE(offset));
          offset += 8;

          // validation_status (1 byte enum)
          const validationStatusByte = data.readUInt8(offset);
          offset += 1;

          // approval_count (4 bytes, u32)
          const approvalCount = data.readUInt32LE(offset);
          offset += 4;

          // rejection_count (4 bytes)
          offset += 4;

          // reputation_score (1 byte)
          const reputationScore = data.readUInt8(offset);
          offset += 1;

          // Skip some fields to get to compression_ratio
          offset += 1 + 1 + 32; // is_paused, threshold_shares_required, light_proof_hash

          // compression_ratio (2 bytes)
          const compressionRatio = data.readUInt16LE(offset);
          offset += 2;

          // Check if attention_token_mint exists (Option<Pubkey>)
          const hasAttentionToken = data.readUInt8(offset) === 1;

          // Map validation status
          const statusMap: Record<number, 'pending' | 'approved' | 'rejected'> = {
            0: 'pending',
            1: 'approved',
            2: 'rejected',
            3: 'pending', // UnderReview maps to pending
          };

          // Apply filters
          const status = statusMap[validationStatusByte] || 'pending';
          const isOwner = publicKey && submitter.equals(publicKey);

          if (filter === 'mine' && !isOwner) continue;
          if (filter === 'pending' && status !== 'pending') continue;
          if (filter === 'approved' && status !== 'approved') continue;

          // Use actual protocol name from blockchain data
          const protocol = treatmentProtocol;

          parsed.push({
            pubkey: pubkey.toString(),
            protocol,
            submittedAt: new Date(createdAt * 1000),
            validationStatus: status,
            approvalCount,
            reputationScore,
            compressionRatio,
            hasAttentionToken,
          });
        } catch (e) {
          // Skip malformed accounts
          console.warn('Failed to parse case study:', e);
        }
      }

      // Sort by date, newest first
      parsed.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
      setCaseStudies(parsed);
    } catch (err) {
      console.error('Failed to load case studies:', err);
      setError('Failed to load case studies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase rounded-full">
            ✓ Approved
          </span>
        );
      case 'rejected':
        return (
          <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold uppercase rounded-full">
            ✗ Rejected
          </span>
        );
      default:
        return (
          <span class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase rounded-full">
            ⏳ Pending
          </span>
        );
    }
  };

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700">
        <h2 class="text-2xl font-black mb-2 text-slate-900 dark:text-white uppercase tracking-tight">
          📊 Community Case Studies
        </h2>
        <p class="text-slate-600 dark:text-slate-400">
          Browse encrypted case studies submitted by the community. All data is encrypted - only submitters can decrypt their own data.
        </p>
      </div>

      {/* Filters */}
      <div class="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'mine'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            class={`px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {f === 'all' && '🌐 All'}
            {f === 'pending' && '⏳ Pending'}
            {f === 'approved' && '✓ Approved'}
            {f === 'mine' && '👤 My Studies'}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div class="text-center py-12">
          <div class="text-4xl mb-4 animate-bounce">🔍</div>
          <div class="text-slate-600 dark:text-slate-400">Loading case studies from blockchain...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
          <div class="text-red-600 dark:text-red-400">{error}</div>
          <button
            onClick={loadCaseStudies}
            class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && caseStudies.length === 0 && (
        <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">No Case Studies Found</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-6">
            {filter === 'mine' 
              ? "You haven't submitted any case studies yet."
              : "No case studies match your filter."}
          </p>
          <a
            href="/experiences"
            class="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
          >
            📋 Share Your Experience
          </a>
        </div>
      )}

      {/* Case Study Grid */}
      {!loading && !error && caseStudies.length > 0 && (
        <div class="grid gap-4">
          {caseStudies.map((cs) => (
            <div
              key={cs.pubkey}
              class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
            >
              <div class="flex flex-wrap items-start justify-between gap-4">
                {/* Left: Info */}
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    {getStatusBadge(cs.validationStatus)}
                    {cs.hasAttentionToken && (
                      <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase rounded-full">
                        🪙 Token
                      </span>
                    )}
                  </div>
                  <h3 class="font-bold text-slate-900 dark:text-white mb-1 truncate">
                    {cs.protocol}
                  </h3>
                  <div class="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                    {cs.pubkey.slice(0, 20)}...
                  </div>
                </div>

                {/* Right: Stats */}
                <div class="flex gap-4 text-center">
                  <div>
                    <div class="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {cs.approvalCount}
                    </div>
                    <div class="text-[10px] font-bold text-slate-500 uppercase">Approvals</div>
                  </div>
                  <div>
                    <div class="text-2xl font-black text-green-600 dark:text-green-400">
                      {cs.reputationScore}
                    </div>
                    <div class="text-[10px] font-bold text-slate-500 uppercase">Score</div>
                  </div>
                  <div>
                    <div class="text-2xl font-black text-purple-600 dark:text-purple-400">
                      {cs.compressionRatio}x
                    </div>
                    <div class="text-[10px] font-bold text-slate-500 uppercase">Compressed</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  Submitted {cs.submittedAt.toLocaleDateString()}
                </div>
                <a
                  href={`https://explorer.solana.com/address/${cs.pubkey}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  View on Explorer →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
        <h4 class="font-bold text-purple-800 dark:text-purple-300 mb-2">🔐 Privacy Protected</h4>
        <p class="text-sm text-purple-700 dark:text-purple-400">
          All case study data is encrypted with the submitter's wallet key. Only the submitter can decrypt and view the actual health data. Validators verify data quality using zero-knowledge proofs without seeing sensitive information.
        </p>
      </div>
    </div>
  );
};
