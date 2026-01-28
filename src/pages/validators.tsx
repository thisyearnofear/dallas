import { ValidatorDashboard } from '../components/ValidatorDashboard';
import { NetworkStatus } from '../components/NetworkStatus';
import { useContext } from 'preact/hooks';
import { WalletContext, WalletContextType } from '../context/WalletContext';

export function Validators() {
    const walletContext = useContext(WalletContext) as WalletContextType;
    const { publicKey } = walletContext;
    const isConnected = !!publicKey;

    return (
        <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Hero Section */}
            <div class="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-b border-slate-200 dark:border-slate-800 p-8 mb-12">
                <div class="max-w-6xl mx-auto text-center">
                    <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 dark:from-yellow-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                        Validator Network
                    </h1>
                    <p class="text-xl text-slate-600 dark:text-slate-300 mb-6">
                        Earn EXPERIENCE tokens by validating case studies with zero-knowledge proofs.
                        Stake your reputation on data integrity without seeing private health information.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">🔐</span>
                            <span>ZK proof validation</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">💰</span>
                            <span>Earn EXPERIENCE tokens</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">⚖️</span>
                            <span>Stake-based consensus</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div class="max-w-7xl mx-auto px-4 pb-12">
                {isConnected ? (
                    /* Connected: 2-column layout with dashboard on left, sidebar on right */
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Validator Dashboard - Main Content */}
                        <div class="lg:col-span-3">
                            <ValidatorDashboard />
                        </div>

                        {/* Sidebar */}
                        <div class="space-y-6">
                            <NetworkStatus />
                            <ValidatorGuide />
                            <ValidationTypes />
                            <PrivacyTech />
                        </div>
                    </div>
                ) : (
                    /* Not Connected: Compact layout with info cards below */
                    <div class="space-y-6">
                        {/* Validator Dashboard - Compact */}
                        <ValidatorDashboard />
                        
                        {/* Info Cards Grid - Horizontal layout when not connected */}
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <NetworkStatus />
                            <ValidatorGuide compact />
                            <ValidationTypes compact />
                            <PrivacyTech compact />
                        </div>
                    </div>
                )}
            </div>

            {/* Information Section */}
            <div class="bg-slate-100 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800 mt-16 py-12">
                <div class="max-w-6xl mx-auto px-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Zero Knowledge */}
                        <div class="text-center">
                            <div class="text-4xl mb-4">🔐</div>
                            <h3 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">Zero-Knowledge Validation</h3>
                            <p class="text-slate-600 dark:text-slate-400">
                                Validate data integrity and quality without ever seeing the encrypted health metrics.
                                ZK-SNARK proofs ensure privacy is preserved.
                            </p>
                        </div>

                        {/* Consensus */}
                        <div class="text-center">
                            <div class="text-4xl mb-4">⚖️</div>
                            <h3 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">DBC Stake-Based Consensus</h3>
                            <p class="text-slate-600 dark:text-slate-400">
                                Validators stake DALLAS BUYERS CLUB (DBC) tokens on their decisions. Accurate validations earn DBC rewards,
                                false validations get slashed. 100 DBC minimum stake required.
                            </p>
                        </div>

                        {/* Decentralized */}
                        <div class="text-center">
                            <div class="text-4xl mb-4">🌐</div>
                            <h3 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">Decentralized Network</h3>
                            <p class="text-slate-600 dark:text-slate-400">
                                No central authority controls validation. The network reaches consensus through
                                cryptoeconomic incentives and reputation.
                            </p>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div class="mt-12 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 rounded-lg">
                        <h4 class="font-bold text-yellow-700 dark:text-yellow-300 mb-2">⚠️ Validator Responsibilities</h4>
                        <p class="text-sm text-yellow-600 dark:text-slate-300">
                            Validators stake 100 DBC minimum and are responsible for accurate assessment of case study quality, 
                            accuracy, and safety. False or malicious validations will result in DBC stake slashing (50% burned, 
                            50% to treasury). Only validate case studies you can properly assess. When in doubt, abstain from validation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sidebar Components
