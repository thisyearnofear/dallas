import { FunctionalComponent } from 'preact';
import { useState, useContext, useEffect } from 'preact/hooks';
import { WalletContext, WalletContextType, TIER_STYLES } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { useDbcToken } from '../hooks/useDbcToken';
import { DbcTokenService, calculateTier } from '../services/DbcTokenService';
import { submitValidatorApproval, fetchPendingCaseStudies } from '../services/BlockchainIntegration';
import { PublicKey } from '@solana/web3.js';
import { PrivacyTooltip } from './PrivacyTooltip';

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
    const { publicKey, reputationTier, validationCount, accuracyRate, refreshExperienceData } = walletContext;
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    
    // DBC Token Integration
    const { 
        balance: dbcBalance, 
        formattedBalance: dbcFormattedBalance,
        accountExists: dbcAccountExists,
        isLoading: dbcLoading,
        refreshBalance: refreshDbcBalance,
        canStake 
    } = useDbcToken();
    
    // Calculate tier based on DBC staking/validation history
    const calculatedTier = calculateTier(validationCount, accuracyRate);
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
            // Fetch ALL pending case studies from blockchain (not just user's own)
            const result = await fetchPendingCaseStudies();

            if (result.success && result.caseStudies) {
                // Convert to validation format - exclude user's own case studies
                const validationCaseStudies: CaseStudyForValidation[] = result.caseStudies
                    .filter(cs => !cs.submitter.equals(publicKey)) // Can't validate own studies
                    .filter(cs => cs.approvalCount < 5) // Need 5 weighted approvals
                    .map(cs => ({
                        pubkey: cs.pubkey,
                        protocol: cs.protocol,
                        createdAt: cs.createdAt,
                        isApproved: false,
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
            <div class={`w-full mx-auto p-6 rounded-lg border-2 transition-all duration-300 ${
                isDark 
                    ? 'bg-slate-900 text-white border-yellow-500/50' 
                    : 'bg-white text-slate-900 border-yellow-400 shadow-lg'
            }`}>
                <div class="flex items-center gap-3 mb-3">
                    <span class="text-3xl">🔍</span>
                    <h2 class={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Validator Dashboard
                    </h2>
                </div>
                <p class={isDark ? 'text-slate-300' : 'text-slate-600'}>
                    Connect your wallet to access the validator dashboard and start earning DBC tokens.
                </p>
            </div>
        );
    }

    return (
        <div class={`w-full mx-auto p-8 rounded-lg border-2 transition-all duration-300 ${
            isDark 
                ? 'bg-slate-900 text-white border-yellow-500/50' 
                : 'bg-white text-slate-900 border-yellow-400 shadow-xl'
        }`}>
            {/* Header */}
            <div class="mb-8">
                <div class="flex items-center gap-3 mb-2">
                    <h2 class={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>🔍 Validator Dashboard</h2>
                    {reputationTier && (
                        <span class={`${TIER_STYLES[reputationTier]} px-3 py-1 rounded-full text-sm font-bold`}>
                            {reputationTier}
                        </span>
                    )}
                </div>
                <p class={isDark ? 'text-slate-300' : 'text-slate-600'}>
                    Review encrypted case studies and earn DBC tokens. Stake {DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE} DBC to participate — 
                    accurate validators earn rewards, inaccurate ones lose their stake.
                </p>
            </div>

            {/* Status Messages */}
            {submitStatus.type && (
                <div
                    class={`mb-6 p-4 rounded border-l-4 transition-colors ${
                        submitStatus.type === 'success'
                        ? isDark ? 'bg-green-900/30 border-green-500 text-green-300' : 'bg-green-50 border-green-600 text-green-700'
                        : submitStatus.type === 'error'
                            ? isDark ? 'bg-red-900/30 border-red-500 text-red-300' : 'bg-red-50 border-red-600 text-red-700'
                            : isDark ? 'bg-blue-900/30 border-blue-500 text-blue-300' : 'bg-blue-50 border-blue-600 text-blue-700'
                    }`}
                >
                    {submitStatus.message}
                </div>
            )}

            {/* Validator Stats */}
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class={`text-lg font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Your Stats</h3>
                    <button
                        onClick={async () => {
                            setRefreshing(true);
                            await refreshExperienceData();
                            setRefreshing(false);
                        }}
                        disabled={refreshing}
                        class={`px-3 py-1 rounded text-sm font-bold transition flex items-center gap-2 ${
                            isDark 
                                ? 'bg-slate-800 hover:bg-slate-700 text-white disabled:bg-slate-900' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-900 disabled:bg-slate-50'
                        }`}
                    >
                        {refreshing ? '⏳' : '🔄'} Refresh
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class={`p-6 rounded-lg border transition-colors ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}>
                        <div class="text-2xl font-bold text-green-600 dark:text-green-400">{dbcFormattedBalance}</div>
                        <div class={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>DBC Balance</div>
                        {!dbcAccountExists && (
                            <div class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Account not created</div>
                        )}
                    </div>
                    <div class={`p-6 rounded-lg border transition-colors ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}>
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{validationCount}</div>
                        <div class={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Validations Completed</div>
                    </div>
                    <div class={`p-6 rounded-lg border transition-colors ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}>
                        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{accuracyRate}%</div>
                        <div class={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Accuracy Rating</div>
                    </div>
                </div>
            </div>

            {/* Case Studies Pending Validation */}
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>📋 Case Studies Pending Validation</h3>
                    <button
                        onClick={loadCaseStudies}
                        disabled={loading}
                        class="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded font-bold transition shadow-md"
                    >
                        {loading ? '⏳ Loading...' : '🔄 Refresh List'}
                    </button>
                </div>

                {loading ? (
                    <div class={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading case studies...</div>
                ) : caseStudies.length === 0 ? (
                    <div class={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No case studies pending validation.</div>
                ) : (
                    <div class="space-y-4">
                        {caseStudies.map((caseStudy) => (
                            <div
                                key={caseStudy.pubkey.toString()}
                                class={`border rounded-lg p-6 transition-colors shadow-sm ${
                                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                                }`}
                            >
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <h4 class={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {caseStudy.protocol}
                                        </h4>
                                        <div class={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            <div>📅 Submitted: {caseStudy.createdAt.toLocaleDateString()}</div>
                                            <div>👥 Approvals: {caseStudy.approvalCount}/3 required</div>
                                            <div>🔑 ID: {caseStudy.pubkey.toString().slice(0, 20)}...</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Stake Required</div>
                                        <div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                            {DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE} DBC
                                        </div>
                                        {!canStake(DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE) && (
                                            <div class="text-xs text-red-600 dark:text-red-400 font-bold">Insufficient balance</div>
                                        )}
                                    </div>
                                </div>

                                {/* Validation Actions */}
                                {caseStudy.needsValidation && (
                                    <div class={`border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                        <div class={`text-sm font-bold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            Choose validation type and decision:
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Quality Validation */}
                                            <div class="space-y-2">
                                                <div class="flex items-center gap-1">
                                  <div class="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">📊 Quality</div>
                                  <PrivacyTooltip topic="validator_privacy" variant="icon"><span></span></PrivacyTooltip>
                                </div>
                                                <div class="flex gap-2">
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'quality', true)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-400 px-3 py-2 rounded text-sm font-bold transition shadow-sm"
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'quality', false)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-slate-400 px-3 py-2 rounded text-sm font-bold transition shadow-sm"
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Accuracy Validation */}
                                            <div class="space-y-2">
                                                <div class="flex items-center gap-1">
                                  <div class="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">🎯 Accuracy</div>
                                  <PrivacyTooltip topic="validator_privacy" variant="icon"><span></span></PrivacyTooltip>
                                </div>
                                                <div class="flex gap-2">
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'accuracy', true)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-400 px-3 py-2 rounded text-sm font-bold transition shadow-sm"
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'accuracy', false)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-slate-400 px-3 py-2 rounded text-sm font-bold transition shadow-sm"
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Safety Validation */}
                                            <div class="space-y-2">
                                                <div class="flex items-center gap-1">
                                  <div class="text-sm font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">⚠️ Safety</div>
                                  <PrivacyTooltip topic="validator_privacy" variant="icon"><span></span></PrivacyTooltip>
                                </div>
                                                <div class="flex gap-2">
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'safety', true)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-400 px-3 py-2 rounded text-sm font-bold transition shadow-sm"
                                                    >
                                                        ✅ Safe
                                                    </button>
                                                    <button
                                                        onClick={() => handleValidation(caseStudy.pubkey, 'safety', false)}
                                                        disabled={validating === caseStudy.pubkey.toString()}
                                                        class="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-slate-400 px-3 py-2 rounded text-sm font-bold transition shadow-sm"
                                                    >
                                                        ⚠️ Unsafe
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {validating === caseStudy.pubkey.toString() && (
                                            <div class="mt-4 text-center text-yellow-600 dark:text-yellow-400 font-bold animate-pulse">
                                                ⏳ Submitting validation to blockchain...
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!caseStudy.needsValidation && (
                                    <div class={`border-t pt-4 text-center font-bold ${isDark ? 'border-slate-700 text-green-400' : 'border-slate-200 text-green-600'}`}>
                                        ✅ You have already validated this case study
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Validator Information - Simplified Language */}
            <div class={`p-6 rounded-lg transition-colors ${
                isDark ? 'bg-purple-900/20 border border-purple-600' : 'bg-purple-50 border border-purple-200'
            }`}>
                <h3 class="text-lg font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <span>🔐</span>
                  <span>How Validation Works</span>
                  <PrivacyTooltip topic="validator_privacy" variant="icon"><span></span></PrivacyTooltip>
                </h3>
                <div class={`text-sm space-y-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <div class="flex items-start gap-2">
                        <span class="text-green-500 font-bold">✓</span>
                        <span><strong>Privacy Protected:</strong> You verify data quality without seeing sensitive health details</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-green-500 font-bold">✓</span>
                        <span><strong>Earn Rewards:</strong> Get {DbcTokenService.REWARD_AMOUNTS.BASE_VALIDATION} DBC per accurate validation</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-green-500 font-bold">✓</span>
                        <span><strong>Skin in the Game:</strong> Stake {DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE} DBC — accurate work earns more, mistakes cost you</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-green-500 font-bold">✓</span>
                        <span><strong>Committee Decision:</strong> 3 of 5 validators must agree for approval</span>
                    </div>
                </div>
            </div>
        </div>
    );
};