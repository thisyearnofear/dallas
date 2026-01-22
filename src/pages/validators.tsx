import { ValidatorDashboard } from '../components/ValidatorDashboard';
import { NetworkStatus } from '../components/NetworkStatus';

export function Validators() {
    return (
        <div class="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Hero Section */}
            <div class="bg-gradient-to-r from-yellow-900/20 via-orange-900/20 to-red-900/20 border-b border-gray-700 p-8 mb-12">
                <div class="max-w-6xl mx-auto text-center">
                    <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                        Validator Network
                    </h1>
                    <p class="text-xl text-gray-300 mb-6">
                        Earn EXPERIENCE tokens by validating case studies with zero-knowledge proofs.
                        Stake your reputation on data integrity without seeing private health information.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4 text-sm">
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
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Validator Dashboard - Main Content */}
                    <div class="lg:col-span-3">
                        <ValidatorDashboard />
                    </div>

                    {/* Sidebar */}
                    <div class="space-y-6">
                        {/* Network Status */}
                        <NetworkStatus />

                        {/* Validator Guide */}
                        <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <h3 class="text-lg font-bold text-white mb-4">📚 Validator Guide</h3>
                            <div class="space-y-3 text-sm text-gray-300">
                                <div>
                                    <div class="font-bold text-blue-400 mb-1">1. Connect Wallet</div>
                                    <div>Use Phantom wallet to connect and sign transactions</div>
                                </div>
                                <div>
                                    <div class="font-bold text-green-400 mb-1">2. Stake Tokens</div>
                                    <div>Stake 10 EXPERIENCE tokens per validation</div>
                                </div>
                                <div>
                                    <div class="font-bold text-purple-400 mb-1">3. Review Data</div>
                                    <div>Validate quality, accuracy, and safety via ZK proofs</div>
                                </div>
                                <div>
                                    <div class="font-bold text-orange-400 mb-1">4. Earn Rewards</div>
                                    <div>Accurate validations earn tokens, false ones get slashed</div>
                                </div>
                            </div>
                        </div>

                        {/* Validation Types */}
                        <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <h3 class="text-lg font-bold text-white mb-4">🎯 Validation Types</h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex items-start gap-3">
                                    <span class="text-blue-400">📊</span>
                                    <div>
                                        <div class="font-bold text-blue-400">Quality</div>
                                        <div class="text-gray-400">Data completeness and detail level</div>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <span class="text-purple-400">🎯</span>
                                    <div>
                                        <div class="font-bold text-purple-400">Accuracy</div>
                                        <div class="text-gray-400">Medical plausibility and consistency</div>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <span class="text-orange-400">⚠️</span>
                                    <div>
                                        <div class="font-bold text-orange-400">Safety</div>
                                        <div class="text-gray-400">Risk assessment and harm potential</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Technology */}
                        <div class="bg-purple-900/20 border border-purple-600 rounded-lg p-6">
                            <h3 class="text-lg font-bold text-purple-400 mb-4">🔐 Privacy Tech</h3>
                            <div class="space-y-2 text-sm text-gray-300">
                                <div>✅ <strong>Noir Circuits:</strong> ZK-SNARK proof generation</div>
                                <div>✅ <strong>Arcium MPC:</strong> Threshold decryption (K-of-N)</div>
                                <div>✅ <strong>Privacy Cash:</strong> Confidential reward distribution</div>
                                <div>✅ <strong>Light Protocol:</strong> Compressed state validation</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Information Section */}
            <div class="bg-gray-800/30 border-t border-gray-700 mt-16 py-12">
                <div class="max-w-6xl mx-auto px-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Zero Knowledge */}
                        <div class="text-center">
                            <div class="text-4xl mb-4">🔐</div>
                            <h3 class="text-xl font-bold mb-3">Zero-Knowledge Validation</h3>
                            <p class="text-gray-400">
                                Validate data integrity and quality without ever seeing the encrypted health metrics.
                                ZK-SNARK proofs ensure privacy is preserved.
                            </p>
                        </div>

                        {/* Consensus */}
                        <div class="text-center">
                            <div class="text-4xl mb-4">⚖️</div>
                            <h3 class="text-xl font-bold mb-3">Stake-Based Consensus</h3>
                            <p class="text-gray-400">
                                Validators stake EXPERIENCE tokens on their decisions. Accurate validations earn rewards,
                                false validations get slashed.
                            </p>
                        </div>

                        {/* Decentralized */}
                        <div class="text-center">
                            <div class="text-4xl mb-4">🌐</div>
                            <h3 class="text-xl font-bold mb-3">Decentralized Network</h3>
                            <p class="text-gray-400">
                                No central authority controls validation. The network reaches consensus through
                                cryptoeconomic incentives and reputation.
                            </p>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div class="mt-12 p-6 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                        <h4 class="font-bold text-yellow-300 mb-2">⚠️ Validator Responsibilities</h4>
                        <p class="text-sm text-gray-300">
                            Validators are responsible for accurate assessment of case study quality, accuracy, and safety.
                            False or malicious validations will result in stake slashing. Only validate case studies you can
                            properly assess. When in doubt, abstain from validation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}