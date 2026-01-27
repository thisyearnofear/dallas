import { FunctionalComponent } from 'preact';
import { useState, useContext, useCallback } from 'preact/hooks';
import { WalletContext } from '../context/WalletContext';
import { deriveEncryptionKey, encryptHealthData } from '../utils/encryption';
import { submitCaseStudyToBlockchain } from '../services/BlockchainIntegration';
import { validateBlockchainConfig } from '../config/solana';
import { SubmissionConsentCheckboxes } from './SharedUIComponents';
import { LEGAL_CONFIG } from '../config/legal';

interface HealthMetrics {
  symptomSeverity: number; // 1-10
  energyLevel: number; // 1-10
  biomarkers?: Record<string, string | number>;
  notes?: string;
}

interface SideEffect {
  name: string;
  severity: number; // 1-10
  dayOccurred: number;
  resolved: boolean;
}

interface CaseStudyFormData {
  treatmentProtocol: string;
  durationDays: number;
  costUSD: number;
  baselineMetrics: HealthMetrics;
  outcomeMetrics: HealthMetrics;
  sideEffects: SideEffect[];
  context?: string;
}

export const EncryptedCaseStudyForm: FunctionalComponent = () => {
  const walletContext = useContext(WalletContext);
  const { publicKey, signMessage } = walletContext;
  const [encryptionKey, setEncryptionKey] = useState<Uint8Array | null>(null);
  const [keyDeriving, setKeyDeriving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockchainConfigValid, setBlockchainConfigValid] = useState(false);

  // Privacy sponsor options
  const [privacyOptions, setPrivacyOptions] = useState({
    usePrivacyCash: true,
    useShadowWire: false,
    compressionRatio: 5,
  });

  const [formData, setFormData] = useState<CaseStudyFormData>({
    treatmentProtocol: '',
    durationDays: 8,
    costUSD: 0,
    baselineMetrics: { symptomSeverity: 5, energyLevel: 5 },
    outcomeMetrics: { symptomSeverity: 5, energyLevel: 5 },
    sideEffects: [],
    context: '',
  });

  const [newSideEffect, setNewSideEffect] = useState<SideEffect>({
    name: '',
    severity: 1,
    dayOccurred: 1,
    resolved: false,
  });

  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const [consentGiven, setConsentGiven] = useState(false);
  const handleConsentChange = useCallback((allChecked: boolean) => {
    setConsentGiven(allChecked);
  }, []);

  // Check blockchain configuration on mount
  useState(() => {
    try {
      validateBlockchainConfig();
      setBlockchainConfigValid(true);
    } catch (error) {
      setBlockchainConfigValid(false);
      setSubmitStatus({
        type: 'error',
        message: `⚠️ Blockchain not configured: ${error instanceof Error ? error.message : 'Unknown error'}. Please deploy contracts to devnet first.`,
      });
    }
  });

  // Step 1: Derive encryption key from wallet
  const handleDeriveKey = async () => {
    if (!publicKey || !signMessage) {
      setSubmitStatus({
        type: 'error',
        message: 'Wallet not connected',
      });
      return;
    }

    setKeyDeriving(true);
    try {
      const key = await deriveEncryptionKey(publicKey, signMessage);
      setEncryptionKey(key);
      setSubmitStatus({
        type: 'success',
        message:
          '✅ Encryption key derived from your wallet. Your health data will be encrypted before leaving your device.',
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: `Failed to derive encryption key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setKeyDeriving(false);
    }
  };

  // Step 2: Encrypt and submit case study to blockchain
  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!encryptionKey) {
      setSubmitStatus({
        type: 'error',
        message: 'Please derive encryption key first',
      });
      return;
    }

    if (!blockchainConfigValid) {
      setSubmitStatus({
        type: 'error',
        message: 'Blockchain configuration invalid. Please deploy contracts first.',
      });
      return;
    }

    if (!formData.treatmentProtocol.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a treatment protocol',
      });
      return;
    }

    if (!publicKey) {
      setSubmitStatus({
        type: 'error',
        message: 'Wallet not connected',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({
      type: 'info',
      message: '🔄 Submitting to blockchain... Please approve the transaction in your wallet.',
    });

    try {
      // Submit to blockchain with privacy sponsor integrations
      const result = await submitCaseStudyToBlockchain(
        publicKey,
        walletContext.signTransaction,
        formData,
        encryptionKey,
        privacyOptions
      );

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message,
        });

        // Reset form on success
        setFormData({
          treatmentProtocol: '',
          durationDays: 8,
          costUSD: 0,
          baselineMetrics: { symptomSeverity: 5, energyLevel: 5 },
          outcomeMetrics: { symptomSeverity: 5, energyLevel: 5 },
          sideEffects: [],
          context: '',
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: `❌ Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="w-full max-w-2xl mx-auto bg-gray-900 text-white p-8 rounded-lg border-2 border-green-500">
      {/* Header */}
      <div class="mb-8">
        <h2 class="text-3xl font-bold mb-2">📋 Share Your Health Journey</h2>
        <p class="text-gray-300">
          Document your experimental treatment and share your experience with the community.
          Your data stays encrypted.
        </p>
      </div>

      {/* Status Messages */}
      {submitStatus.type && (
        <div
          class={`mb-6 p-4 rounded border-l-4 ${submitStatus.type === 'success'
            ? 'bg-green-900/30 border-green-500 text-green-300'
            : submitStatus.type === 'error'
              ? 'bg-red-900/30 border-red-500 text-red-300'
              : 'bg-blue-900/30 border-blue-500 text-blue-300'
            }`}
        >
          {submitStatus.message}
        </div>
      )}

      {/* Step 1: Encryption Key */}
      <div class="mb-8 p-6 bg-gray-800 border border-gray-700 rounded-lg">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span class="text-2xl">🔐</span>
          Step 1: Encrypt Your Data
        </h3>
        {!encryptionKey ? (
          <>
            <p class="text-gray-300 mb-4">
              First, we'll derive an encryption key from your wallet. This key stays on your
              device and controls who can see your health data.
            </p>
            <button
              onClick={handleDeriveKey}
              disabled={keyDeriving}
              class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded font-bold text-lg transition"
            >
              {keyDeriving ? '⏳ Deriving key...' : '🔐 Derive Encryption Key from Wallet'}
            </button>
          </>
        ) : (
          <div class="bg-green-900/30 border border-green-600 p-4 rounded">
            ✅ <strong>Encryption key ready</strong>
            <br />
            <span class="text-sm text-gray-400">
              Your health metrics will be encrypted with this key before submission.
            </span>
          </div>
        )}
      </div>

      {/* Step 2: Case Study Form */}
      {encryptionKey && (
        <form onSubmit={handleSubmit} class="space-y-6">
          <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              <span class="text-2xl">💊</span>
              Step 2: Your Treatment
            </h3>

            {/* Treatment Protocol */}
            <div class="mb-4">
              <label class="block text-sm font-bold mb-2">
                What treatment did you try? *
              </label>
              <input
                type="text"
                placeholder="e.g., Peptide-T + Vitamin D + NAC supplements"
                value={formData.treatmentProtocol}
                onInput={(e) =>
                  setFormData({
                    ...formData,
                    treatmentProtocol: (e.target as HTMLInputElement).value,
                  })
                }
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500"
                required
              />
            </div>

            {/* Duration & Cost */}
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-bold mb-2">Duration (days)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.durationDays}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      durationDays: parseInt((e.target as HTMLInputElement).value),
                    })
                  }
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-bold mb-2">Total Cost (USD)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.costUSD}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      costUSD: parseFloat((e.target as HTMLInputElement).value),
                    })
                  }
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
            </div>
          </div>

          {/* Baseline Metrics */}
          <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <h3 class="text-lg font-bold mb-4">📊 Before Treatment (Baseline)</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold mb-2">
                  Symptom Severity (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.baselineMetrics.symptomSeverity}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      baselineMetrics: {
                        ...formData.baselineMetrics,
                        symptomSeverity: parseInt((e.target as HTMLInputElement).value),
                      },
                    })
                  }
                  class="w-full"
                />
                <span class="text-sm text-gray-400">
                  {formData.baselineMetrics.symptomSeverity}/10
                </span>
              </div>
              <div>
                <label class="block text-sm font-bold mb-2">Energy Level (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.baselineMetrics.energyLevel}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      baselineMetrics: {
                        ...formData.baselineMetrics,
                        energyLevel: parseInt((e.target as HTMLInputElement).value),
                      },
                    })
                  }
                  class="w-full"
                />
                <span class="text-sm text-gray-400">{formData.baselineMetrics.energyLevel}/10</span>
              </div>
            </div>
          </div>

          {/* Outcome Metrics */}
          <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <h3 class="text-lg font-bold mb-4">✅ After Treatment (Outcome)</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold mb-2">
                  Symptom Severity (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.outcomeMetrics.symptomSeverity}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      outcomeMetrics: {
                        ...formData.outcomeMetrics,
                        symptomSeverity: parseInt((e.target as HTMLInputElement).value),
                      },
                    })
                  }
                  class="w-full"
                />
                <span class="text-sm text-gray-400">
                  {formData.outcomeMetrics.symptomSeverity}/10
                </span>
              </div>
              <div>
                <label class="block text-sm font-bold mb-2">Energy Level (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.outcomeMetrics.energyLevel}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      outcomeMetrics: {
                        ...formData.outcomeMetrics,
                        energyLevel: parseInt((e.target as HTMLInputElement).value),
                      },
                    })
                  }
                  class="w-full"
                />
                <span class="text-sm text-gray-400">{formData.outcomeMetrics.energyLevel}/10</span>
              </div>
            </div>
          </div>

          {/* Side Effects */}
          <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <h3 class="text-lg font-bold mb-4">⚠️ Side Effects</h3>
            {formData.sideEffects.length > 0 && (
              <div class="mb-4 space-y-2">
                {formData.sideEffects.map((effect, idx) => (
                  <div key={idx} class="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <div>
                      <span class="font-bold">{effect.name}</span>
                      <span class="text-sm text-gray-400 ml-2">
                        (Day {effect.dayOccurred}, Severity {effect.severity}/10)
                      </span>
                      {effect.resolved && <span class="ml-2 text-green-400">✓ Resolved</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          sideEffects: formData.sideEffects.filter((_, i) => i !== idx),
                        })
                      }
                      class="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div class="grid grid-cols-3 gap-2 mb-3">
              <input
                type="text"
                placeholder="Side effect (e.g., nausea)"
                value={newSideEffect.name}
                onInput={(e) =>
                  setNewSideEffect({
                    ...newSideEffect,
                    name: (e.target as HTMLInputElement).value,
                  })
                }
                class="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
              <input
                type="number"
                min="1"
                max="10"
                placeholder="Day"
                value={newSideEffect.dayOccurred}
                onInput={(e) =>
                  setNewSideEffect({
                    ...newSideEffect,
                    dayOccurred: parseInt((e.target as HTMLInputElement).value),
                  })
                }
                class="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  if (newSideEffect.name.trim()) {
                    setFormData({
                      ...formData,
                      sideEffects: [...formData.sideEffects, newSideEffect],
                    });
                    setNewSideEffect({ name: '', severity: 1, dayOccurred: 1, resolved: false });
                  }
                }}
                class="bg-blue-600 hover:bg-blue-700 rounded text-white font-bold text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Additional Context */}
          <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <h3 class="text-lg font-bold mb-4">📝 Additional Context</h3>
            <textarea
              placeholder="Any other details? (Diet changes, concurrent treatments, dosages, etc.)"
              value={formData.context || ''}
              onInput={(e) =>
                setFormData({
                  ...formData,
                  context: (e.target as HTMLTextAreaElement).value,
                })
              }
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 h-24 resize-none"
            />
          </div>

          {/* Legal Consent - Required before submission */}
          <SubmissionConsentCheckboxes onAllChecked={handleConsentChange} />

          {/* Wellness experiment examples */}
          <div class="p-3 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-400">
            <span class="text-gray-300 font-medium">Examples of wellness experiments: </span>
            {LEGAL_CONFIG.positioning.examples.slice(0, 4).join(', ')}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.treatmentProtocol.trim() || !consentGiven}
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-4 rounded font-bold text-lg transition"
          >
            {isSubmitting
              ? '⏳ Submitting encrypted case study...'
              : !consentGiven 
                ? '⚠️ Please confirm the checkboxes above'
                : '🚀 Submit Encrypted Case Study'}
          </button>

          {/* Privacy Sponsor Integrations */}
          <div class="p-4 bg-purple-900/20 border border-purple-600 rounded text-sm text-purple-300 mb-4">
            <p class="font-bold mb-2">🎯 Privacy Sponsor Integrations</p>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-green-400">●</span>
                <span><strong>Light Protocol:</strong> ZK compression for your case study data</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-blue-400">●</span>
                <span><strong>Noir/Aztec:</strong> ZK-SNARK proofs for data integrity</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-purple-400">●</span>
                <span><strong>Privacy Cash:</strong> Confidential rewards for your contribution</span>
              </div>
            </div>
          </div>

          {/* Privacy Sponsor Options */}
          <div class="p-6 bg-purple-900/20 border border-purple-600 rounded-lg">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
              <span class="text-2xl">🔐</span>
              Privacy Sponsor Integrations
            </h3>

            <div class="space-y-4">
              {/* Privacy Cash */}
              <div class="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div>
                  <div class="font-bold text-green-400">Privacy Cash</div>
                  <div class="text-sm text-gray-400">Confidential reward transfers</div>
                </div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    checked={privacyOptions.usePrivacyCash}
                    onChange={(e) =>
                      setPrivacyOptions({
                        ...privacyOptions,
                        usePrivacyCash: (e.target as HTMLInputElement).checked,
                      })
                    }
                    class="mr-2"
                  />
                  <span class="text-sm">Enable</span>
                </label>
              </div>

              {/* ShadowWire */}
              <div class="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div>
                  <div class="font-bold text-blue-400">ShadowWire</div>
                  <div class="text-sm text-gray-400">Private payment flows</div>
                </div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    checked={privacyOptions.useShadowWire}
                    onChange={(e) =>
                      setPrivacyOptions({
                        ...privacyOptions,
                        useShadowWire: (e.target as HTMLInputElement).checked,
                      })
                    }
                    class="mr-2"
                  />
                  <span class="text-sm">Enable</span>
                </label>
              </div>

              {/* Light Protocol Compression */}
              <div class="p-3 bg-gray-800 rounded">
                <div class="flex items-center justify-between mb-2">
                  <div class="font-bold text-purple-400">Light Protocol Compression</div>
                  <span class="text-sm text-gray-400">{privacyOptions.compressionRatio}x</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={privacyOptions.compressionRatio}
                  onChange={(e) =>
                    setPrivacyOptions({
                      ...privacyOptions,
                      compressionRatio: parseInt((e.target as HTMLInputElement).value),
                    })
                  }
                  class="w-full"
                />
                <div class="text-xs text-gray-500 mt-1">
                  Higher compression = lower storage costs
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
