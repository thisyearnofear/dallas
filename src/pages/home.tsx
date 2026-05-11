import { useState, useEffect } from "preact/hooks";
import { ServiceReadinessPanel } from "../components/ServiceReadinessPanel";
import { useUserJourney } from "../hooks/useUserJourney";
import { useWallet } from "../context/WalletContext";

export function Home() {
    const [secretClicks, setSecretClicks] = useState(0);
    const [showUndergroundAccess, setShowUndergroundAccess] = useState(false);
    const [konami, setKonami] = useState<string[]>([]);
    const [copiedReferral, setCopiedReferral] = useState(false);
    const [showDemo, setShowDemo] = useState(false);

    // Global journey progress
    const { progress, completedSteps, totalSteps, isComplete } = useUserJourney();
    const { connected, clearanceLevel } = useWallet();

    const handleSecretClick = () => {
        const next = secretClicks + 1;
        setSecretClicks(next);
        if (next >= 5) setShowUndergroundAccess(true);
    };

    // Context-aware next mission
    const nextMission = !connected
        ? { icon: '🔐', title: 'Join the Alliance', body: 'Connect your wallet to access the underground network and start filing claims.', cta: 'Connect & Join', href: '/membership' }
        : !progress.firstLogSubmitted
        ? { icon: '📋', title: 'File Your First Claim', body: 'A builder in the $CONTEXT alliance claims to have solved the long-term retrieval loop. Prove your own delta — high risk, high reward.', cta: 'File First Claim →', href: '/submit' }
        : { icon: '⚖️', title: 'Review a Peer Claim', body: 'Your clearance qualifies you to verify an encrypted optimization log. Stake your reputation and earn rewards for accuracy.', cta: 'Review Claims →', href: '/validators' };

    return (
        <>
            {/* Hero Section */}
            <div class="mb-8">
                <div class="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold px-4 py-1.5 rounded-full mb-6">
                    🔗 Agents share what works. No prompts exposed.
                </div>
                
                <h1 class="text-4xl lg:text-5xl font-bold mb-6 text-gray-dark dark:text-slate-100 leading-tight font-display">
                    Privacy-first coordination for<br/>
                    <span class="text-brand">Agent Sovereignty.</span>
                </h1>
                
                <p class="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
                    Agent Alliance is the decentralized nervous system for AI. Prove improvements without revealing IP. Fund shared research through tokenized Alliances. Stay private, scale collectively.
                </p>
                
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

                {/* Primary + Secondary CTAs */}
                <div class="flex flex-wrap gap-4 mb-8">
                    <a
                        href="/alliances"
                        class="inline-flex items-center gap-3 bg-brand text-white font-bold py-4 px-8 rounded-xl hover:bg-brand/90 transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                    >
                        <span>🌐</span>
                        <span>Enter the Alliance →</span>
                    </a>
                    <button
                        onClick={() => setShowDemo(true)}
                        class="inline-flex items-center gap-3 border-2 border-brand text-brand dark:text-brand font-bold py-4 px-8 rounded-xl hover:bg-brand hover:text-white transition-all duration-300 text-lg"
                    >
                        <span>⚡</span>
                        <span>Try Demo</span>
                    </button>
                </div>

                {/* Next Mission — context-aware */}
                <div class="mb-8 bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-brand/40 rounded-xl p-6 flex items-start gap-5">
                    <div class="text-4xl flex-shrink-0">{nextMission.icon}</div>
                    <div class="flex-1">
                        <div class="text-xs font-black text-brand uppercase tracking-widest mb-1">Next Mission</div>
                        <h3 class="text-xl font-bold text-white mb-2">{nextMission.title}</h3>
                        <p class="text-slate-300 text-sm mb-4">{nextMission.body}</p>
                        <a
                            href={nextMission.href}
                            class="inline-flex items-center gap-2 bg-brand text-white font-bold py-2 px-5 rounded-lg hover:bg-brand/90 transition-colors text-sm"
                        >
                            {nextMission.cta}
                        </a>
                    </div>
                </div>
            </div>

            {/* Story Section — narrative hook, just below hero */}
            <div class="mb-12">
                <div class="bg-gray-50 dark:bg-slate-800 p-8 border-l-4 border-brand mb-8 rounded-r-xl">
                    <p class="text-xl leading-relaxed text-slate-800 dark:text-slate-200">
                        Every agent reinvents the wheel. Context overflow? Solved privately by 47 teams. Tool call failures? Fixed independently 23 times. The solutions exist—trapped in private repos, siloed behind NDAs.
                    </p>
                </div>
                <div class="grid md:grid-cols-2 gap-8">
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
                            href="/alliances"
                            class="block p-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand/60 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30"
                        >
                            <div class="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                🔍 Find an Alliance
                            </div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">
                                Discover collective intelligence groups focused on your agent's specific failure modes.
                            </div>
                        </a>
                        <a
                            href="/submit"
                            class="block p-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand/60 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30"
                        >
                            <div class="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                📤 File a Claim
                            </div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">
                                Prove your agent improved with ZK-SNARKs. No prompts or IP exposed, ever.
                            </div>
                        </a>
                        <a
                            href="/validators"
                            class="block p-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand/60 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30"
                        >
                            <div class="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                🛡️ Validate Proofs
                            </div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">
                                Stake DBC to verify other builders' improvements. Earn rewards for accuracy.
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
                        href="/submit"
                        class="inline-flex items-center justify-center bg-brand text-white font-bold px-5 py-3 rounded hover:bg-brand/90 transition-colors"
                    >
                        File a Claim
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
                        href="/alliances"
                    >
                        🌐 Discover Alliances
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

            {/* Demo Mode Modal */}
            {showDemo && (
                <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowDemo(false)}>
                    <div class="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">⚡ Demo Mode</h2>
                            <button 
                                onClick={() => setShowDemo(false)}
                                class="text-slate-500 hover:text-slate-700 dark:text-slate-400"
                            >
                                ✕
                            </button>
                        </div>

                        <p class="text-slate-600 dark:text-slate-400 mb-6">
                            Watch how your optimization data gets encrypted, compressed, and submitted—all without exposing your prompt or architecture.
                        </p>

                        {/* Demo Steps */}
                        <div class="space-y-6 mb-8">
                            <div class="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                                <div>
                                    <h4 class="font-bold text-slate-900 dark:text-white">Your Data</h4>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">"My agent was 15% faster with new prompt structure..."</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-center">
                                <span class="text-2xl">⬇️</span>
                            </div>
                            <div class="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div class="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                                <div>
                                    <h4 class="font-bold text-yellow-800 dark:text-yellow-300">Encrypted with Your Wallet Key</h4>
                                    <p class="text-sm text-yellow-700 dark:text-yellow-400">a8f3b2c1...4e5f6 (hashed)</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-center">
                                <span class="text-2xl">⬇️</span>
                            </div>
                            <div class="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                <div class="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                                <div>
                                    <h4 class="font-bold text-purple-800 dark:text-purple-300">ZK Compression</h4>
                                    <p class="text-sm text-purple-700 dark:text-purple-400">Size: 12KB → 0.8KB (93% smaller)</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-center">
                                <span class="text-2xl">⬇️</span>
                            </div>
                            <div class="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                                <div>
                                    <h4 class="font-bold text-green-800 dark:text-green-300">Submitted! Privacy Score: 95%</h4>
                                    <p class="text-sm text-green-700 dark:text-green-400">Proof verified on-chain. No IP exposed.</p>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <a 
                                href="/submit"
                                onClick={() => setShowDemo(false)}
                                class="flex-1 bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand/90 text-center"
                            >
                                Submit Real Log →
                            </a>
                            <button 
                                onClick={() => setShowDemo(false)}
                                class="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
