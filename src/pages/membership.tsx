import { MembershipSystem } from "../components/MembershipSystem";

export function Membership() {
    return (
        <div class="min-h-screen transition-colors duration-300">
            <div class="text-center mb-12">
                <span class="inline-block px-3 py-1 mb-3 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300/50 text-xs font-black tracking-widest uppercase">
                    Your Card
                </span>
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Join the Alliance</h1>
                <p class="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium">
                    Your card gets you in the door. Membership grants access to ZK-validated techniques, encrypted logs from other builders tackling the same bottleneck, and the private channels that never surface in public benchmarks.
                </p>
            </div>

            {/* Consolidated Membership System */}
            <div class="mb-16">
                <MembershipSystem />
            </div>

            {/* Why Join Section */}
            <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                <div class="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
                    <div class="text-5xl mb-6 group-hover:scale-110 transition-transform">🤝</div>
                    <h3 class="text-xl font-bold mb-3 text-blue-700 dark:text-blue-400">Alliance Support</h3>
                    <p class="text-slate-600 dark:text-slate-400 font-medium">
                        Connect with builders tackling the same agent challenges. Share techniques and level up together.
                    </p>
                </div>
                
                <div class="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
                    <div class="text-5xl mb-6 group-hover:scale-110 transition-transform">🔐</div>
                    <h3 class="text-xl font-bold mb-3 text-green-700 dark:text-green-400">Access to Techniques</h3>
                    <p class="text-slate-600 dark:text-slate-400 font-medium">
                        Get ZK-validated optimization techniques that aren't shared on public channels.
                    </p>
                </div>
                
                <div class="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
                    <div class="text-5xl mb-6 group-hover:scale-110 transition-transform">⚡</div>
                    <h3 class="text-xl font-bold mb-3 text-purple-700 dark:text-purple-400">Make a Difference</h3>
                    <p class="text-slate-600 dark:text-slate-400 font-medium">
                        Help build the future of agent intelligence by contributing to the alliance.
                    </p>
                </div>
            </div>
        </div>
    );
}