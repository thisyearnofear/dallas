import { useState, useEffect } from "preact/hooks";
import { PrivacyTooltip } from "../components/PrivacyTooltip";

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
                <h1 class="text-4xl lg:text-6xl font-bold mb-6 text-gray-dark leading-tight">
                    "There ain't nothin' out there can kill fuckin' Ron Woodroof in 30 days."
                </h1>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div class="text-center p-4 bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 hover:border-brand/40 transition-all duration-300">
                        <div class="text-3xl font-bold text-brand">30</div>
                        <div class="text-sm text-gray-600">Days to Live</div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 hover:border-brand/40 transition-all duration-300">
                        <div class="text-3xl font-bold text-brand">1985</div>
                        <div class="text-sm text-gray-600">Year Diagnosed</div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 hover:border-brand/40 transition-all duration-300">
                        <div class="text-3xl font-bold text-brand">100s</div>
                        <div class="text-sm text-gray-600">Lives Saved</div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 hover:border-brand/40 transition-all duration-300">
                        <div class="text-3xl font-bold text-brand">∞</div>
                        <div class="text-sm text-gray-600">Legacy</div>
                    </div>
                </div>
            </div>

            {/* Story Section */}
            <div class="mb-12">
                <div class="bg-gray-50 p-8 border-l-4 border-brand mb-8">
                    <p class="text-xl leading-relaxed">
                        Diagnosed with AIDS in 1985 and given 30 days to live, Ron Woodroof smuggled unapproved treatments into Texas and started the Dallas Buyers Club—a community where people shared what worked.
                    </p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-8 mb-8">
                    <div class="space-y-4">
                        <h3 class="text-2xl font-bold text-brand">Then: Underground Network</h3>
                        <p class="text-lg">
                            Hundreds of people shared treatment experiences, bypassing a system that had left them behind. Real outcomes from real people.
                        </p>
                    </div>
                    <div class="space-y-4">
                        <h3 class="text-2xl font-bold text-brand">Now: Our Turn</h3>
                        <p class="text-lg">
                            We're that network—for wellness experiments. Share that 30-day collagen trial. Track a cold exposure protocol. Discover what's working for others. Heal the world.
                        </p>
                        <div class="bg-brand text-white p-4 rounded">
                            <p class="font-semibold">🧪 Real experiences. Community validated. Privacy protected.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Sovereignty Section - Enhanced with Trust Indicators */}
            <div class="bg-gradient-to-r from-blue-100/50 via-green-100/50 to-purple-100/50 dark:from-blue-900/30 dark:via-green-900/30 dark:to-purple-900/30 border-2 border-green-500/50 text-gray-900 dark:text-white p-8 rounded-lg mb-8">
                <div class="flex items-center gap-3 mb-4">
                    <h2 class="text-3xl font-bold">🔐 Health Sovereignty Platform</h2>
                    <span class="bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                        Privacy First
                    </span>
                </div>
                <p class="text-xl mb-6">
                    We're building what the Dallas Buyers Club needed: a decentralized platform for health autonomy.
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
                            <span>🔒</span> Your Data, Your Control
                        </h3>
                        <p class="text-sm text-gray-700 dark:text-gray-300">Share health journeys encrypted with your wallet key. Only you can decrypt — we literally cannot access it.</p>
                    </div>
                    <div class="bg-white/60 dark:bg-black/30 p-4 rounded border border-blue-500/50 dark:border-blue-500/30 hover:shadow-lg transition-all">
                        <h3 class="font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                            <span>👥</span> Community Validated
                        </h3>
                        <p class="text-sm text-gray-700 dark:text-gray-300">Validators verify data quality using zero-knowledge proofs — they confirm it's valid without seeing sensitive details.</p>
                    </div>
                    <div class="bg-white/60 dark:bg-black/30 p-4 rounded border border-purple-500/50 dark:border-purple-500/30 hover:shadow-lg transition-all">
                        <h3 class="font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                            <span>⛓️</span> On-Chain Permanent
                        </h3>
                        <p class="text-sm text-gray-700 dark:text-gray-300">Health journeys live on Solana. Immutable, transparent, globally accessible — but only to those you authorize.</p>
                    </div>
                </div>
                <a 
                    class="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded hover:scale-105 transition-all duration-300" 
                    href="/experiences"
                >
                    🚀 Explore Health Sovereignty
                </a>
            </div>

            {/* Privacy Comparison Section */}
            <div class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-8 rounded-lg mb-8">
                <h2 class="text-3xl font-bold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
                    🛡️ Why Privacy Matters
                </h2>
                <p class="text-slate-600 dark:text-slate-400 mb-6">
                    See how we compare to traditional health platforms. Your data deserves better.
                </p>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b-2 border-slate-200 dark:border-slate-700">
                                <th class="text-left py-3 px-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Feature</th>
                                <th class="text-center py-3 px-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Facebook Groups</th>
                                <th class="text-center py-3 px-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reddit</th>
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
                                <td class="text-center py-4 px-4 text-red-500">❌ Server can read</td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Public by default</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ Wallet-locked</td>
                            </tr>
                            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Data Selling</span>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Sold to advertisers</td>
                                <td class="text-center py-4 px-4 text-yellow-500">⚠️ Shared with partners</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ Never sold</td>
                            </tr>
                            <tr class="border-b border-slate-100 dark:border-slate-800">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Validation Privacy</span>
                                        <PrivacyTooltip topic="zk_proofs" variant="icon"><span></span></PrivacyTooltip>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ No validation</td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Moderators see all</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ Zero-knowledge</td>
                            </tr>
                            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Access Control</span>
                                        <PrivacyTooltip topic="mpc" variant="icon"><span></span></PrivacyTooltip>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Company controls</td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Public forever</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ Committee-based</td>
                            </tr>
                            <tr class="border-b border-slate-100 dark:border-slate-800">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Data Portability</span>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Locked in platform</td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Hard to export</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ On-chain ownership</td>
                            </tr>
                            <tr class="bg-slate-50/50 dark:bg-slate-800/30">
                                <td class="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <span>Anonymous Posting</span>
                                    </div>
                                </td>
                                <td class="text-center py-4 px-4 text-red-500">❌ Real name required</td>
                                <td class="text-center py-4 px-4 text-yellow-500">⚠️ Pseudonymous</td>
                                <td class="text-center py-4 px-4 text-green-600 font-bold">✅ Wallet-only ID</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p class="text-sm text-green-800 dark:text-green-300 font-medium">
                        <strong>💡 The bottom line:</strong> We built Dallas Buyers Club because we believe health data is too sensitive for traditional social media. 
                        Your experiments, your control, always.
                    </p>
                </div>
            </div>

            {/* Call to Action Section */}
            <div class="bg-gradient-to-r from-brand/90 to-brand text-white p-8 rounded-lg mb-8">
                <h2 class="text-3xl font-bold mb-4">Join the Movement</h2>
                <p class="text-xl mb-6">
                    Support the community and learn more about Ron's story.
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a 
                        class="bg-white text-brand font-bold py-3 px-6 rounded hover:bg-gray-100 transition-all duration-300 hover:scale-105 text-center" 
                        href="/membership"
                    >
                        🤝 Join the Fight
                    </a>
                    <a 
                        class="border-2 border-white text-white font-bold py-3 px-6 rounded hover:bg-white hover:text-brand transition-all duration-300 hover:scale-105 text-center" 
                        href="/experiences"
                    >
                        🔍 Discover Protocols
                    </a>
                    <a 
                        class="border-2 border-white text-white font-bold py-3 px-6 rounded hover:bg-white hover:text-brand transition-all duration-300 hover:scale-105 text-center" 
                        href="/achievements"
                    >
                        🏆 Track Progress
                    </a>
                    <a 
                        class="border-2 border-white text-white font-bold py-3 px-6 rounded hover:bg-white hover:text-brand transition-all duration-300 hover:scale-105 text-center" 
                        href="/referrals"
                    >
                        📢 Spread Hope
                    </a>
                </div>
            </div>

            {/* Secret Underground Access */}
            {showUndergroundAccess && (
                <div class="mb-16 bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 dark:from-black dark:via-red-900 dark:to-black text-white p-8 rounded-lg border-2 border-red-500 shadow-2xl animate-fadeIn">
                    <div class="text-center">
                        <div class="text-6xl mb-4 animate-pulse">🕋</div>
                        <h2 class="text-3xl font-bold mb-4 text-red-400">ACCESS GRANTED</h2>
                        <p class="text-lg mb-6 text-red-200">
                            You've discovered the entrance to our underground operations. 
                            Only true fighters find their way here.
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
                <div class="text-xl font-semibold mb-4 text-gray-600">Trusted by the community</div>
                <div class="flex justify-center items-center space-x-8 opacity-60">
                    <span class="text-lg">⭐⭐⭐⭐⭐</span>
                    <span class="text-sm">420+ members</span>
                    <span class="text-sm">69+ success stories</span>
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
