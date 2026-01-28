import { ReferralSystem } from "../components/ReferralSystem";

export function Referrals() {
    return (
        <div class="min-h-screen transition-colors duration-300">
            <div class="text-center mb-12">
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Spread Hope</h1>
                <p class="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium">
                    Help others find the treatments they need. Every person you refer could be a life saved.
                </p>
            </div>

            <ReferralSystem />

            {/* Impact Stories */}
            <div class="mt-20 bg-gradient-to-r from-brand to-brand-accent text-white p-12 rounded-3xl shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                
                <h2 class="text-4xl font-bold mb-10 text-center relative z-10">The Impact of Sharing</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
                    <div class="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                        <div class="text-5xl mb-4">👥</div>
                        <div class="text-3xl font-bold">420+</div>
                        <div class="text-sm font-bold opacity-80 uppercase tracking-widest mt-2">Members Referred</div>
                    </div>
                    <div class="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                        <div class="text-5xl mb-4">💊</div>
                        <div class="text-3xl font-bold">1,200+</div>
                        <div class="text-sm font-bold opacity-80 uppercase tracking-widest mt-2">Access Facilitated</div>
                    </div>
                    <div class="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                        <div class="text-5xl mb-4">❤️</div>
                        <div class="text-3xl font-bold">∞</div>
                        <div class="text-sm font-bold opacity-80 uppercase tracking-widest mt-2">Lives Touched</div>
                    </div>
                </div>
                <p class="text-center mt-12 text-xl font-medium italic opacity-90 max-w-2xl mx-auto relative z-10">
                    "The best way to find yourself is to lose yourself in the service of others." <br/>
                    <span class="text-sm not-italic opacity-70 mt-2 block">— Every referral creates ripples of hope.</span>
                </p>
            </div>
        </div>
    );
}