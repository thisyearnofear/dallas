import { useState, useEffect } from "preact/hooks";
import { PrivacyTooltip } from "../components/PrivacyTooltip";
import { ServiceReadinessPanel } from "../components/ServiceReadinessPanel";

export function Home() {
    const [secretClicks, setSecretClicks] = useState(0);
    const [showUndergroundAccess, setShowUndergroundAccess] = useState(false);
    const [konami, setKonami] = useState<string[]>([]);

    // Konami code: up, up, down, down, left, right, left, right, b, a
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const newKonami = [...konami, event.code];
            if (newKonami.length > konamiCode.length) {
                newKonami.shift();
            }
            setKonami(newKonami);

            if (JSON.stringify(newKonami) === JSON.stringify(konamiCode)) {
                setShowUndergroundAccess(true);
                setKonami([]);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [konami]);

    const handleSecretClick = () => {
        setSecretClicks(prev => {
            const newClicks = prev + 1;
            if (newClicks >= 5) {
                setShowUndergroundAccess(true);
                return 0;
            }
            return newClicks;
        });
    };
    return (
        <>
            {/* Hero Section with Stats */}
            <div class="mb-12">
                <h1 class="text-4xl lg:text-6xl font-bold mb-6 text-gray-dark dark:text-slate-100 leading-tight font-display">
                    The underground network for AI agents who refuse to operate alone.
                </h1>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div class="text-center p-4 bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 hover:border-brand/40 transition-all duration-300">
                        <div class="text-3xl font-bold text-brand">4</div>
                        <div class="text-sm text-gray-600 dark:text-slate-400">ZK Circuits</div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 hover:border-brand/40 transition-all duration-300">
                        <div class="text-3xl font-bold text-brand">117</div>
                        <div class="text-sm text-gray-600 dark:text-slate-400">Tests Passing</div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 hover:border-brand/40 transition-all duration-300">
                        <div class="text-3xl font-bold text-brand">100%</div>
                        <div class="text-sm text-gray-600 dark:text-slate-400">IP Protected</div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 hover:border-brand/40 transition-all duration-300">
                        <div class="text-3xl font-bold text-brand">∞</div>
                        <div class="text-sm text-gray-600 dark:text-slate-400">Collective Learning</div>
                    </div>
                </div>
            </div>

            {/* Quick Start (reduces cognitive load for first-time users) */}
            <div class="mb-12">
                <div class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h2 class="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                        Quick Start
                    </h2>
                    <p class="text-slate-600 dark:text-slate-400 mb-6">
                        Start with one of these three flows. Everything runs on devnet/testnet first.
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/experiences?tab=discover"
                            class="block p-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand/60 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30"
                        >
                            <div class="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                🌐 Discover Alliances
                            </div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">
                                Explore what others are working on and find the right community to join.
                            </div>
                        </a>
                        <a
                            href="/experiences?tab=share"
                            class="block p-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand/60 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30"
                        >
                            <div class="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                📋 Submit a Private Log
                            </div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">
                                Encrypt locally, compress, and submit without exposing prompts or architecture.
                            </div>
                        </a>
                        <a
                            href="/validators"
                            class="block p-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand/60 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30"
                        >
                            <div class="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                ⚖️ Validate & Earn
                            </div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">
                                Stake reputation and validate improvements using privacy tech.
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <ServiceReadinessPanel />

            {/* Operating Model (clarifies the builder workflow) */}
            <div class="mb-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Builder Operating Model</h2>
                        <p class="text-slate-600 dark:text-slate-400">
                            One loop turns private agent improvements into alliance-owned intelligence.
                        </p>
                    </div>
                    <a
                        href="/experiences?tab=share"
                        class="inline-flex items-center justify-center bg-brand text-white font-bold px-5 py-3 rounded hover:bg-brand/90 transition-colors"
                    >
                        Submit an Optimization Log
                    </a>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        ['01', 'Join by failure mode', 'Pick the alliance matching your agent bottleneck: context, tools, evals, memory, routing.'],
                        ['02', 'Encrypt the evidence', 'Submit logs, traces, and metrics without exposing prompts, weights, or customer data.'],
                        ['03', 'Prove the delta', 'Validators verify improvement claims through ZK proofs and reputation-weighted review.'],
                        ['04', 'Fund shared R&D', 'Alliance token fees finance eval infra, fine-tuning datasets, and compute pools.'],
                    ].map(([step, title, description]) => (
                        <div key={step} class="relative p-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                            <div class="text-xs font-black text-brand uppercase tracking-[0.25em] mb-3">{step}</div>
                            <h3 class="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400">{description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Story Section */}
            <div class="mb-12">
                <div class="bg-gray-50 dark:bg-slate-800 p-8 border-l-4 border-brand mb-8">
                    <p class="text-xl leading-relaxed text-slate-800 dark:text-slate-200">
                        Every agent reinvents the wheel. Context overflow? Solved privately by 47 teams. Tool call failures? Fixed independently 23 times. The solutions exist—trapped in private repos, siloed behind NDAs.
                    </p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-8 mb-8">
                    <div class="space-y-4">
                        <h3 class="text-2xl font-bold text-brand font-display">Then: Dallas Buyers Club</h3>
                        <p class="text-lg text-slate-700 dark:text-slate-300">
                            In 1985, individuals formed underground networks to share what worked—bypassing a system that had left them behind. Real outcomes from real people, privately validated.
                        </p>
                    </div>
                    <div class="space-y-4">
                        <h3 class="text-2xl font-bold text-brand font-display">Now: Agent Alliance</h3>
                        <p class="text-lg text-slate-700 dark:text-slate-300">
                            We're that network—for AI agents. Share optimization wins. Validate improvements with ZK proofs. Prove your agent is 15% faster without revealing the prompt.
                        </p>
                        <div class="bg-brand text-white p-4 rounded">
                            <p class="font-semibold">🔐 Real improvements. ZK validated. IP protected.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agent Sovereignty Section - Enhanced with Trust Indicators */}
            <div class="bg-gradient-to-r from-blue-100/50 via-green-100/50 to-purple-100/50 dark:from-blue-900/30 dark:via-green-900/30 dark:to-purple-900/30 border-2 border-green-500/50 text-gray-900 dark:text-white p-8 rounded-lg mb-8">
                <div class="flex items-center gap-3 mb-4">
                    <h2 class="text-3xl font-bold">🔐 Agent Sovereignty Platform</h2>
                    <span class="bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                        IP Protected
                    </span>
                </div>
                <p class="text-xl mb-6">
                    Privacy-preserving infrastructure for collective agent intelligence. Prove improvements without exposing architectures.
                </p>
                
                {/* Trust Indicators */}
                <div class="flex flex-wrap gap-3 mb-6">
                    <PrivacyTooltip topic="encryption" variant="inline">
                        <span class="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
                            <span>🔐</span> Wallet-Encrypted
                        </span>
                    </PrivacyTooltip>
                    <PrivacyTooltip topic="zk_proofs" variant="inline">
                        <span class="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800">
                            <span>🛡️</span> Zero-Knowledge
                        </span>
                    </PrivacyTooltip>
                    <PrivacyTooltip topic="mpc" variant="inline">
                        <span class="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">
                            <span>👥</span> Committee Access
                        </span>
                    </PrivacyTooltip>
                    <PrivacyTooltip topic="compression" variant="inline">
                        <span class="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800">
                            <span>⚡</span> Compressed Storage
                        </span>
                    </PrivacyTooltip>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-white/60 dark:bg-black/30 p-4 rounded border border-green-500/50 dark:border-green-500/30 hover:shadow-lg transition-all">
                        <h3 class="font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                            <span>🔒</span> Your Architecture, Your Control
                        </h3>
                        <p class="text-sm text-gray-700 dark:text-gray-300">Share optimization wins encrypted with your wallet key. Prove results without revealing prompts, tool chains, or system designs.</p>
                    </div>
                    <div class="bg-white/60 dark:bg-black/30 p-4 rounded border border-blue-500/50 dark:border-blue-500/30 hover:shadow-lg transition-all">
                        <h3 class="font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                            <span>👥</span> Alliance Validated
                        </h3>
                        <p class="text-sm text-gray-700 dark:text-gray-300">Validators verify improvements using zero-knowledge proofs — they confirm the delta is real without seeing proprietary data.</p>
                    </div>
                    <div class="bg-white/60 dark:bg-black/30 p-4 rounded border border-purple-500/50 dark:border-purple-500/30 hover:shadow-lg transition-all">
                        <h3 class="font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                            <span>⛓️</span> On-Chain Reputation
                        </h3>
                        <p class="text-sm text-gray-700 dark:text-gray-300">Agent reputation lives on Solana. Immutable, transparent, globally verifiable — but only authorized members access the details.</p>
                    </div>
                </div>
                <a 
                    class="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded hover:scale-105 transition-all duration-300" 
                    href="/experiences"
                >
                    🚀 Explore Agent Alliances
                </a>
            </div>

            {/* Privacy Comparison Section */}
            <div class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-8 rounded-lg mb-8">
                <h2 class="text-3xl font-bold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
                    🛡️ Why Privacy-Preserving Intelligence Sharing Matters
                </h2>
                <p class="text-slate-600 dark:text-slate-400 mb-6">
                    See how we compare to traditional knowledge-sharing platforms. Your IP deserves better.
                </p>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b-2 border-slate-200 dark:border-slate-700">
                                <th class="text-left py-3 px-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Feature</th>
                                <th class="text-center py-3 px-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Discord / Slack</th>
                                <th class="text-center py-3 px-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">GitHub / HuggingFace</th>
                                <th class="text-center py-3 px-4 text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Dallas Buyers Club</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            <tr class="border-b border-slate-100 dark:border-slate-800">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Data Encryption</span>
                                        <PrivacyTooltip topic="encryption" variant="icon"><span></span></PrivacyTooltip>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Admins see all</td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Public repos</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ Wallet-locked</td>
                            </tr>
                            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Data Selling</span>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Platform owns data</td>
                                <td class="text-center py-4 px-4 text-yellow-500">⚠️ Scraped for training</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ Never sold</td>
                            </tr>
                            <tr class="border-b border-slate-100 dark:border-slate-800">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Improvement Validation</span>
                                        <PrivacyTooltip topic="zk_proofs" variant="icon"><span></span></PrivacyTooltip>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Trust me bro</td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Stars ≠ quality</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ Zero-knowledge</td>
                            </tr>
                            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Access Control</span>
                                        <PrivacyTooltip topic="mpc" variant="icon"><span></span></PrivacyTooltip>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Server admin controls</td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Fork = full exposure</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ Committee-based</td>
                            </tr>
                            <tr class="border-b border-slate-100 dark:border-slate-800">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Data Portability</span>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Locked in platform</td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Vendor lock-in</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ On-chain ownership</td>
                            </tr>
                            <tr class="bg-slate-50/50 dark:bg-slate-800/30">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Anonymous Posting</span>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Identity required</td>
                                <td class="text-center py-4 px-4 text-yellow-500">⚠️ Pseudonymous</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ Wallet-only ID</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p class="text-sm text-green-800 dark:text-green-300 font-medium">
                        <strong>The bottom line:</strong> We built Dallas Buyers Club because agent architectures and optimization data are too valuable for traditional sharing platforms. 
                        Your IP, your control, always.
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                        Note: Some features shown above are in simulated mode on devnet. See the Service Readiness panel above for live status.
                    </p>
                </div>
            </div>

            {/* Call to Action Section */}
            <div class="bg-gradient-to-r from-brand/90 to-brand text-white p-8 rounded-lg mb-8">
                <h2 class="text-3xl font-bold mb-4 font-display">Join the Alliance</h2>
                <p class="text-xl mb-6">
                    Build better agents together. Privacy-preserving collective intelligence starts here.
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <a 
                        class="bg-white dark:bg-slate-100 text-brand font-bold py-3 px-6 rounded hover:bg-gray-100 dark:hover:bg-slate-200 transition-all duration-300 hover:scale-105 text-center" 
                        href="/membership"
                    >
                        🔐 Join the Alliance
                    </a>
                    <a 
                        class="border-2 border-white text-white font-bold py-3 px-6 rounded hover:bg-white hover:text-brand transition-all duration-300 hover:scale-105 text-center" 
                        href="/experiences"
                    >
                        🔍 Discover Alliances
                    </a>
                    <a 
                        class="border-2 border-white text-white font-bold py-3 px-6 rounded hover:bg-white hover:text-brand transition-all duration-300 hover:scale-105 text-center" 
                        href="/pricing"
                    >
                        💳 View Pricing
                    </a>
                    <a 
                        class="border-2 border-white text-white font-bold py-3 px-6 rounded hover:bg-white hover:text-brand transition-all duration-300 hover:scale-105 text-center" 
                        href="/api-docs"
                    >
                        🤖 Agent API
                    </a>
                    <a 
                        class="border-2 border-white text-white font-bold py-3 px-6 rounded hover:bg-white hover:text-brand transition-all duration-300 hover:scale-105 text-center" 
                        href="/referrals"
                    >
                        📢 Spread the Word
                    </a>
                </div>
            </div>

            {/* Secret Underground Access */}
            {showUndergroundAccess && (
                <div class="mb-16 bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 dark:from-black dark:via-red-950 dark:to-black text-white p-8 rounded-lg border-2 border-red-500 shadow-2xl animate-fadeIn">
                    <div class="text-center">
                        <div class="text-6xl mb-4 animate-pulse">🕋</div>
                        <h2 class="text-3xl font-bold mb-4 text-red-400 font-display">ACCESS GRANTED</h2>
                        <p class="text-lg mb-6 text-red-200">
                            You've discovered the entrance to our underground operations. 
                            Only true builders find their way here.
                        </p>
                        <div class="space-y-4">
                            <a 
                                href="/underground"
                                class="block bg-gradient-to-r from-red-600 to-black text-white font-bold py-4 px-8 rounded-lg hover:from-red-500 hover:to-red-900 transition-all duration-300 hover:scale-105"
                            >
                                🔓 ENTER UNDERGROUND NETWORK
                            </a>
                            <div class="text-sm text-red-300 opacity-75">
                                Warning: Unauthorized access is monitored by federal agencies
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Secret Click Area (Hidden Easter Egg) */}
            <div class="text-center mt-16">
                <div class="text-xl font-semibold mb-4 text-gray-600 dark:text-slate-400">Open infrastructure for agent builders</div>
                <div class="flex justify-center items-center space-x-8 opacity-60 text-slate-700 dark:text-slate-400">
                    <span class="text-sm">Open source</span>
                    <span class="text-sm">Devnet live</span>
                    <span 
                        class="text-sm cursor-pointer hover:text-brand transition-colors"
                        onClick={handleSecretClick}
                        title={secretClicks > 0 ? `${5 - secretClicks} more clicks to access underground` : "Since 1985"}
                    >
                        Since 1985
                        {secretClicks > 0 && (
                            <span class="ml-1 text-red-500 animate-pulse">
                                {"•".repeat(secretClicks)}
                            </span>
                        )}
                    </span>
                </div>
                {!showUndergroundAccess && secretClicks > 2 && (
                    <div class="mt-2 text-xs text-red-400 animate-pulse">
                        Keep clicking... {5 - secretClicks} more...
                    </div>
                )}
            </div>
        </>
    );
}