function ValidatorGuide({ compact = false }: { compact?: boolean }) {
    return (
        <div class={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
            <h3 class={`font-bold text-slate-900 dark:text-white mb-3 ${compact ? 'text-base' : 'text-lg'}`}>📚 Validator Guide</h3>
            <div class={`space-y-2 text-slate-600 dark:text-slate-300 ${compact ? 'text-xs' : 'text-sm'}`}>
                <div class="flex items-start gap-2">
                    <span class="text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">1.</span>
                    <span><strong class="text-blue-600 dark:text-blue-400">Connect</strong> — Use Phantom wallet</span>
                </div>
                <div class="flex items-start gap-2">
                    <span class="text-green-600 dark:text-green-400 font-bold whitespace-nowrap">2.</span>
                    <span><strong class="text-green-600 dark:text-green-400">Stake</strong> — 100 DBC minimum to validate</span>
                </div>
                <div class="flex items-start gap-2">
                    <span class="text-purple-600 dark:text-purple-400 font-bold whitespace-nowrap">3.</span>
                    <span><strong class="text-purple-600 dark:text-purple-400">Review</strong> — Validate via ZK proofs</span>
                </div>
                <div class="flex items-start gap-2">
                    <span class="text-orange-600 dark:text-orange-400 font-bold whitespace-nowrap">4.</span>
                    <span><strong class="text-orange-600 dark:text-orange-400">Earn</strong> — Rewards for accuracy</span>
                </div>
            </div>
        </div>
    );
}

function ValidationTypes({ compact = false }: { compact?: boolean }) {
    return (
        <div class={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
            <h3 class={`font-bold text-slate-900 dark:text-white mb-3 ${compact ? 'text-base' : 'text-lg'}`}>🎯 Validation Types</h3>
            <div class={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                <div class="flex items-center gap-2">
                    <span class="text-blue-600 dark:text-blue-400">📊</span>
                    <div>
                        <span class="font-bold text-blue-600 dark:text-blue-400">Quality</span>
                        {!compact && <span class="text-slate-500 dark:text-slate-400 block text-xs">Data completeness</span>}
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-purple-600 dark:text-purple-400">🎯</span>
                    <div>
                        <span class="font-bold text-purple-600 dark:text-purple-400">Accuracy</span>
                        {!compact && <span class="text-slate-500 dark:text-slate-400 block text-xs">Medical plausibility</span>}
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-orange-600 dark:text-orange-400">⚠️</span>
                    <div>
                        <span class="font-bold text-orange-600 dark:text-orange-400">Safety</span>
                        {!compact && <span class="text-slate-500 dark:text-slate-400 block text-xs">Risk assessment</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PrivacyTech({ compact = false }: { compact?: boolean }) {
    return (
        <div class={`bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-600 rounded-lg ${compact ? 'p-4' : 'p-6'}`}>
            <h3 class={`font-bold text-purple-600 dark:text-purple-400 mb-3 ${compact ? 'text-base' : 'text-lg'}`}>🔐 Privacy Tech</h3>
            <div class={`space-y-1 text-purple-700 dark:text-slate-300 ${compact ? 'text-xs' : 'text-sm'}`}>
                <div class="flex items-center gap-1">
                    <span>✅</span>
                    <span><strong>Noir:</strong> ZK-SNARKs</span>
                </div>
                <div class="flex items-center gap-1">
                    <span>✅</span>
                    <span><strong>Arcium:</strong> MPC</span>
                </div>
                <div class="flex items-center gap-1">
                    <span>✅</span>
                    <span><strong>Privacy Cash:</strong> Rewards</span>
                </div>
                {!compact && (
                    <div class="flex items-center gap-1">
                        <span>✅</span>
                        <span><strong>Light:</strong> Compression</span>
                    </div>
                )}
            </div>
        </div>
    );
}