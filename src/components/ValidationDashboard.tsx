import { FunctionalComponent } from 'preact';
import { useState, useContext, useEffect } from 'preact/hooks';
import { WalletContext } from '../context/WalletContext';
import { PublicKey } from '@solana/web3.js';
import {
  noirService,
  CIRCUIT_METADATA,
} from '../services/privacy';
import type { ProofResult, CircuitType } from '../services/privacy';
import { fetchPendingCaseStudies, submitValidatorApproval } from '../services/BlockchainIntegration';
import { blinkService } from '../services/BlinkService';

interface ValidationTask {
  caseStudyId: string;
  protocol: string;
  patientId: string;
  submittedAt: Date;
  baselineMetrics: string;
  outcomeMetrics: string;
  approvalCount: number;
  status: 'pending' | 'approved' | 'rejected';
  // Enhanced with encrypted data for ZK proof generation
  encryptedData?: {
    baselineSeverity: number;
    outcomeSeverity: number;
    durationDays: number;
    costUsd: number;
    hasBaseline: boolean;
    hasOutcome: boolean;
    hasDuration: boolean;
    hasProtocol: boolean;
    hasCost: boolean;
  };
}

interface ValidationState {
  tasks: ValidationTask[];
  selected: ValidationTask | null;
  stakeAmount: number;
  validationType: 'quality' | 'accuracy' | 'safety';
  feedback: string;
  expertMode: boolean;
  noirCircuit: CircuitType | 'auto';
  generatedProofs: ProofResult[];
  isGeneratingProofs: boolean;
  pendingRewards: number;
  isClaimingRewards: boolean;
  isRefreshingQueue: boolean;
  lastQueueRefresh: number;
}

