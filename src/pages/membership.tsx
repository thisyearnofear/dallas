import { MembershipFlow } from "../components/MembershipFlow";
import { MembershipPurchase } from "../components/MembershipPurchase";

export function Membership() {
    return (
        <div class="min-h-screen transition-colors duration-300">
            <div class="text-center mb-12">
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Join the Revolution</h1>
                <p class="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium">
                    Become part of something bigger. Fight for access to life-saving treatments and support others on their journey.
                </p>
            </div>

            <div class="mb-16">
                <h2 class="text-3xl font-black mb-10 text-center text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Membership Tiers</h2>
                <MembershipPurchase />
            </div>

            <MembershipFlow />

            {/* Why Join Section */}
            <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                <div class="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
                    <div class="text-5xl mb-6 group-hover:scale-110 transition-transform">🤝</div>
                    <h3 class="text-xl font-bold mb-3 text-blue-700 dark:text-blue-400">Community Support</h3>
                    <p class="text-slate-600 dark:text-slate-400 font-medium">
                        Connect with others who understand your journey. Share experiences and find hope together.
                    </p>
                </div>
                
                <div class="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
                    <div class="text-5xl mb-6 group-hover:scale-110 transition-transform">💊</div>
                    <h3 class="text-xl font-bold mb-3 text-green-700 dark:text-green-400">Access to Treatments</h3>
                    <p class="text-slate-600 dark:text-slate-400 font-medium">
                        Get information about alternative treatments that might not be available through traditional channels.
                    </p>
                </div>
                
                <div class="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
                    <div class="text-5xl mb-6 group-hover:scale-110 transition-transform">⚡</div>
                    <h3 class="text-xl font-bold mb-3 text-purple-700 dark:text-purple-400">Make a Difference</h3>
                    <p class="text-slate-600 dark:text-slate-400 font-medium">
                        Help change the system by being part of a movement that puts patients first.
                    </p>
                </div>
            </div>
        </div>
    );
}