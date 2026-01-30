import { FunctionalComponent } from 'preact';
import { useState, useContext, useEffect } from 'preact/hooks';
import { WalletContext } from '../context/WalletContext';
import { PublicKey } from '@solana/web3.js';
import {
  noirService,
  ProofResult,
  CircuitType,
  CIRCUIT_METADATA,
} from '../services/privacy';

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

  // Fetch validation tasks (simulated with encrypted data for ZK proofs)
  useEffect(() => {
    const mockTasks: ValidationTask[] = [
      {
        caseStudyId: 'cs-001',
        protocol: 'Peptide-T + Vitamin D Stack',
        patientId: 'anon-user-001',
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
      {
        caseStudyId: 'cs-002',
        protocol: 'Medicinal Mushroom Protocol',
        patientId: 'anon-user-002',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        baselineMetrics: '(encrypted - ZK proof available)',
        outcomeMetrics: '(encrypted - ZK proof available)',
        approvalCount: 2,
        status: 'pending',
        encryptedData: {
          baselineSeverity: 7,
          outcomeSeverity: 5,
          durationDays: 45,
          costUsd: 180,
          hasBaseline: true,
          hasOutcome: true,
          hasDuration: true,
          hasProtocol: true,
          hasCost: true,
        },
      },
    ];

    setState((s) => ({ ...s, tasks: mockTasks }));
  }, []);

  const selectCaseStudy = (task: ValidationTask) => {
    setState((s) => ({ 
      ...s, 
      selected: task,
      generatedProofs: [], // Clear previous proofs
    }));
    setSubmitStatus({ 
      type: 'info', 
      message: task.encryptedData 
        ? '🔐 Case study selected. Encrypted data available for ZK proof generation.'
        : 'Case study selected. Review the encrypted data.'
    });
  };

  /**
   * Generate ZK proofs for the selected case study
   * Uses Noir circuits to prove properties without revealing data
   */
  const generateZKProofs = async () => {
    if (!state.selected?.encryptedData) {
      setSubmitStatus({
        type: 'error',
        message: 'No encrypted data available for proof generation',
      });
      return;
    }

    setState((s) => ({ ...s, isGeneratingProofs: true }));
    setSubmitStatus({
      type: 'info',
      message: '🔐 Generating ZK proofs... This may take a few seconds.',
    });

    try {
      const proofs = await noirService.generateValidationProofs(state.selected.encryptedData);
      
      setState((s) => ({
        ...s,
        generatedProofs: proofs,
        isGeneratingProofs: false,
      }));

      const verifiedCount = proofs.filter(p => p.verified).length;
      setSubmitStatus({
        type: 'success',
        message: `✅ Generated ${proofs.length} ZK proofs (${verifiedCount} verified). Ready for blockchain submission.`,
      });

      console.log('Generated ZK Proofs:', proofs);
    } catch (error) {
      setState((s) => ({ ...s, isGeneratingProofs: false }));
      setSubmitStatus({
        type: 'error',
        message: `❌ Proof generation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    }
  };

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
      // Prepare validation data with ZK proofs
      const validationData = {
        validatorAddress: publicKey.toString(),
        caseStudyId: state.selected.caseStudyId,
        validationType: state.validationType,
        approved,
        stakeAmount: state.stakeAmount,
        feedback: state.feedback,
        timestamp: new Date().toISOString(),
        zkProofs: state.generatedProofs.map(p => ({
          circuitType: p.circuitType,
          verified: p.verified,
          publicInputs: p.publicInputs,
          proofHash: Array.from(p.proof.slice(0, 32)), // First 32 bytes as hash
        })),
      };

      console.log('Validator Approval with ZK Proofs:', validationData);

      // Update case study status
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
        message: `✅ Validation submitted${proofMessage}! You staked ${state.stakeAmount} EXPERIENCE tokens. ${
          approved ? 'Case study approved.' : 'Concerns flagged for review.'
        }`,
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: `❌ Validation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-2xl border-2 border-blue-500 shadow-xl transition-all duration-300">
      {/* Header */}
      <div class="mb-10">
        <h2 class="text-3xl font-black mb-2 uppercase tracking-tighter flex items-center gap-3">
          <span class="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-2xl">✓</span>
          <span>Validation Dashboard</span>
        </h2>
        <p class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          Review case studies and stake EXPERIENCE tokens. Accurate validators accumulate tokens and reputation.
        </p>
        {publicKey && (
          <div class="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg inline-flex items-center gap-2 mt-4 border border-blue-100 dark:border-blue-800/50">
            <span class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Validator</span>
            <span class="font-mono text-sm text-blue-700 dark:text-blue-300 font-bold">{publicKey.toString().slice(0, 20)}...</span>
          </div>
        )}
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

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Pending Validations */}
        <div class="lg:col-span-2">
          <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-inner">
            <h3 class="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-wider text-slate-800 dark:text-white">
              <span class="text-2xl bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm">📋</span>
              <span>Pending Validations ({state.tasks.length})</span>
            </h3>

            <div class="space-y-4">
              {state.tasks.length === 0 ? (
                <p class="text-slate-500 dark:text-slate-400 font-medium italic">No pending validations. Check back later.</p>
              ) : (
                state.tasks.map((task) => (
                  <div
                    key={task.caseStudyId}
                    class={`p-5 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-[1.01] shadow-sm ${
                      state.selected?.caseStudyId === task.caseStudyId
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800'
                    }`}
                    onClick={() => selectCaseStudy(task)}
                  >
                    <div class="flex justify-between items-start mb-3">
                      <div>
                        <h4 class="font-black text-slate-900 dark:text-blue-300 uppercase tracking-tight">{task.protocol}</h4>
                        <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                          ID: {task.caseStudyId}
                        </p>
                      </div>
                      <span
                        class={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${
                          task.status === 'approved'
                            ? 'bg-green-500 text-white'
                            : task.status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <div class="text-xs font-medium text-slate-600 dark:text-slate-400 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div class="flex justify-between">
                        <span class="uppercase tracking-tighter opacity-70">Submitted:</span>
                        <span class="font-bold text-slate-800 dark:text-slate-300">{task.submittedAt.toLocaleDateString()}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="uppercase tracking-tighter opacity-70">Approvals:</span>
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-blue-600 dark:text-blue-400">{task.approvalCount}/3</span>
                          <span class="font-mono text-xs opacity-30 dark:opacity-50 tracking-tight">
                            {'█'.repeat(task.approvalCount)}
                            {'░'.repeat(3 - task.approvalCount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Validation Form */}
        <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-inner">
          <h3 class="text-xl font-black mb-6 uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-3">
            <span class="text-2xl bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm">🔍</span>
            Review
          </h3>

          {!state.selected ? (
            <div class="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Select a case study</p>
            </div>
          ) : (
            <div class="space-y-6 animate-fadeIn">
              {/* Protocol Info */}
              <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Protocol</p>
                <p class="font-black text-slate-900 dark:text-white uppercase tracking-tight">{state.selected.protocol}</p>
              </div>

              {/* Validation Type */}
              <div>
                <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2 ml-1">Validation Type</label>
                <select
                  class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-bold outline-none focus:border-brand transition-all shadow-sm"
                  value={state.validationType}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      validationType: (e.target as HTMLSelectElement).value as any,
                    }))
                  }
                >
                  <option value="quality">Quality Check</option>
                  <option value="accuracy">Accuracy Verification</option>
                  <option value="safety">Safety Review</option>
                </select>
              </div>

              {/* Expert Mode Toggle */}
              <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked={state.expertMode}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        expertMode: (e.target as HTMLInputElement).checked,
                      }))
                    }
                  />
                  <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {state.expertMode ? '🛠️ Expert Mode' : '🔒 Standard'}
                  </span>
                </label>
              </div>

              {/* Expert Mode Features */}
              {state.expertMode && (
                <div class="space-y-4 animate-slideIn">
                  {/* ZK Proof Generation */}
                  <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50">
                    <div class="flex justify-between items-center mb-3">
                      <label class="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                        🔐 ZK Proof Generation
                      </label>
                      {state.generatedProofs.length > 0 && (
                        <span class="text-[10px] font-black text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
                          {state.generatedProofs.filter(p => p.verified).length}/{state.generatedProofs.length} Verified
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={generateZKProofs}
                      disabled={state.isGeneratingProofs || !state.selected.encryptedData}
                      class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-black py-3 rounded-lg shadow-md transition-all text-xs uppercase tracking-widest mb-3"
                    >
                      {state.isGeneratingProofs 
                        ? '⏳ Generating Proofs...' 
                        : state.generatedProofs.length > 0
                          ? '🔄 Regenerate Proofs'
                          : '🔐 Generate ZK Proofs'
                      }
                    </button>
                    
                    {!state.selected.encryptedData && (
                      <p class="text-[10px] text-red-600 dark:text-red-400 font-bold">
                        ⚠️ No encrypted data available for this case study
                      </p>
                    )}
                    
                    {/* Generated Proofs List */}
                    {state.generatedProofs.length > 0 && (
                      <div class="space-y-2 mt-3">
                        {state.generatedProofs.map((proof, idx) => (
                          <div 
                            key={idx}
                            class={`p-2 rounded-lg text-[10px] font-bold flex justify-between items-center ${
                              proof.verified 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}
                          >
                            <span>{CIRCUIT_METADATA[proof.circuitType].name}</span>
                            <span>{proof.verified ? '✓ Verified' : '✗ Failed'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Circuit Selection */}
                  <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <label class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">Noir Circuit</label>
                    <select
                      class="w-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                      value={state.noirCircuit}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          noirCircuit: (e.target as HTMLSelectElement).value as CircuitType | 'auto',
                        }))
                      }
                    >
                      <option value="auto">Auto (All Circuits)</option>
                      <option value="symptom_improvement">Symptom Improvement</option>
                      <option value="duration_verification">Duration Verification</option>
                      <option value="data_completeness">Data Completeness</option>
                      <option value="cost_range">Cost Range</option>
                      <option value="accuracy-v2">Accuracy Circuit v2</option>
                      <option value="safety-v1">Safety Circuit v1</option>
                    </select>
                  </div>

                  {/* MPC Threshold Adjustment */}
                  <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/50 flex justify-between items-center">
                    <div class="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">MPC Threshold</div>
                    <span class="text-xs font-black text-green-800 dark:text-green-200 bg-white/50 dark:bg-black/20 px-2 py-1 rounded">3/5 Committee</span>
                  </div>
                </div>
              )}

              {/* Stake Amount */}
              <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                  <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">XP Stake</label>
                  <span class="text-lg font-black text-brand tracking-tighter">{state.stakeAmount} XP</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  class="w-full accent-brand"
                  value={state.stakeAmount}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      stakeAmount: parseInt((e.target as HTMLInputElement).value),
                    }))
                  }
                />
              </div>

              {/* Feedback */}
              <div>
                <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2 ml-1">Feedback (Optional)</label>
                <textarea
                  class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-medium h-24 resize-none outline-none focus:border-brand shadow-sm"
                  placeholder="Any concerns or observations?"
                  value={state.feedback}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      feedback: (e.target as HTMLTextAreaElement).value,
                    }))
                  }
                />
              </div>

              {/* Action Buttons */}
              <div class="grid gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  class="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
                  onClick={() => handleApproval(true)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : '✓ Approve Protocol'}
                </button>
                <button
                  class="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
                  onClick={() => handleApproval(false)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : '✗ Flag Concerns'}
                </button>
              </div>

              {/* Expert Mode ZK Proof Notice */}
              {state.expertMode && state.generatedProofs.length === 0 && (
                <div class="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-4">
                  <p class="font-black text-purple-800 dark:text-purple-300 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span>🔐</span>
                    <span>ZK Proof Required</span>
                  </p>
                  <p class="text-[10px] font-bold text-purple-700 dark:text-purple-400/80">
                    Expert mode requires generating ZK proofs before validation. 
                    Click "Generate ZK Proofs" above to prove data quality without revealing sensitive health information.
                  </p>
                </div>
              )}

              {/* Risk Info */}
              <div class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800/50 rounded-xl p-4">
                <p class="font-black text-yellow-800 dark:text-yellow-300 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Validator Responsibility</span>
                </p>
                <ul class="text-[10px] font-bold text-yellow-700 dark:text-yellow-400/80 space-y-1 ml-1">
                  <li class="flex items-start gap-2"><span>•</span> <span>False approvals = 50% token loss</span></li>
                  <li class="flex items-start gap-2"><span>•</span> <span>Verify timeline consistency</span></li>
                  <li class="flex items-start gap-2"><span>•</span> <span>Check metrics make sense</span></li>
                  {state.expertMode && (
                    <li class="flex items-start gap-2 text-purple-700 dark:text-purple-400">
                      <span>•</span> 
                      <span>ZK proofs validate without decrypting patient data</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Sponsor Stack */}
      <div class="mt-12 p-8 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl shadow-sm">
        <p class="font-black text-purple-800 dark:text-purple-300 mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
          <span class="text-xl">🎯</span>
          <span>Privacy Sponsor Tech Stack</span>
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900/50">
            <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500 shrink-0"></span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300"><strong>Light Protocol:</strong> ZK compression for scalable private state</span>
          </div>
          <div class="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900/50">
            <span class="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-sm shadow-blue-500 shrink-0"></span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300"><strong>Noir/Aztec:</strong> ZK-SNARK circuits for validation proofs</span>
          </div>
          <div class="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900/50">
            <span class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse shadow-sm shadow-yellow-500 shrink-0"></span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300"><strong>Arcium MPC:</strong> Threshold decryption for committees</span>
          </div>
          <div class="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900/50">
            <span class="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-sm shadow-purple-500 shrink-0"></span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300"><strong>Privacy Cash:</strong> Confidential token transfers</span>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div class="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl flex gap-4 items-center">
        <div class="text-3xl">🔐</div>
        <div>
          <p class="font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest text-xs mb-1">Privacy Guarantee</p>
          <p class="text-xs font-medium text-blue-700 dark:text-slate-400 leading-relaxed">
            Encrypted case study data is only visible if the patient grants you access. You cannot
            see raw health metrics without explicit permission on the blockchain.
          </p>
        </div>
      </div>
    </div>
  );
};
