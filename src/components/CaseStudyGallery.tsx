/**
 * Case Study Gallery Component
 * Displays submitted case studies with their validation status
 */

import { FunctionalComponent } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { PublicKey, Connection } from '@solana/web3.js';
import { WalletContext } from '../context/WalletContext';
import { SOLANA_CONFIG, getRpcEndpoint } from '../config/solana';
import { parseCaseStudyAccount, ParsedCaseStudy, ValidationStatus, TreatmentCategory } from '../utils/caseStudyParser';

interface CaseStudyDisplay {
  pubkey: string;
  protocol: string;
  category: string;
  submittedAt: Date;
  validationStatus: 'pending' | 'approved' | 'rejected';
  approvalCount: number;
  rejectionCount: number;
  reputationScore: number;
  compressionRatio: number;
  hasAttentionToken: boolean;
  isPaused: boolean;
  durationDays: number;
  ipfsCid: string;
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
      // Use a minimum data size filter to avoid fetching wrong accounts
      const accounts = await connection.getProgramAccounts(programId, {
        filters: [
          { dataSize: 254 }, // Exact size of CaseStudy account with typical IPFS CID
        ],
      });

      const parsed: CaseStudyDisplay[] = [];

      for (const { pubkey, account } of accounts) {
        try {
          // Use the proper parser
          const caseStudy = parseCaseStudyAccount(account.data, pubkey);
          if (!caseStudy) continue;

          // Map validation status to filter categories
          const statusMap: Record<ValidationStatus, 'pending' | 'approved' | 'rejected'> = {
            [ValidationStatus.Pending]: 'pending',
            [ValidationStatus.Approved]: 'approved',
            [ValidationStatus.Rejected]: 'rejected',
            [ValidationStatus.UnderReview]: 'pending',
          };

          const status = statusMap[caseStudy.validationStatus] || 'pending';
          const isOwner = publicKey && caseStudy.submitter.equals(publicKey);

          // Apply filters
          if (filter === 'mine' && !isOwner) continue;
          if (filter === 'pending' && status !== 'pending') continue;
          if (filter === 'approved' && status !== 'approved') continue;

          // Build display object
          parsed.push({
            pubkey: pubkey.toString(),
            protocol: caseStudy.treatmentCategoryName,
            category: caseStudy.treatmentCategoryName,
            submittedAt: caseStudy.createdAt,
            validationStatus: status,
            approvalCount: caseStudy.approvalCount,
            rejectionCount: caseStudy.rejectionCount,
            reputationScore: caseStudy.reputationScore,
            compressionRatio: caseStudy.compressionRatio,
            hasAttentionToken: caseStudy.hasAttentionToken,
            isPaused: caseStudy.isPaused,
            durationDays: caseStudy.durationDays,
            ipfsCid: caseStudy.ipfsCid,
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
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="text-center py-12">
        <div class="text-red-400 mb-4">⚠️ {error}</div>
        <button
          onClick={loadCaseStudies}
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Filters */}
      <div class="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'mine'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            class={`px-4 py-2 rounded-lg capitalize transition-all ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {f === 'mine' ? 'My Submissions' : f}
          </button>
        ))}
      </div>

      {/* Case Studies Grid */}
      {caseStudies.length === 0 ? (
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-4">📋</div>
          <p>No case studies found</p>
          {filter === 'mine' && (
            <p class="text-sm mt-2">Submit your first case study to see it here</p>
          )}
        </div>
      ) : (
        <div class="grid gap-4">
          {caseStudies.map((study) => (
            <div
              key={study.pubkey}
              class="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/30 transition-all"
            >
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-white truncate">
                      {study.protocol}
                    </h3>
                    <span
                      class={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(
                        study.validationStatus
                      )}`}
                    >
                      {study.validationStatus}
                    </span>
                    {study.hasAttentionToken && (
                      <span class="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        🪙 Token
                      </span>
                    )}
                    {study.isPaused && (
                      <span class="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        ⏸️ Paused
                      </span>
                    )}
                  </div>

                  <div class="text-sm text-slate-400 space-y-1">
                    <p>
                      Submitted: {study.submittedAt.toLocaleDateString()} at{' '}
                      {study.submittedAt.toLocaleTimeString()}
                    </p>
                    <p>Duration: {study.durationDays} days</p>
                    <p class="font-mono text-xs text-slate-500 truncate">
                      CID: {study.ipfsCid}
                    </p>
                  </div>
                </div>

                <div class="flex flex-wrap gap-4 text-sm">
                  <div class="text-center px-4 py-2 bg-slate-900/50 rounded-lg">
                    <div class="text-emerald-400 font-semibold">{study.approvalCount}</div>
                    <div class="text-slate-500 text-xs">Approvals</div>
                  </div>
                  <div class="text-center px-4 py-2 bg-slate-900/50 rounded-lg">
                    <div class="text-red-400 font-semibold">{study.rejectionCount}</div>
                    <div class="text-slate-500 text-xs">Rejections</div>
                  </div>
                  <div class="text-center px-4 py-2 bg-slate-900/50 rounded-lg">
                    <div class="text-blue-400 font-semibold">{study.reputationScore}/100</div>
                    <div class="text-slate-500 text-xs">Quality Score</div>
                  </div>
                  <div class="text-center px-4 py-2 bg-slate-900/50 rounded-lg">
                    <div class="text-purple-400 font-semibold">{study.compressionRatio}%</div>
                    <div class="text-slate-500 text-xs">Compressed</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseStudyGallery;
