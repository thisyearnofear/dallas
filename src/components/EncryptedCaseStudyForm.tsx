import { FunctionalComponent } from 'preact';
import { useState, useContext, useCallback, useEffect } from 'preact/hooks';
import { WalletContext } from '../context/WalletContext';
import { deriveEncryptionKey, encryptHealthData } from '../utils/encryption';
import { submitCaseStudyToBlockchain } from '../services/BlockchainIntegration';
import { validateBlockchainConfig } from '../config/solana';
import { SubmissionConsentCheckboxes } from './SharedUIComponents';
import { LEGAL_CONFIG } from '../config/legal';
import {
  lightProtocolService,
  COMPRESSION_RATIO_OPTIONS,
  CompressedCaseStudy,
} from '../services/privacy';
import { PrivacyTooltip, PrivacyLabel } from './PrivacyTooltip';
import { PrivacyScorePreview } from './PrivacyScorePreview';

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

  // Privacy options - simplified to working features only
  const [privacyOptions, setPrivacyOptions] = useState({
    compressionRatio: 10, // Default to 10x (recommended)
  });

  // Light Protocol compression state
  const [compressionStats, setCompressionStats] = useState<{
    isCompressing: boolean;
    compressedData: CompressedCaseStudy | null;
    originalSize: number;
    savingsPercent: number;
  }>({
    isCompressing: false,
    compressedData: null,
    originalSize: 0,
    savingsPercent: 0,
  });

  // Calculate privacy features for score preview
  const privacyFeatures = {
    encryption: !!encryptionKey,
    compression: compressionStats.savingsPercent > 0,
    compressionRatio: privacyOptions.compressionRatio,
    zkProofs: 0, // ZK proofs generated during validation, not submission
  };

  // Initialize Light Protocol service
  useEffect(() => {
    lightProtocolService.initialize().catch(console.error);
  }, []);

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

  // Compress case study data using Light Protocol
  const compressCaseStudy = async () => {
    if (!encryptionKey) return;

    setCompressionStats((s) => ({ ...s, isCompressing: true }));
    setSubmitStatus({
      type: 'info',
      message: '⚡ Compressing data with Light Protocol...',
    });

    try {
      // Prepare data for compression
      const encryptedBaseline = await encryptHealthData(
        JSON.stringify(formData.baselineMetrics),
        encryptionKey
      );
      const encryptedOutcome = await encryptHealthData(
        JSON.stringify(formData.outcomeMetrics),
        encryptionKey
      );

      // Calculate original size
      const originalSize = 
        encryptedBaseline.length +
        encryptedOutcome.length +
        formData.treatmentProtocol.length +
        4 + 4; // duration and cost

      // Compress using Light Protocol
      const compressed = await lightProtocolService.compressCaseStudy(
        {
          encryptedBaseline: new TextEncoder().encode(encryptedBaseline),
          encryptedOutcome: new TextEncoder().encode(encryptedOutcome),
          treatmentProtocol: formData.treatmentProtocol,
          durationDays: formData.durationDays,
          costUSD: formData.costUSD,
          metadataHash: crypto.getRandomValues(new Uint8Array(32)),
        },
        {
          compressionRatio: privacyOptions.compressionRatio,
          storeFullData: false,
        }
      );

      const savingsPercent = Math.round(
        ((compressed.originalSize - compressed.compressedSize) / compressed.originalSize) * 100
      );

      setCompressionStats({
        isCompressing: false,
        compressedData: compressed,
        originalSize,
        savingsPercent,
      });

      setSubmitStatus({
        type: 'success',
        message: `✅ Compressed ${lightProtocolService.formatBytes(compressed.originalSize)} → ${lightProtocolService.formatBytes(compressed.compressedSize)} (${savingsPercent}% savings)`,
      });

      return compressed;
    } catch (error) {
      setCompressionStats((s) => ({ ...s, isCompressing: false }));
      setSubmitStatus({
        type: 'error',
        message: `❌ Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      return null;
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

    // Compress data if not already compressed
    let compressedData = compressionStats.compressedData;
    if (!compressedData) {
      compressedData = await compressCaseStudy();
      if (!compressedData) {
        setIsSubmitting(false);
        return;
      }
    }

    setSubmitStatus({
      type: 'info',
      message: `🔄 Submitting to blockchain with ${compressionStats.savingsPercent}% compression... Please approve the transaction.`,
    });

    try {
      // Submit to blockchain with privacy sponsor integrations
      const result = await submitCaseStudyToBlockchain(
        publicKey,
        walletContext.signTransaction,
        formData,
        encryptionKey,
        {
          ...privacyOptions,
          compressedAccount: compressedData.compressedAccount.toString(),
          compressionRatio: compressedData.achievedRatio,
          compressionProof: Array.from(compressedData.compressionProof),
        }
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
    <div class="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-2xl border-2 border-green-500 shadow-xl transition-all duration-300">
      {/* Header */}
      <div class="mb-10">
        <h2 class="text-3xl font-black mb-2 uppercase tracking-tighter">📋 Share Your Health Journey</h2>
        <p class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          Document your experimental treatment and share your experience with the community.
          Your data stays encrypted.
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

      {/* Step 1: Encryption Key */}
      <div class="mb-10 p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner">
        <h3 class="text-xl font-black mb-4 flex items-center gap-3 uppercase tracking-wider text-slate-800 dark:text-white">
          <span class="text-2xl bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm">🔐</span>
          Step 1: Encrypt Your Data
        </h3>
        {!encryptionKey ? (
          <>
            <p class="text-slate-600 dark:text-slate-300 mb-6 font-medium">
              First, we'll derive an encryption key from your wallet. This key stays on your
              device and controls who can see your health data.
            </p>
            <button
              onClick={handleDeriveKey}
              disabled={keyDeriving}
              class="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-300 dark:disabled:bg-slate-700 px-6 py-4 rounded-xl font-black text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              {keyDeriving ? '⏳ Deriving key...' : '🔐 Derive Encryption Key from Wallet'}
            </button>
          </>
        ) : (
          <div class="bg-green-50 dark:bg-green-900/20 border border-green-500 dark:border-green-600 p-5 rounded-xl flex items-center gap-4">
            <div class="text-3xl">✅</div>
            <div>
              <div class="font-black text-green-800 dark:text-green-300 uppercase tracking-widest text-xs">Encryption key ready</div>
              <div class="text-sm text-green-700 dark:text-slate-400 font-medium">
                Your health metrics will be encrypted before submission.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Case Study Form */}
      {encryptionKey && (
        <form onSubmit={handleSubmit} class="space-y-8 animate-fadeIn">
          <div class="p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner">
            <h3 class="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-wider text-slate-800 dark:text-white">
              <span class="text-2xl bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm">💊</span>
              Step 2: Your Treatment
            </h3>

            {/* Treatment Protocol */}
            <div class="mb-6">
              <label class="block text-xs font-black mb-2 uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
                class="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-brand transition-all shadow-sm"
                required
              />
            </div>

            {/* Duration & Cost */}
            <div class="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label class="block text-xs font-black mb-2 uppercase tracking-widest text-slate-500 dark:text-slate-400">Duration (days)</label>
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
                  class="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-brand shadow-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-black mb-2 uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Cost (USD)</label>
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
                  class="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-brand shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Baseline Metrics */}
          <div class="p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner">
            <h3 class="text-lg font-black mb-6 uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
              <span class="w-2 h-6 bg-blue-500 rounded-full"></span>
              Before Treatment (Baseline)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label class="block text-xs font-black mb-3 uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
                  class="w-full accent-brand"
                />
                <div class="flex justify-between mt-2">
                  <span class="text-[10px] font-black text-slate-400 uppercase">Mild</span>
                  <span class="text-sm font-black text-brand">
                    {formData.baselineMetrics.symptomSeverity}/10
                  </span>
                  <span class="text-[10px] font-black text-slate-400 uppercase">Severe</span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-black mb-3 uppercase tracking-widest text-slate-500 dark:text-slate-400">Energy Level (1-10)</label>
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
                  class="w-full accent-brand"
                />
                <div class="flex justify-between mt-2">
                  <span class="text-[10px] font-black text-slate-400 uppercase">Low</span>
                  <span class="text-sm font-black text-brand">
                    {formData.baselineMetrics.energyLevel}/10
                  </span>
                  <span class="text-[10px] font-black text-slate-400 uppercase">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Metrics */}
          <div class="p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner">
            <h3 class="text-lg font-black mb-6 uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
              <span class="w-2 h-6 bg-green-500 rounded-full"></span>
              After Treatment (Outcome)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label class="block text-xs font-black mb-3 uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
                  class="w-full accent-brand"
                />
                <div class="flex justify-between mt-2">
                  <span class="text-[10px] font-black text-slate-400 uppercase">Mild</span>
                  <span class="text-sm font-black text-brand">
                    {formData.outcomeMetrics.symptomSeverity}/10
                  </span>
                  <span class="text-[10px] font-black text-slate-400 uppercase">Severe</span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-black mb-3 uppercase tracking-widest text-slate-500 dark:text-slate-400">Energy Level (1-10)</label>
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
                  class="w-full accent-brand"
                />
                <div class="flex justify-between mt-2">
                  <span class="text-[10px] font-black text-slate-400 uppercase">Low</span>
                  <span class="text-sm font-black text-brand">
                    {formData.outcomeMetrics.energyLevel}/10
                  </span>
                  <span class="text-[10px] font-black text-slate-400 uppercase">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Effects */}
          <div class="p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner">
            <h3 class="text-lg font-black mb-6 uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
              <span class="w-2 h-6 bg-red-500 rounded-full"></span>
              Side Effects
            </h3>
            {formData.sideEffects.length > 0 && (
              <div class="mb-6 space-y-3">
                {formData.sideEffects.map((effect, idx) => (
                  <div key={idx} class="flex justify-between items-center p-4 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl shadow-sm">
                    <div>
                      <div class="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{effect.name}</div>
                      <div class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                        Day {effect.dayOccurred} • Severity {effect.severity}/10
                      </div>
                      {effect.resolved && <div class="text-[10px] font-black text-green-600 uppercase mt-1 flex items-center gap-1"><span>✓</span> Resolved</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          sideEffects: formData.sideEffects.filter((_, i) => i !== idx),
                        })
                      }
                      class="text-red-500 hover:text-red-600 font-black text-[10px] uppercase tracking-widest bg-red-50 dark:bg-red-900/20 p-2 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Effect (e.g. nausea)"
                value={newSideEffect.name}
                onInput={(e) =>
                  setNewSideEffect({
                    ...newSideEffect,
                    name: (e.target as HTMLInputElement).value,
                  })
                }
                class="px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-brand shadow-sm"
              />
              <div class="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Day"
                  value={newSideEffect.dayOccurred}
                  onInput={(e) =>
                    setNewSideEffect({
                      ...newSideEffect,
                      dayOccurred: parseInt((e.target as HTMLInputElement).value),
                    })
                  }
                  class="w-20 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm font-bold outline-none focus:border-brand shadow-sm"
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
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Additional Context */}
          <div class="p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner">
            <h3 class="text-lg font-black mb-6 uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
              <span class="w-2 h-6 bg-yellow-500 rounded-full"></span>
              Additional Context
            </h3>
            <textarea
              placeholder="Any other details? (Diet changes, concurrent treatments, dosages, etc.)"
              value={formData.context || ''}
              onInput={(e) =>
                setFormData({
                  ...formData,
                  context: (e.target as HTMLTextAreaElement).value,
                })
              }
              class="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 font-medium h-32 resize-none outline-none focus:border-brand transition-all shadow-sm"
            />
          </div>

          {/* Legal Consent - Required before submission */}
          <SubmissionConsentCheckboxes onAllChecked={handleConsentChange} />

          {/* Wellness experiment examples */}
          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
            <span class="text-slate-700 dark:text-slate-300">Wellness Examples: </span>
            {LEGAL_CONFIG.positioning.examples.slice(0, 4).join(', ')}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.treatmentProtocol.trim() || !consentGiven}
            class="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 px-6 py-5 rounded-2xl font-black text-xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl disabled:transform-none disabled:shadow-none uppercase tracking-tighter"
          >
            {isSubmitting
              ? '⏳ Submitting encrypted case study...'
              : !consentGiven 
                ? '⚠️ Confirm the checkboxes above'
                : '🚀 Submit Encrypted Case Study'}
          </button>

          {/* Privacy Tech Stack - Working Features Only */}
          <div class="space-y-6">
            <div class="p-6 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-600/50 rounded-2xl shadow-sm">
              <p class="font-black text-purple-800 dark:text-purple-300 mb-4 uppercase tracking-widest text-xs">🎯 Privacy Technology Stack</p>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500"></span>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300"><strong>Wallet Encryption:</strong> Your key, your data — we can't decrypt</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-sm shadow-purple-500"></span>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300"><strong>Storage Saver:</strong> Compress data to reduce on-chain costs</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm shadow-blue-500"></span>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300"><strong>Zero-Knowledge Validation:</strong> Verify quality without revealing data</span>
                </div>
              </div>
            </div>

            {/* Live Privacy Score - Gamified Feedback */}
            {encryptionKey && (
              <div class="mb-6">
                <PrivacyScorePreview features={privacyFeatures} showBreakdown={true} />
              </div>
            )}

            {/* Privacy Protection - Simplified */}
            <div class="p-8 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-600/50 rounded-2xl shadow-sm">
              <PrivacyTooltip topic="encryption" variant="section">
                <h3 class="text-lg font-black flex items-center gap-3 uppercase tracking-wider text-purple-900 dark:text-purple-200">
                  <span class="text-2xl bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">🛡️</span>
                  <span>Your Privacy Protection</span>
                </h3>
              </PrivacyTooltip>

              <div class="mt-6 space-y-4">
                {/* Wallet Encryption - Always On */}
                <div class="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <span class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🔐</span>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-black text-slate-800 dark:text-white uppercase tracking-tight">Wallet-Locked Encryption</span>
                      <PrivacyTooltip topic="wallet_key" variant="icon">
                        <span></span>
                      </PrivacyTooltip>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Only you can decrypt your data. We literally cannot access it.
                    </p>
                  </div>
                  <span class="text-xs font-black text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full uppercase tracking-widest">
                    Active
                  </span>
                </div>

                {/* Compression - User Configurable */}
                <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div class="flex items-center gap-4 mb-4">
                    <span class="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">⚡</span>
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <span class="font-black text-slate-800 dark:text-white uppercase tracking-tight">Storage Saver</span>
                        <PrivacyTooltip topic="compression" variant="icon">
                          <span></span>
                        </PrivacyTooltip>
                      </div>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Shrink your data to save on blockchain storage costs
                      </p>
                    </div>
                  </div>
                  
                  {/* Simple Compression Selector */}
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-bold text-slate-600 dark:text-slate-400">Compression:</span>
                    <select
                      value={privacyOptions.compressionRatio}
                      onChange={(e) =>
                        setPrivacyOptions({
                          ...privacyOptions,
                          compressionRatio: parseInt((e.target as HTMLSelectElement).value),
                        })
                      }
                      class="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none"
                    >
                      <option value={5}>Standard (5x savings)</option>
                      <option value={10}>Recommended (10x savings)</option>
                      <option value={20}>Maximum (20x savings)</option>
                    </select>
                  </div>

                  {/* Savings Preview */}
                  {compressionStats.originalSize > 0 && (
                    <div class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50">
                      <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          You'll save: <strong class="text-green-600 dark:text-green-400">{compressionStats.savingsPercent}%</strong> on storage
                        </span>
                        <span class="text-xs text-slate-500">
                          {lightProtocolService.formatBytes(compressionStats.originalSize)} → {lightProtocolService.formatBytes(compressionStats.originalSize * (1 - compressionStats.savingsPercent / 100))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ZK Proofs - Coming in validation */}
                <div class="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span class="w-10 h-10 bg-blue-500/50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🔍</span>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">Zero-Knowledge Validation</span>
                      <PrivacyTooltip topic="zk_proofs" variant="icon">
                        <span></span>
                      </PrivacyTooltip>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Will be generated when validators review your submission
                    </p>
                  </div>
                  <span class="text-xs font-black text-slate-500 dark:text-slate-500 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full uppercase tracking-widest">
                    Later
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
