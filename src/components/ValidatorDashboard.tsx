import { FunctionalComponent } from 'preact';
import { useState, useContext, useEffect } from 'preact/hooks';
import { WalletContext, WalletContextType, TIER_STYLES } from '../context/WalletContext';
import { submitValidatorApproval, fetchUserCaseStudies } from '../services/BlockchainIntegration';
import { PublicKey } from '@solana/web3.js';

interface CaseStudyForValidation {
    pubkey: PublicKey;
    protocol: string;
    createdAt: Date;
    isApproved: boolean;
    approvalCount: number;
    needsValidation: boolean;
}

export const ValidatorDashboard: FunctionalComponent = () => {
    const walletContext = useContext(WalletContext) as WalletContextType;
    const { publicKey, experienceBalance, reputationTier, validationCount, accuracyRate, refreshExperienceData } = walletContext;
    const [refreshing, setRefreshing] = useState(false);
    const [caseStudies, setCaseStudies] = useState<CaseStudyForValidation[]>([]);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState<string | null>(null);
    const [submitStatus, setSubmitStatus] = useState<{
        type: 'success' | 'error' | 'info' | null;
        message: string;
    }>({ type: null, message: '' });

    // Load case studies that need validation
    useEffect(() => {
        if (publicKey) {
            loadCaseStudies();
        }
    }, [publicKey]);

    const loadCaseStudies = async () => {
        if (!publicKey) return;

        setLoading(true);
        try {
            // Fetch real case studies from blockchain that need validation
            // This will query all case studies and filter for those needing validation
            const result = await fetchUserCaseStudies(publicKey);

            if (result.success && result.caseStudies) {
                // Convert to validation format and filter for those needing validation
                const validationCaseStudies: CaseStudyForValidation[] = result.caseStudies
                    .filter(cs => !cs.isApproved && cs.approvalCount < 3) // Need 3 approvals
                    .map(cs => ({
                        pubkey: cs.pubkey,
                        protocol: cs.protocol,
                        createdAt: cs.createdAt,
                        isApproved: cs.isApproved,
                        approvalCount: cs.approvalCount,
                        needsValidation: true,
                    }));

                setCaseStudies(validationCaseStudies);
            } else {
                setCaseStudies([]);
            }
        } catch (error) {
            console.error('Error loading case studies:', error);
            setSubmitStatus({
                type: 'error',
                message: `Failed to load case studies: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
            setCaseStudies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleValidation = async (
        caseStudyPubkey: PublicKey,
        validationType: 'quality' | 'accuracy' | 'safety',
        approved: boolean
    ) => {
        if (!publicKey) {
            setSubmitStatus({
                type: 'error',
                message: 'Wallet not connected',
            });
            return;
        }

        setValidating(caseStudyPubkey.toString());
        setSubmitStatus({
            type: 'info',
            message: '🔄 Submitting validation... Please approve the transaction in your wallet.',
        });

        try {
            const result = await submitValidatorApproval(
                publicKey,
                async (tx) => {
                    const provider = (window as any).solana;
                    if (!provider || !provider.signTransaction) {
                        throw new Error('Wallet provider not available');
                    }
                    return await provider.signTransaction(tx);
                },
                caseStudyPubkey,
                validationType,
                approved,
                10 // Stake 10 EXPERIENCE tokens
            );

            if (result.success) {
                setSubmitStatus({
                    type: 'success',
                    message: result.message,
                });

                // Update the case study in the list
                setCaseStudies(prev =>
                    prev.map(cs =>
                        cs.pubkey.equals(caseStudyPubkey)
                            ? { ...cs, approvalCount: cs.approvalCount + 1, needsValidation: false }
                            : cs
                    )
                );
            } else {
                setSubmitStatus({
                    type: 'error',
                    message: result.message,
                });
            }
        } catch (error) {
            console.error('Validation error:', error);
            setSubmitStatus({
                type: 'error',
                message: `❌ Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        } finally {
            setValidating(null);
        }
    };

    if (!publicKey) {
        return (
            <div class="w-full max-w-4xl mx-auto bg-gray-900 text-white p-8 rounded-lg border-2 border-yellow-500">
                <h2 class="text-3xl font-bold mb-4">🔍 Validator Dashboard</h2>
                <p class="text-gray-300">Please connect your wallet to access the validator dashboard.</p>
            </div>
        );
    }

    return (
        <div class="w-full max-w-6xl mx-auto bg-gray-900 text-white p-8 rounded-lg border-2 border-yellow-500">
            {/* Header */}
            <div class="mb-8">
                <div class="flex items-center gap-3 mb-2">
                    <h2 class="text-3xl font-bold">🔍 Validator Dashboard</h2>
                    {reputationTier && (
                        <span class={`${TIER_STYLES[reputationTier]} px-3 py-1 rounded-full text-sm font-bold`}>
                            {reputationTier}
                        </span>
                    )}
                </div>
                <p class="text-gray-300">
                    Review case studies and earn EXPERIENCE tokens for accurate validations.
                    Your stake is at risk if you provide false validations.
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

            {/* Validator Stats */}
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-300">Your Stats</h3>
                    <button
                        onClick={async () => {
                            setRefreshing(true);
                            await refreshExperienceData();
                            setRefreshing(false);
                        }}
                        disabled={refreshing}
                        class="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 px-3 py-1 rounded text-sm font-bold transition flex items-center gap-2"
                    >
                        {refreshing ? '⏳' : '🔄'} Refresh
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div class="text-2xl font-bold text-green-400">{experienceBalance.toLocaleString()}</div>
                        <div class="text-sm text-gray-400">EXPERIENCE Tokens</div>
                    </div>
                    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div class="text-2xl font-bold text-blue-400">{validationCount}</div>
                        <div class="text-sm text-gray-400">Validations Completed</div>
                    </div>
                    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div class="text-2xl font-bold text-purple-400">{accuracyRate}%</div>
                        <div class="text-sm text-gray-400">Accuracy Rating</div>
                    </div>
                </div>
            </div>

            {/* Case Studies Pending Validation */}
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold">📋 Case Studies Pending Validation</h3>
                    <button
                        onClick={loadCaseStudies}
                        disabled={loading}
                        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded font-bold transition"
                    >
                        {loading ? '⏳ Loading...' : '🔄 Refresh'}
                    </button>
                </div>

                {loading ? (
                    <div class="text-center py-8 text-gray-400">Loading case studies...</div>
                ) : caseStudies.length === 0 ? (
                    <div class="text-center py-8 text-gray-400">No case studies pending validation.</div>
                ) : (
                    <div class="space-y-4">
                        {caseStudies.map((caseStudy) => (
                            <div
                                key={caseStudy.pubkey.toString()}
                                class="bg-gray-800 border border-gray-700 rounded-lg p-6"
                            >
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <h4 class="text-lg font-bold text-white mb-2">
                                            {caseStudy.protocol}
                                        </h4>
                                        <div class="text-sm text-gray-400 space-y-1">
                                            <div>📅 Submitted: {caseStudy.createdAt.toLocaleDateString()}</div>
                                            <div>👥 Approvals: {caseStudy.approvalCount}/3 required</div>
                                            <div>🔑 ID: {caseStudy.pubkey.toString().slice(0, 20)}...</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm text-gray-400 mb-2">Stake Required</div>
                                        <div class="text-lg font-bold text-yellow-400">10 EXPERIENCE</div>
                                    </div>
                                </div>

                                {/* Validation Actions */}
                                {caseStudy.needsValidation && (
                                    <div class="border-t border-gray-700 pt-4">
                                        <div class="text-sm font-bold text-gray-300 mb-3">
                                            Choose validation type and decision:
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Quality Validation */}
                                            <div class="space-y-2">
                                                <div class="text-sm font-bold text-blue-400">📊 Quality</div>
                                                <div class="flex gap-2">
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'quality', true)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-bold transition"
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'quality', false)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-bold transition"
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Accuracy Validation */}
                                            <div class="space-y-2">
                                                <div class="text-sm font-bold text-purple-400">🎯 Accuracy</div>
                                                <div class="flex gap-2">
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'accuracy', true)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-bold transition"
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'accuracy', false)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-bold transition"
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Safety Validation */}
                                            <div class="space-y-2">
                                                <div class="text-sm font-bold text-orange-400">⚠️ Safety</div>
                                                <div class="flex gap-2">
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'safety', true)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-bold transition"
                                                    >
                                                        ✅ Safe
                                                    </button>
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'safety', false)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-bold transition"
                                                    >
                                                        ⚠️ Unsafe
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {validating === caseStudy.pubkey.toString() && (
                                            <div class="mt-4 text-center text-yellow-400">
                                                ⏳ Submitting validation to blockchain...
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!caseStudy.needsValidation && (
                                    <div class="border-t border-gray-700 pt-4 text-center text-green-400">
                                        ✅ You have already validated this case study
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ZK Proof Information */}
            <div class="bg-purple-900/20 border border-purple-600 p-6 rounded-lg">
                <h3 class="text-lg font-bold text-purple-400 mb-4">🔐 Zero-Knowledge Validation</h3>
                <div class="text-sm text-gray-300 space-y-2">
                    <div>
                        ✅ <strong>Privacy Preserved:</strong> You validate data integrity without seeing encrypted health metrics
                    </div>
                    <div>
                        ✅ <strong>Noir Circuits:</strong> ZK-SNARK proofs verify data quality automatically
                    </div>
                    <div>
                        ✅ <strong>Stake Protection:</strong> Accurate validations earn rewards, false ones get slashed
                    </div>
                    <div>
                        ✅ <strong>Consensus Required:</strong> 3/5 validator approvals needed for case study acceptance
                    </div>
                </div>
            </div>
        </div>
    );
};