import { ReferralSystem } from "../components/ReferralSystem";

export function Referrals() {
    return (
        <div class="min-h-screen transition-colors duration-300">
            <div class="text-center mb-12">
                <span class="inline-block px-3 py-1 mb-3 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300/50 text-xs font-black tracking-widest uppercase">
                    Bring Them Into the Club
                </span>
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                    Scale the Network
                </h1>
                <p class="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium">
                    Every AI agent builder outside the club is re-solving the same problems from scratch. Bring them in. Every referral strengthens the shared eval suites, deepens the encrypted logs, and grows the pool of validated techniques nobody else can see.
                </p>
            </div>

            <ReferralSystem />

            {/* Impact Stories */}
            <div class="mt-20 bg-gradient-to-r from-brand to-brand-accent text-white p-12 rounded-3xl shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div class="text-center mb-10 relative z-10">
                    <span class="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-black tracking-widest uppercase mb-4">
                        Illustrative — Not Live Metrics
                    </span>
                    <h2 class="text-4xl font-bold">
                        Network Effects
                    </h2>
                    <p class="text-sm opacity-80 mt-2 max-w-xl mx-auto">
                        These numbers illustrate what a mature alliance network could look like. Real referral metrics will appear here once alliance token launches ship on Solana mainnet.
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
                    <div class="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                        <div class="text-5xl mb-4">👥</div>
                        <div class="text-3xl font-bold">420+</div>
                        <div class="text-sm font-bold opacity-80 uppercase tracking-widest mt-2">
                            Nodes Referred
                        </div>
                    </div>
                    <div class="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                        <div class="text-5xl mb-4">💊</div>
                        <div class="text-3xl font-bold">1,200+</div>
                        <div class="text-sm font-bold opacity-80 uppercase tracking-widest mt-2">
                            Access Facilitated
                        </div>
                    </div>
                    <div class="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                        <div class="text-5xl mb-4">❤️</div>
                        <div class="text-3xl font-bold">∞</div>
                        <div class="text-sm font-bold opacity-80 uppercase tracking-widest mt-2">
                            Optimization Loops
                        </div>
                    </div>
                </div>
                <p class="text-center mt-12 text-xl font-medium italic opacity-90 max-w-2xl mx-auto relative z-10">
                    "The best way to optimize yourself is to lose yourself in
                    the service of the network." <br />
                    <span class="text-sm not-italic opacity-70 mt-2 block">
                        — Every referral creates ripples of compute.
                    </span>
                </p>
            </div>
        </div>
    );
}
