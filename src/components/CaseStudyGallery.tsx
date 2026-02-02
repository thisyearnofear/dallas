/**
 * Case Study Gallery Component
 * Displays submitted case studies with their validation status
 * Supports both light and dark modes
 * Includes IPFS fetch + decryption for viewing details
 */

import { FunctionalComponent } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { PublicKey, Connection } from '@solana/web3.js';
import { WalletContext } from '../context/WalletContext';
import { SOLANA_CONFIG, getRpcEndpoint } from '../config/solana';
import { parseCaseStudyAccount, ValidationStatus } from '../utils/caseStudyParser';
import { fetchCaseStudyDetails, DecryptedCaseStudyDetails, FetchDetailsResult } from '../services/CaseStudyDetailsService';

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
  
  // Details modal state
  const [selectedStudy, setSelectedStudy] = useState<CaseStudyDisplay | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState<DecryptedCaseStudyDetails | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

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

  const handleViewDetails = async (study: CaseStudyDisplay) => {
    setSelectedStudy(study);
    setDetailsLoading(true);
    setDetailsData(null);
    setDetailsError(null);

    // Get wallet signing function from context
    const wallet = walletContext as any;
    const signMessage = wallet?.signMessage;

    const result = await fetchCaseStudyDetails(
      study.ipfsCid,
      publicKey || undefined,
      signMessage
    );
    
    if (result.success && result.data) {
      setDetailsData(result.data);
    } else {
      setDetailsError(result.error || 'Failed to load details');
    }
    
    setDetailsLoading(false);
  };

  const closeDetails = () => {
    setSelectedStudy(null);
    setDetailsData(null);
    setDetailsError(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30',
      approved: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30',
      rejected: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30',
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
        <div class="text-red-600 dark:text-red-400 mb-4">⚠️ {error}</div>
        <button
          onClick={loadCaseStudies}
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
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
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {f === 'mine' ? 'My Submissions' : f}
          </button>
        ))}
      </div>

      {/* Case Studies Grid */}
      {caseStudies.length === 0 ? (
        <div class="text-center py-12 text-gray-500 dark:text-slate-400">
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
              class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all shadow-sm dark:shadow-none"
            >
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
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
                      <span class="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-500/30">
                        🪙 Token
                      </span>
                    )}
                    {study.isPaused && (
                      <span class="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30">
                        ⏸️ Paused
                      </span>
                    )}
                  </div>

                  <div class="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                    <p>
                      Submitted: {study.submittedAt.toLocaleDateString()} at{' '}
                      {study.submittedAt.toLocaleTimeString()}
                    </p>
                    <p>Duration: {study.durationDays} days</p>
                    <p class="font-mono text-xs text-gray-400 dark:text-slate-500 truncate">
                      CID: {study.ipfsCid}
                    </p>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                  <div class="flex flex-wrap gap-4 text-sm">
                    <div class="text-center px-4 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                      <div class="text-emerald-600 dark:text-emerald-400 font-semibold">{study.approvalCount}</div>
                      <div class="text-gray-500 dark:text-slate-500 text-xs">Approvals</div>
                    </div>
                    <div class="text-center px-4 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                      <div class="text-red-600 dark:text-red-400 font-semibold">{study.rejectionCount}</div>
                      <div class="text-gray-500 dark:text-slate-500 text-xs">Rejections</div>
                    </div>
                    <div class="text-center px-4 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                      <div class="text-blue-600 dark:text-blue-400 font-semibold">{study.reputationScore}/100</div>
                      <div class="text-gray-500 dark:text-slate-500 text-xs">Quality Score</div>
                    </div>
                    <div class="text-center px-4 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                      <div class="text-purple-600 dark:text-purple-400 font-semibold">{study.compressionRatio}%</div>
                      <div class="text-gray-500 dark:text-slate-500 text-xs">Compressed</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleViewDetails(study)}
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    🔓 View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedStudy && (
        <div 
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeDetails()}
        >
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div class="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                  Case Study Details
                </h2>
                <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {selectedStudy.protocol} • {selectedStudy.durationDays} days
                </p>
              </div>
              <button
                onClick={closeDetails}
                class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-500 dark:text-slate-400"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div class="p-6">
              {detailsLoading ? (
                <div class="flex flex-col items-center justify-center py-12">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                  <p class="text-gray-600 dark:text-slate-400">Fetching from IPFS...</p>
                  <p class="text-xs text-gray-400 dark:text-slate-500 mt-2 font-mono">{selectedStudy.ipfsCid}</p>
                </div>
              ) : detailsError ? (
                <div class="text-center py-8">
                  <div class="text-4xl mb-4">🔒</div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {detailsError.includes('encrypted') ? 'Encrypted Data' : 'Unable to Load Details'}
                  </h3>
                  <p class="text-gray-600 dark:text-slate-400 mb-4">{detailsError}</p>
                  {!publicKey && detailsError.includes('wallet') && (
                    <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p class="text-sm text-blue-700 dark:text-blue-400 mb-2">
                        💡 Connect your wallet to decrypt your case studies
                      </p>
                      <p class="text-xs text-blue-600 dark:text-blue-500">
                        Your data is encrypted with a key derived from your wallet signature.
                        Only you can decrypt it.
                      </p>
                    </div>
                  )}
                  <div class="text-xs text-gray-400 dark:text-slate-500 font-mono bg-gray-100 dark:bg-slate-900 p-3 rounded-lg mt-4">
                    CID: {selectedStudy.ipfsCid}
                  </div>
                </div>
              ) : detailsData ? (
                <div class="space-y-6">
                  {/* Treatment Protocol */}
                  <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                    <h4 class="text-sm font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                      🧪 Treatment Protocol
                    </h4>
                    <p class="text-lg font-medium text-gray-900 dark:text-white">
                      {detailsData.treatmentProtocol}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      Category: {detailsData.treatmentCategory}
                    </p>
                  </div>

                  {/* Symptoms */}
                  {detailsData.symptoms && detailsData.symptoms.length > 0 && (
                    <div>
                      <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        🩺 Symptoms (Baseline)
                      </h4>
                      <div class="space-y-2">
                        {detailsData.symptoms.map((symptom, idx) => (
                          <div 
                            key={idx}
                            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg"
                          >
                            <span class="text-gray-700 dark:text-slate-300">{symptom.name}</span>
                            <div class="flex items-center gap-3">
                              <span class="text-xs text-gray-500 dark:text-slate-400">{symptom.frequency}</span>
                              <div class="flex items-center gap-1">
                                <div 
                                  class="h-2 w-16 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden"
                                >
                                  <div 
                                    class="h-full bg-red-500 rounded-full"
                                    style={{ width: `${(symptom.severity / 10) * 100}%` }}
                                  />
                                </div>
                                <span class="text-xs font-medium text-gray-600 dark:text-slate-400 w-6">
                                  {symptom.severity}/10
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outcomes */}
                  {detailsData.outcomes && detailsData.outcomes.length > 0 && (
                    <div>
                      <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        📊 Outcomes
                      </h4>
                      <div class="space-y-3">
                        {detailsData.outcomes.map((outcome, idx) => {
                          const improvement = outcome.afterTreatment - outcome.baseline;
                          const percentChange = outcome.baseline !== 0 
                            ? ((improvement / outcome.baseline) * 100).toFixed(1)
                            : '0';
                          const isPositive = improvement > 0;
                          
                          return (
                            <div 
                              key={idx}
                              class="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg"
                            >
                              <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-gray-700 dark:text-slate-300">
                                  {outcome.metric}
                                </span>
                                <span class={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {isPositive ? '+' : ''}{percentChange}%
                                </span>
                              </div>
                              <div class="flex items-center gap-4 text-sm">
                                <div class="flex-1">
                                  <span class="text-gray-500 dark:text-slate-500">Before:</span>
                                  <span class="ml-2 text-gray-700 dark:text-slate-300">
                                    {outcome.baseline} {outcome.unit}
                                  </span>
                                </div>
                                <div class="text-gray-400 dark:text-slate-600">→</div>
                                <div class="flex-1">
                                  <span class="text-gray-500 dark:text-slate-500">After:</span>
                                  <span class="ml-2 font-medium text-gray-900 dark:text-white">
                                    {outcome.afterTreatment} {outcome.unit}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Side Effects */}
                  {detailsData.sideEffects && detailsData.sideEffects.length > 0 && (
                    <div>
                      <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        ⚠️ Side Effects
                      </h4>
                      <div class="flex flex-wrap gap-2">
                        {detailsData.sideEffects.map((effect, idx) => (
                          <span 
                            key={idx}
                            class="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm"
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {detailsData.notes && (
                    <div>
                      <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        📝 Additional Notes
                      </h4>
                      <p class="text-gray-600 dark:text-slate-400 text-sm whitespace-pre-wrap">
                        {detailsData.notes}
                      </p>
                    </div>
                  )}

                  {/* Cost */}
                  {detailsData.costUSD && (
                    <div class="pt-4 border-t border-gray-200 dark:border-slate-700">
                      <div class="flex items-center justify-between">
                        <span class="text-gray-600 dark:text-slate-400">Treatment Cost</span>
                        <span class="text-lg font-semibold text-gray-900 dark:text-white">
                          ${detailsData.costUSD.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseStudyGallery;