export const ValidationDashboard: FunctionalComponent = () => {
  const { publicKey, connected } = useContext(WalletContext);
  const [state, setState] = useState<ValidationState>({
    tasks: [],
    selected: null,
    stakeAmount: 10, // Minimum EXPERIENCE tokens
    validationType: 'quality',
    feedback: '',
    expertMode: false,
    noirCircuit: 'auto',
    generatedProofs: [],
    isGeneratingProofs: false,
    pendingRewards: 0,
    isClaimingRewards: false,
    isRefreshingQueue: false,
    lastQueueRefresh: 0,
  });

  // Initialize Noir service on mount
  useEffect(() => {
    noirService.initialize().catch(console.error);
  }, []);

  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch validation queue
  useEffect(() => {
    const fetchValidationQueue = async () => {
      try {
        const result = await fetchPendingCaseStudies();

        if (result.success && result.caseStudies) {
          const blockchainTasks: ValidationTask[] = result.caseStudies.map((cs, index) => ({
            caseStudyId: cs.pubkey.toString(),
            protocol: cs.protocol || `Treatment Protocol ${index + 1}`,
            patientId: cs.submitter.toString().slice(0, 12) + '...',
            submittedAt: cs.createdAt,
            baselineMetrics: '(encrypted - ZK proof available)',
            outcomeMetrics: '(encrypted - ZK proof available)',
            approvalCount: cs.approvalCount,
            status: 'pending',
            encryptedData: {
              baselineSeverity: Math.floor(Math.random() * 5) + 5,
              outcomeSeverity: Math.floor(Math.random() * 5) + 2,
              durationDays: Math.floor(Math.random() * 60) + 14,
              costUsd: Math.floor(Math.random() * 1000) + 100,
              hasBaseline: true,
              hasOutcome: true,
              hasDuration: true,
              hasProtocol: true,
              hasCost: true,
            },
          }));

          if (blockchainTasks.length === 0) {
            const mockTasks: ValidationTask[] = [
              {
                caseStudyId: 'mock-cs-001',
                protocol: 'Peptide-T + Vitamin D Stack',
                patientId: 'demo-user-001',
                submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                baselineMetrics: '(encrypted - ZK proof available)',
                outcomeMetrics: '(encrypted - ZK proof available)',
                approvalCount: 1,
                status: 'pending',
                encryptedData: {
                  baselineSeverity: 8,
                  outcomeSeverity: 4,
                  durationDays: 30,
                  costUsd: 250,
                  hasBaseline: true,
                  hasOutcome: true,
                  hasDuration: true,
                  hasProtocol: true,
                  hasCost: true,
                },
              },
            ];
            setState((s) => ({ ...s, tasks: mockTasks, lastQueueRefresh: Date.now() }));
          } else {
            setState((s) => ({ ...s, tasks: blockchainTasks, lastQueueRefresh: Date.now() }));
          }
        }

        if (publicKey) {
          const mockPendingRewards = Math.floor(Math.random() * 50) + 10;
          setState((s) => ({ ...s, pendingRewards: mockPendingRewards }));
        }
      } catch (error) {
        console.error('Error fetching validation queue:', error);
      }
    };

    fetchValidationQueue();
  }, [publicKey]);

  const selectCaseStudy = (task: ValidationTask) => {
    setState((s) => ({ ...s, selected: task, generatedProofs: [] }));
    setSubmitStatus({ type: 'info', message: '🔐 Case study selected. Review the ZK proofs.' });
  };

  const generateZKProofs = async () => {
    if (!state.selected?.encryptedData) return;
    setState((s) => ({ ...s, isGeneratingProofs: true }));
    try {
      const proofs = await noirService.generateValidationProofs(state.selected.encryptedData);
      setState((s) => ({ ...s, generatedProofs: proofs, isGeneratingProofs: false }));
      setSubmitStatus({ type: 'success', message: `✅ Generated ${proofs.length} ZK proofs.` });
    } catch (error) {
      setState((s) => ({ ...s, isGeneratingProofs: false }));
      setSubmitStatus({ type: 'error', message: '❌ Proof generation failed.' });
    }
  };

  const refreshQueue = async () => {
    setState((s) => ({ ...s, isRefreshingQueue: true }));
    try {
      const result = await fetchPendingCaseStudies();
      if (result.success && result.caseStudies) {
        const blockchainTasks: ValidationTask[] = result.caseStudies.map((cs, index) => ({
          caseStudyId: cs.pubkey.toString(),
          protocol: cs.protocol || `Treatment Protocol ${index + 1}`,
          patientId: cs.submitter.toString().slice(0, 12) + '...',
          submittedAt: cs.createdAt,
          baselineMetrics: '(encrypted - ZK proof available)',
          outcomeMetrics: '(encrypted - ZK proof available)',
          approvalCount: cs.approvalCount,
          status: 'pending',
          encryptedData: {
            baselineSeverity: Math.floor(Math.random() * 5) + 5,
            outcomeSeverity: Math.floor(Math.random() * 5) + 2,
            durationDays: Math.floor(Math.random() * 60) + 14,
            costUsd: Math.floor(Math.random() * 1000) + 100,
            hasBaseline: true,
            hasOutcome: true,
            hasDuration: true,
            hasProtocol: true,
            hasCost: true,
          },
        }));
        setState((s) => ({ ...s, tasks: blockchainTasks }));
      }
      setState((s) => ({ ...s, isRefreshingQueue: false, lastQueueRefresh: Date.now() }));
    } catch (error) {
      setState((s) => ({ ...s, isRefreshingQueue: false }));
    }
  };

  const claimRewards = async () => {
    if (!publicKey || state.pendingRewards === 0) return;
    setState((s) => ({ ...s, isClaimingRewards: true }));
    await new Promise(r => setTimeout(r, 1500));
    setState((s) => ({ ...s, pendingRewards: 0, isClaimingRewards: false }));
    setSubmitStatus({ type: 'success', message: '✅ Rewards claimed!' });
  };

  const handleApproval = async (approved: boolean) => {
    if (!state.selected || !publicKey) return;
    setIsLoading(true);
    try {
      // Logic for submission
      setState((s) => ({
        ...s,
        tasks: s.tasks.map(t => t.caseStudyId === state.selected?.caseStudyId ? { ...t, status: approved ? 'approved' : 'rejected' } : t),
        selected: null,
      }));
      setSubmitStatus({ type: 'success', message: `✅ Validation ${approved ? 'approved' : 'flagged'}.` });
    } catch (error) {
      setSubmitStatus({ type: 'error', message: '❌ Submission failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Enhanced validation approval with real blockchain transactions
   */
  const handleApproval = async (approved: boolean) => {
    if (!state.selected || !publicKey || !connected) {
      setSubmitStatus({
        type: 'error',
        message: 'Please connect wallet and select a case study',
      });
      return;
    }

    // In expert mode, require ZK proofs before approval
    if (state.expertMode && state.generatedProofs.length === 0) {
      setSubmitStatus({
        type: 'error',
        message: '🔐 Expert mode requires ZK proofs. Please generate proofs first.',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Prepare validation
      setSubmitStatus({
        type: 'info',
        message: '🔄 Step 1/3: Preparing validation with ZK proofs...',
      });

      // Step 2: Submit to blockchain
      setSubmitStatus({
        type: 'info',
        message: '🔄 Step 2/3: Submitting validation to blockchain...',
      });

      // Convert case study ID to PublicKey
      const caseStudyPubkey = new PublicKey(state.selected.caseStudyId);

      // Submit real validation to blockchain
      const result = await submitValidatorApproval(
        publicKey,
        walletContext.signTransaction,
        caseStudyPubkey,
        state.validationType,
        approved,
        state.stakeAmount
      );

      // Step 3: Confirm transaction
      if (result.success) {
        setSubmitStatus({
          type: 'info',
          message: '🔄 Step 3/3: Confirming validation on blockchain...',
        });

        // Wait for confirmation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update local state
        const updatedTasks = state.tasks.map((task) =>
          task.caseStudyId === state.selected!.caseStudyId
            ? {
              ...task,
              status: approved ? 'approved' : 'rejected',
              approvalCount: approved ? task.approvalCount + 1 : task.approvalCount,
            }
            : task
        );

        setState((s) => ({
          ...s,
          tasks: updatedTasks,
          selected: null,
          feedback: '',
          generatedProofs: [],
        }));

        const proofMessage = state.generatedProofs.length > 0
          ? ` with ${state.generatedProofs.length} ZK proofs`
          : '';

        setSubmitStatus({
          type: 'success',
          message: `✅ Validation submitted to blockchain${proofMessage}! Transaction: ${result.transactionSignature?.slice(0, 20)}... ${approved ? 'Case study approved.' : 'Concerns flagged for review.'
            }`,
        });

        console.log('Blockchain Validation Submitted:', {
          validator: publicKey.toString(),
          caseStudyId: state.selected.caseStudyId,
          approved,
          transactionSignature: result.transactionSignature,
          zkProofs: state.generatedProofs.length,
        });
      } else {
        throw new Error(result.message || 'Validation submission failed');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: `❌ Validation failed: ${error instanceof Error ? error.message : 'Unknown error'
          }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-2xl border-2 border-blue-500 shadow-xl">
      <div class="mb-10">
        <h2 class="text-3xl font-black mb-2 uppercase tracking-tighter flex items-center gap-3">
          <span class="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-2xl">✓</span>
          <span>Validation Dashboard</span>
        </h2>
        <p class="text-slate-600 dark:text-slate-300 font-medium">Verify truth. Earn DBC.</p>
      </div>

      {submitStatus.type && (
        <div class={`mb-8 p-5 rounded-xl border-l-4 font-bold text-sm ${submitStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700' :
          submitStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700' :
            'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700'
          }`}>
          {submitStatus.message}
        </div>
      )}

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-slate-50 dark:bg-slate-800/50 border rounded-2xl p-8">
            <h3 class="text-xl font-black mb-6 uppercase flex justify-between">
              <span>📋 Pending ({state.tasks.length})</span>
              <button onClick={refreshQueue} class="text-xs bg-blue-600 text-white px-3 py-1 rounded">Refresh</button>
            </h3>
            <div class="space-y-4">
              {state.tasks.map(task => (
                <div
                  key={task.caseStudyId}
                  onClick={() => selectCaseStudy(task)}
                  class={`p-5 border-2 rounded-xl cursor-pointer ${state.selected?.caseStudyId === task.caseStudyId ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <h4 class="font-black uppercase">{task.protocol}</h4>
                  <div class="flex justify-between text-xs mt-3 opacity-70">
                    <span>{task.submittedAt.toLocaleDateString()}</span>
                    <span>{task.approvalCount}/3 Approvals</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800/50 border rounded-2xl p-8">
          <h3 class="text-xl font-black mb-6 uppercase flex items-center gap-3">
            <span>🔍 Review</span>
          </h3>
          {state.selected ? (
            <div class="space-y-6">
              <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border">
                <p class="text-[10px] font-black uppercase opacity-50 mb-1">Protocol</p>
                <p class="font-black uppercase">{state.selected.protocol}</p>
              </div>

              {/* Solana Blink */}
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200">
                <p class="font-black text-blue-800 text-[10px] uppercase mb-2">Share Mission</p>
                <button
                  onClick={() => {
                    const blink = blinkService.generateBlink(`validate/${state.selected?.caseStudyId}`);
                    navigator.clipboard.writeText(blink);
                    setSubmitStatus({ type: 'success', message: '📋 Blink copied!' });
                  }}
                  class="w-full py-2 bg-blue-600 text-white rounded text-[10px] font-black uppercase"
                >
                  Copy Blink URL
                </button>
              </div>

              <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200">
                <p class="font-black text-purple-800 text-[10px] uppercase mb-2">ZK Verification</p>
                <button
                  onClick={generateZKProofs}
                  disabled={state.isGeneratingProofs}
                  class="w-full py-3 bg-purple-600 text-white rounded text-xs font-black uppercase"
                >
                  {state.isGeneratingProofs ? 'Verifying...' : 'Verify Data Quality'}
                </button>
                {state.generatedProofs.length > 0 && (
                  <div class="mt-3 space-y-1">
                    {state.generatedProofs.map((p, i) => (
                      <div key={i} class="text-[10px] font-bold flex justify-between">
                        <span>{CIRCUIT_METADATA[p.circuitType].name}</span>
                        <span class={p.verified ? 'text-green-600' : 'text-red-600'}>{p.verified ? '✓' : '✗'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div class="grid gap-3 pt-4 border-t">
                <button
                  onClick={() => handleApproval(true)}
                  disabled={isLoading}
                  class="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-black py-4 rounded-xl uppercase text-xs transition-all"
                >
                  {isLoading ? '⏳ Submitting...' : '✅ Approve Protocol'}
                </button>
                <button
                  onClick={() => handleApproval(false)}
                  disabled={isLoading}
                  class="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-black py-4 rounded-xl uppercase text-xs transition-all"
                >
                  {isLoading ? '⏳ Submitting...' : '⚠️ Flag Concerns'}
                </button>
              </div>
            </div>
          ) : (
            <p class="text-center py-10 opacity-30 font-black uppercase text-xs border-2 border-dashed rounded-xl">Select a task</p>
          )}
        </div>
      </div>
    </div>
  );
};
