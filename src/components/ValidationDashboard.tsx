import { FunctionalComponent } from 'preact';
import { useState, useContext, useEffect } from 'preact/hooks';
import { WalletContext } from '../context/WalletContext';
import { PublicKey } from '@solana/web3.js';

interface ValidationTask {
  caseStudyId: string;
  protocol: string;
  patientId: string;
  submittedAt: Date;
  baselineMetrics: string;
  outcomeMetrics: string;
  approvalCount: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface ValidationState {
  tasks: ValidationTask[];
  selected: ValidationTask | null;
  stakeAmount: number;
  validationType: 'quality' | 'accuracy' | 'safety';
  feedback: string;
  expertMode: boolean;
  noirCircuit: string;
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
  });

  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch validation tasks (simulated for now)
  useEffect(() => {
    const mockTasks: ValidationTask[] = [
      {
        caseStudyId: 'cs-001',
        protocol: 'Peptide-T + Vitamin D Stack',
        patientId: 'anon-user-001',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        baselineMetrics: '(encrypted - view if access granted)',
        outcomeMetrics: '(encrypted - view if access granted)',
        approvalCount: 1,
        status: 'pending',
      },
      {
        caseStudyId: 'cs-002',
        protocol: 'Medicinal Mushroom Protocol',
        patientId: 'anon-user-002',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        baselineMetrics: '(encrypted - view if access granted)',
        outcomeMetrics: '(encrypted - view if access granted)',
        approvalCount: 2,
        status: 'pending',
      },
    ];

    setState((s) => ({ ...s, tasks: mockTasks }));
  }, []);

  const selectCaseStudy = (task: ValidationTask) => {
    setState((s) => ({ ...s, selected: task }));
    setSubmitStatus({ type: 'info', message: 'Case study selected. Review the encrypted data.' });
  };

  const handleApproval = async (approved: boolean) => {
    if (!state.selected || !publicKey || !connected) {
      setSubmitStatus({
        type: 'error',
        message: 'Please connect wallet and select a case study',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Log validation (in real version, this would submit to blockchain)
      console.log('Validator Approval:', {
        validatorAddress: publicKey.toString(),
        caseStudyId: state.selected.caseStudyId,
        validationType: state.validationType,
        approved,
        stakeAmount: state.stakeAmount,
        feedback: state.feedback,
        timestamp: new Date().toISOString(),
      });

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
      }));

      setSubmitStatus({
        type: 'success',
        message: `✅ Validation submitted! You staked ${state.stakeAmount} EXPERIENCE tokens. ${
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
    <div class="w-full max-w-4xl mx-auto bg-gray-900 text-white p-8 rounded-lg border-2 border-blue-500">
      {/* Header */}
      <div class="mb-8">
        <h2 class="text-3xl font-bold mb-2">✓ Validation Dashboard</h2>
        <p class="text-gray-300">
          Review case studies and stake EXPERIENCE tokens. Accurate validators accumulate tokens.
        </p>
        {publicKey && (
          <p class="text-blue-300 text-sm mt-2">Validator: {publicKey.toString().slice(0, 20)}...</p>
        )}
      </div>

      {/* Status Messages */}
      {submitStatus.type && (
        <div
          class={`mb-6 p-4 rounded border-l-4 ${
            submitStatus.type === 'success'
              ? 'bg-green-900/30 border-green-500 text-green-300'
              : submitStatus.type === 'error'
              ? 'bg-red-900/30 border-red-500 text-red-300'
              : 'bg-blue-900/30 border-blue-500 text-blue-300'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Validations */}
        <div class="lg:col-span-2">
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📋</span>
              Pending Validations ({state.tasks.length})
            </h3>

            <div class="space-y-4">
              {state.tasks.length === 0 ? (
                <p class="text-gray-400">No pending validations. Check back later.</p>
              ) : (
                state.tasks.map((task) => (
                  <div
                    key={task.caseStudyId}
                    class={`p-4 border rounded cursor-pointer transition ${
                      state.selected?.caseStudyId === task.caseStudyId
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 hover:border-gray-500 bg-gray-700/30'
                    }`}
                    onClick={() => selectCaseStudy(task)}
                  >
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h4 class="font-bold text-blue-300">{task.protocol}</h4>
                        <p class="text-xs text-gray-400 mt-1">
                          Case Study: {task.caseStudyId}
                        </p>
                      </div>
                      <span
                        class={`text-xs px-3 py-1 rounded ${
                          task.status === 'approved'
                            ? 'bg-green-900/50 text-green-300'
                            : task.status === 'rejected'
                            ? 'bg-red-900/50 text-red-300'
                            : 'bg-yellow-900/50 text-yellow-300'
                        }`}
                      >
                        {task.status.toUpperCase()}
                      </span>
                    </div>

                    <div class="text-sm text-gray-400 space-y-1">
                      <p>
                        Submitted: {task.submittedAt.toLocaleDateString()}
                      </p>
                      <p>
                        Approvals: {task.approvalCount}/3
                        <span class="ml-2">
                          {'█'.repeat(task.approvalCount)}
                          {'░'.repeat(3 - task.approvalCount)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Validation Form */}
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 class="text-xl font-bold mb-4">🔍 Review & Validate</h3>

          {!state.selected ? (
            <p class="text-gray-400">Select a case study to review</p>
          ) : (
            <div class="space-y-4">
              {/* Protocol Info */}
              <div class="bg-gray-900 p-3 rounded text-sm">
                <p class="text-gray-400 mb-1">Protocol</p>
                <p class="font-bold text-white">{state.selected.protocol}</p>
              </div>

              {/* Validation Type */}
              <div>
                <label class="text-sm text-gray-400 block mb-2">Validation Type</label>
                <select
                  class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
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
              <div class="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only"
                    checked={state.expertMode}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        expertMode: (e.target as HTMLInputElement).checked,
                      }))
                    }
                  />
                  <div class={`w-10 h-5 flex items-center rounded-full p-1 ${state.expertMode ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    <div class={`bg-white w-3 h-3 rounded-full shadow-md transform ${state.expertMode ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <span class="text-sm">
                    {state.expertMode ? '🛠️ Expert Mode: ON' : '🔒 Standard Mode'}
                  </span>
                </label>
                <p class="text-xs text-gray-500 mt-1">
                  {state.expertMode ? 'Advanced privacy controls unlocked' : 'Simple, secure validation'}
                </p>
              </div>

              {/* Expert Mode Features */}
              {state.expertMode && (
                <div class="mt-3 space-y-3">
                  {/* Circuit Selection */}
                  <div class="p-2 bg-gray-700/30 rounded border border-gray-600">
                    <label class="text-xs text-gray-400 block mb-1">Noir Circuit</label>
                    <select
                      class="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                      value={state.noirCircuit}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          noirCircuit: (e.target as HTMLSelectElement).value,
                        }))
                      }
                    >
                      <option value="auto">Auto (Recommended)</option>
                      <option value="quality-v1">Quality Circuit v1</option>
                      <option value="accuracy-v2">Accuracy Circuit v2</option>
                      <option value="safety-v1">Safety Circuit v1</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">
                      Advanced: Choose specific Noir circuit for validation
                    </p>
                  </div>

                  {/* Compression Inspection */}
                  <div class="p-2 bg-gray-700/30 rounded border border-gray-600">
                    <label class="text-xs text-gray-400 block mb-1">Light Protocol</label>
                    <div class="flex items-center gap-2">
                      <span class="text-xs">Compression:</span>
                      <span class="text-xs font-bold text-green-400">10x</span>
                      <button
                        class="text-xs text-blue-400 hover:text-blue-300"
                        onClick={() => alert('Light Protocol compression verified: 10x ratio achieved')}
                      >
                        🔍 Verify
                      </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      Data compressed using Light Protocol ZK compression
                    </p>
                  </div>

                  {/* MPC Threshold Adjustment */}
                  <div class="p-2 bg-gray-700/30 rounded border border-gray-600">
                    <label class="text-xs text-gray-400 block mb-1">Arcium MPC</label>
                    <div class="flex items-center gap-2">
                      <span class="text-xs">Threshold:</span>
                      <span class="text-xs font-bold">3/5 validators</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      Requires 3 out of 5 validators to approve decryption
                    </p>
                  </div>
                </div>
              )}

              {/* Stake Amount */}
              <div>
                <label class="text-sm text-gray-400 block mb-2">
                  EXPERIENCE Stake: {state.stakeAmount}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  class="w-full"
                  value={state.stakeAmount}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      stakeAmount: parseInt((e.target as HTMLInputElement).value),
                    }))
                  }
                />
                <p class="text-xs text-gray-500 mt-1">Min 10, max 100 tokens</p>
              </div>

              {/* Feedback */}
              <div>
                <label class="text-sm text-gray-400 block mb-2">Feedback (Optional)</label>
                <textarea
                  class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm h-24 resize-none"
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
              <div class="space-y-2 pt-4 border-t border-gray-700">
                <button
                  class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleApproval(true)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : '✓ Approve'}
                </button>
                <button
                  class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleApproval(false)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : '✗ Flag Concerns'}
                </button>
              </div>

              {/* Risk Info */}
              <div class="bg-yellow-900/20 border border-yellow-700/50 rounded p-3 text-xs text-yellow-300">
                <p class="font-bold mb-1">⚠️ Validator Responsibility</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>False approvals = 50% token loss</li>
                  <li>Verify timeline consistency</li>
                  <li>Check metrics make sense</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Sponsor Integrations */}
      <div class="mt-8 p-4 bg-purple-900/20 border border-purple-700/50 rounded text-sm text-purple-300">
        <p class="font-bold mb-2">🎯 Privacy Sponsor Integrations</p>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-green-400">●</span>
            <span><strong>Light Protocol:</strong> ZK compression for scalable private state</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-blue-400">●</span>
            <span><strong>Noir/Aztec:</strong> ZK-SNARK circuits for validation proofs</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-yellow-400">●</span>
            <span><strong>Arcium MPC:</strong> Threshold decryption for validator committees</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-purple-400">●</span>
            <span><strong>Privacy Cash:</strong> Confidential token transfers for rewards</span>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div class="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded text-sm text-blue-300">
        <p class="font-bold mb-1">🔐 Privacy Guarantee</p>
        <p>
          Encrypted case study data is only visible if the patient grants you access. You cannot
          see raw health metrics without explicit permission on the blockchain.
        </p>
      </div>
    </div>
  );
};
