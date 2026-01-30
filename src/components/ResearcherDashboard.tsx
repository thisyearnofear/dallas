/**
 * ResearcherDashboard - MPC Access Request Interface
 * 
 * Enables researchers to request access to encrypted case study data
 * through threshold decryption (Arcium MPC). Shows committee approval
 * progress and manages decryption workflow.
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: New component for research use case
 * - CLEAN: Clear separation between request and approval flows
 * - MODULAR: Can be integrated into existing pages
 */

import { FunctionalComponent } from 'preact';
import { useState, useContext, useEffect } from 'preact/hooks';
import { WalletContext } from '../context/WalletContext';
import {
  arciumMPCService,
  MPCAccessRequest,
  CommitteeMember,
  DEFAULT_MPC_CONFIG,
} from '../services/privacy';
import { PrivacyTooltip } from './PrivacyTooltip';

interface ResearcherState {
  activeRequests: MPCAccessRequest[];
  selectedRequest: MPCAccessRequest | null;
  justification: string;
  encryptionScheme: 'aes-256' | 'chacha20' | 'custom';
  preferredThreshold: number;
  isSubmitting: boolean;
  isDecrypting: boolean;
}

export const ResearcherDashboard: FunctionalComponent = () => {
  const { publicKey, connected } = useContext(WalletContext);
  
  const [state, setState] = useState<ResearcherState>({
    activeRequests: [],
    selectedRequest: null,
    justification: '',
    encryptionScheme: 'aes-256',
    preferredThreshold: DEFAULT_MPC_CONFIG.threshold,
    isSubmitting: false,
    isDecrypting: false,
  });

  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Initialize service and load mock data
  useEffect(() => {
    arciumMPCService.initialize().catch(console.error);
    
    // Load mock active requests
    const mockRequests: MPCAccessRequest[] = [
      {
        id: 'mpc_cs-001_abc123_1699123456789_xyz789',
        caseStudyId: 'cs-001',
        requester: publicKey || new (await import('@solana/web3.js')).PublicKey(new Uint8Array(32).fill(1)),
        requesterType: 'researcher',
        justification: 'Researching efficacy of Peptide-T protocols for neurodegenerative conditions. Aggregate analysis of 50+ case studies needed for statistical significance.',
        status: 'active',
        committee: [
          { validatorAddress: new (await import('@solana/web3.js')).PublicKey(new Uint8Array(32).fill(1)), hasApproved: true, approvedAt: Date.now() - 3600000 },
          { validatorAddress: new (await import('@solana/web3.js')).PublicKey(new Uint8Array(32).fill(2)), hasApproved: true, approvedAt: Date.now() - 7200000 },
          { validatorAddress: new (await import('@solana/web3.js')).PublicKey(new Uint8Array(32).fill(3)), hasApproved: false },
          { validatorAddress: new (await import('@solana/web3.js')).PublicKey(new Uint8Array(32).fill(4)), hasApproved: false },
          { validatorAddress: new (await import('@solana/web3.js')).PublicKey(new Uint8Array(32).fill(5)), hasApproved: false },
        ],
        threshold: 3,
        createdAt: Date.now() - 86400000,
        expiresAt: Date.now() + 86400000,
        encryptionScheme: 'aes-256',
      },
    ];
    
    setState(s => ({ ...s, activeRequests: mockRequests }));
  }, [publicKey]);

  // Request access to case study
  const handleRequestAccess = async (caseStudyId: string) => {
    if (!publicKey || !connected) {
      setSubmitStatus({
        type: 'error',
        message: 'Please connect your wallet first',
      });
      return;
    }

    if (state.justification.length < 50) {
      setSubmitStatus({
        type: 'error',
        message: 'Justification must be at least 50 characters',
      });
      return;
    }

    setState(s => ({ ...s, isSubmitting: true }));
    setSubmitStatus({
      type: 'info',
      message: '🔐 Creating MPC access request...',
    });

    try {
      const request = await arciumMPCService.requestAccess(publicKey, {
        caseStudyId,
        justification: state.justification,
        requesterType: 'researcher',
        encryptionScheme: state.encryptionScheme,
        preferredThreshold: state.preferredThreshold,
      });

      setState(s => ({
        ...s,
        activeRequests: [request, ...s.activeRequests],
        justification: '',
        isSubmitting: false,
      }));

      setSubmitStatus({
        type: 'success',
        message: `✅ Access request created! Committee of ${request.committee.length} validators formed.`,
      });
    } catch (error) {
      setState(s => ({ ...s, isSubmitting: false }));
      setSubmitStatus({
        type: 'error',
        message: `❌ Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  // Decrypt data after approval
  const handleDecrypt = async (request: MPCAccessRequest) => {
    if (!publicKey) return;

    setState(s => ({ ...s, isDecrypting: true }));
    setSubmitStatus({
      type: 'info',
      message: '🔓 Performing threshold decryption...',
    });

    try {
      const result = await arciumMPCService.decryptData(request.id, publicKey);

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: `✅ Data decrypted! Approved by ${result.approvedBy.length} validators.`,
        });
        // In production, display decrypted data here
        console.log('Decrypted data:', result.data);
      } else {
        setSubmitStatus({
          type: 'error',
          message: `❌ Decryption failed: ${result.error}`,
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: `❌ Decryption error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setState(s => ({ ...s, isDecrypting: false }));
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'active': return 'bg-yellow-500';
      case 'pending': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      case 'expired': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div class="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-2xl border-2 border-yellow-500 shadow-xl transition-all duration-300">
      {/* Header */}
      <div class="mb-10">
        <h2 class="text-3xl font-black mb-2 uppercase tracking-tighter flex items-center gap-3">
          <span class="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-lg text-2xl">🔬</span>
          <span>Researcher Dashboard</span>
        </h2>
        <p class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          Request access to encrypted case studies for research. Access requires approval from a committee of validators via threshold decryption.
        </p>
      </div>

      {/* Status Messages */}
      {submitStatus.type && (
        <div
          class={`mb-8 p-5 rounded-xl border-l-4 transition-colors shadow-sm font-bold text-sm ${
            submitStatus.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300'
              : submitStatus.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300'
              : 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: New Request Form */}
        <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-inner">
          <PrivacyTooltip topic="research_access" variant="section">
            <h3 class="text-xl font-black flex items-center gap-3 uppercase tracking-wider text-slate-800 dark:text-white">
              <span class="text-2xl bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm">📝</span>
              <span>Request Access</span>
            </h3>
          </PrivacyTooltip>

          <div class="mt-6 space-y-6">
            {/* Case Study ID */}
            <div>
              <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                Case Study ID
              </label>
              <input
                type="text"
                placeholder="e.g., cs-001"
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-bold outline-none focus:border-brand transition-all shadow-sm"
              />
            </div>

            {/* Justification */}
            <div>
              <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                Research Purpose <span class="text-slate-400">(min 50 chars)</span>
              </label>
              <textarea
                value={state.justification}
                onChange={(e) => setState(s => ({ ...s, justification: (e.target as HTMLTextAreaElement).value }))}
                placeholder="Explain what you're researching and how this data will help..."
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-medium h-32 resize-none outline-none focus:border-brand shadow-sm"
              />
              <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-right">
                {state.justification.length} / 50 min
              </div>
            </div>

            {/* Committee Approval - Simplified */}
            <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div class="flex items-start gap-3 mb-4">
                <span class="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🔑</span>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-black text-slate-800 dark:text-white uppercase tracking-tight">
                      Committee Approval Required
                    </span>
                    <PrivacyTooltip topic="mpc" variant="icon">
                      <span></span>
                    </PrivacyTooltip>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Multiple validators must approve before you can access the data. 
                    No single person can view it alone.
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <span class="text-sm font-bold text-slate-600 dark:text-slate-400">Approvals needed:</span>
                <select
                  value={state.preferredThreshold}
                  onChange={(e) => setState(s => ({ 
                    ...s, 
                    preferredThreshold: parseInt((e.target as HTMLSelectElement).value) 
                  }))}
                  class="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value={2}>2 of 5 (Faster)</option>
                  <option value={3}>3 of 5 (Recommended)</option>
                  <option value={4}>4 of 5 (More Secure)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleRequestAccess('cs-001')}
              disabled={state.isSubmitting || !connected}
              class="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-400 text-white font-black py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-xs"
            >
              {state.isSubmitting ? '⏳ Submitting Request...' : 'Request Committee Review'}
            </button>
          </div>
        </div>

        {/* Right: Active Requests */}
        <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-inner">
          <h3 class="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-wider text-slate-800 dark:text-white">
            <span class="text-2xl bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm">📋</span>
            <span>Active Requests ({state.activeRequests.length})</span>
          </h3>

          <div class="space-y-4">
            {state.activeRequests.length === 0 ? (
              <div class="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">
                  No active requests
                </p>
              </div>
            ) : (
              state.activeRequests.map(request => {
                const committeeStatus = arciumMPCService.getCommitteeStatus(request.id);
                const progress = committeeStatus?.progress || 0;
                
                return (
                  <div
                    key={request.id}
                    class="p-5 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    {/* Header */}
                    <div class="flex justify-between items-start mb-3">
                      <div>
                        <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          Case Study {request.caseStudyId}
                        </h4>
                        <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                          ID: {request.id.slice(0, 20)}...
                        </p>
                      </div>
                      <span class={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-white ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>

                    {/* Committee Progress */}
                    {committeeStatus && (
                      <div class="mb-4">
                        <div class="flex justify-between text-xs font-bold mb-2">
                          <span class="text-slate-600 dark:text-slate-400">
                            Committee Approvals
                          </span>
                          <span class="text-yellow-600 dark:text-yellow-400">
                            {committeeStatus.approved} / {committeeStatus.threshold} required
                          </span>
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            class="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div class="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                      <div class="flex justify-between">
                        <span>Encryption:</span>
                        <span class="font-bold text-slate-800 dark:text-slate-300 uppercase">
                          {request.encryptionScheme}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span>Expires:</span>
                        <span class="font-bold text-slate-800 dark:text-slate-300">
                          {arciumMPCService.formatTimeRemaining(request.expiresAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {request.status === 'approved' && (
                      <button
                        onClick={() => handleDecrypt(request)}
                        disabled={state.isDecrypting}
                        class="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-black py-3 rounded-lg shadow-md transition-all text-xs uppercase tracking-widest"
                      >
                        {state.isDecrypting ? '⏳ Decrypting...' : '🔓 Decrypt Data'}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div class="mt-10 p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800/50 rounded-2xl flex gap-4 items-start">
        <div class="text-3xl">🔐</div>
        <div>
          <p class="font-black text-yellow-800 dark:text-yellow-300 uppercase tracking-widest text-xs mb-2">
            How Committee Approval Protects Privacy
          </p>
          <p class="text-xs font-medium text-yellow-700 dark:text-slate-400 leading-relaxed">
            Your request goes to a committee of independent validators. The data can only be 
            decrypted when enough validators agree—no single person, not even platform admins, 
            can access patient data alone. This protects patients while enabling important research.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResearcherDashboard;
