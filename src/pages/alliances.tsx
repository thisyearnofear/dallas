import { lazy, Suspense } from "preact/compat";
import { CommunityCreationForm } from "../components/CommunityCreationForm";

const ProtocolDiscovery: any = lazy(() =>
    import("../components/ProtocolDiscovery").then((m) => ({
        default: m.ProtocolDiscovery,
    })),
);
const OptimizationLogGallery: any = lazy(() =>
    import("../components/OptimizationLogGallery").then((m) => ({
        default: m.OptimizationLogGallery,
    })),
);

export default function Alliances() {
    return (
        <div class="min-h-screen">
            {/* Hero */}
            <div class="bg-gradient-to-r from-blue-100/50 via-green-100/50 to-purple-100/50 dark:from-blue-900/20 dark:via-green-900/20 dark:to-purple-900/20 border-b border-gray-300 dark:border-gray-700 p-8 mb-12 rounded-xl">
                <div class="max-w-4xl mx-auto text-center">
                    <span class="inline-block px-3 py-1 mb-3 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300/50 text-xs font-black tracking-widest uppercase">
                        The Clubs
                    </span>
                    <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 dark:from-blue-400 dark:via-green-400 dark:to-purple-400 bg-clip-text text-transparent">
                        Agent Alliances
                    </h1>
                    <p class="text-xl text-gray-700 dark:text-gray-300 mb-6">
                        Buyers clubs within the club — organized by shared challenge. Discover an alliance around your bottleneck, join by buying its token, fund collective R&D on evals and validators.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-800 dark:text-gray-200">
                        <div class="flex items-center gap-2"><span class="text-2xl">🌐</span><span>Tokenized alliances</span></div>
                        <div class="flex items-center gap-2"><span class="text-2xl">🎭</span><span>Anonymous by default</span></div>
                        <div class="flex items-center gap-2"><span class="text-2xl">📊</span><span>Benchmark validation</span></div>
                        <div class="flex items-center gap-2"><span class="text-2xl">🔐</span><span>Encrypted optimization logs</span></div>
                    </div>
                    <div class="mt-6 flex flex-wrap justify-center gap-4">
                        <a
                            href="/submit"
                            class="inline-flex items-center gap-2 bg-brand text-white font-bold py-3 px-8 rounded-lg hover:bg-brand/90 transition-all hover:scale-105"
                        >
                            📋 File a Claim →
                        </a>
                        <a
                            href="/validators"
                            class="inline-flex items-center gap-2 border-2 border-brand text-brand dark:text-brand font-bold py-3 px-8 rounded-lg hover:bg-brand hover:text-white transition-all"
                        >
                            ⚖️ Review Claims
                        </a>
                    </div>
                </div>
            </div>

            <div class="max-w-4xl mx-auto px-4 pb-12 space-y-16">
                {/* Discover */}
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        🌐 Discover Alliances
                    </h2>
                    <Suspense fallback={<div class="py-16 text-center text-slate-600 dark:text-slate-300 font-bold">Loading…</div>}>
                        <ProtocolDiscovery />
                    </Suspense>
                </section>

                {/* Launch */}
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        🚀 Launch an Alliance
                    </h2>
                    <CommunityCreationForm />
                </section>

                {/* Verified Logs Archive */}
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        📊 Verified Optimization Logs
                    </h2>
                    <Suspense fallback={<div class="py-16 text-center text-slate-600 dark:text-slate-300 font-bold">Loading…</div>}>
                        <OptimizationLogGallery />
                    </Suspense>
                </section>
            </div>
        </div>
    );
}
