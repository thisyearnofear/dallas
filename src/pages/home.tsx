import { useState, useEffect } from "preact/hooks";

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
                        Diagnosed with AIDS in 1985 and given 30 days to live, Ron Woodroof wasn't the kind of man to go down without a fight. He smuggled unapproved, life-saving drugs into Texas and started the Dallas Buyers Club.
                    </p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-8 mb-8">
                    <div class="space-y-4">
                        <h3 class="text-2xl font-bold text-brand">The Revolution</h3>
                        <p class="text-lg">
                            This wasn't just about survival; it was a revolution. A middle finger to a system that had left them for dead. The club became a lifeline for hundreds of people, providing hope when there was none.
                        </p>
                    </div>
                    <div class="space-y-4">
                        <h3 class="text-2xl font-bold text-brand">The Impact</h3>
                        <p class="text-lg">
                            "Sometimes I feel like I'm fighting for a life I ain't got time to live."
                        </p>
                        <div class="bg-brand text-white p-4 rounded">
                            <p class="font-semibold">💊 Fighting for access to life-saving treatments</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Sovereignty Section */}
            <div class="bg-gradient-to-r from-blue-900/30 via-green-900/30 to-purple-900/30 border-2 border-green-500/50 text-white p-8 rounded-lg mb-8">
                <h2 class="text-3xl font-bold mb-4 flex items-center gap-2">
                    🔐 Health Sovereignty Platform
                </h2>
                <p class="text-xl mb-6">
                    We're building what the Dallas Buyers Club needed: a decentralized platform for health autonomy.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-black/30 p-4 rounded border border-green-500/30">
                        <h3 class="font-bold mb-2">🔒 Your Data, Your Control</h3>
                        <p class="text-sm text-gray-300">Share health journeys encrypted with your wallet key. Only you decrypt.</p>
                    </div>
                    <div class="bg-black/30 p-4 rounded border border-blue-500/30">
                        <h3 class="font-bold mb-2">👥 Community Validated</h3>
                        <p class="text-sm text-gray-300">Validators stake tokens. False claims get caught. Accuracy rewarded.</p>
                    </div>
                    <div class="bg-black/30 p-4 rounded border border-purple-500/30">
                        <h3 class="font-bold mb-2">⛓️ On-Chain Permanent</h3>
                        <p class="text-sm text-gray-300">Health journeys live on Solana. Immutable, transparent, global.</p>
                    </div>
                </div>
                <a 
                    class="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded hover:scale-105 transition-all duration-300" 
                    href="/experiences"
                >
                    🚀 Explore Health Sovereignty
                </a>
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
                <div class="mb-16 bg-gradient-to-br from-black via-red-900 to-black text-white p-8 rounded-lg border-2 border-red-500 shadow-2xl animate-fadeIn">
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
