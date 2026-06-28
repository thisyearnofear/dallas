import { lazy, Suspense } from "preact/compat";

const EncryptedOptimizationLogForm: any = lazy(() =>
    import("../components/EncryptedOptimizationLogForm").then((m) => ({
        default: m.EncryptedOptimizationLogForm,
    })),
);

export default function Submit() {
    return (
        <div class="min-h-screen">
            {/* Hero */}
            <div class="bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-300 dark:border-gray-700 p-8 mb-12 rounded-xl">
                <div class="max-w-3xl mx-auto text-center">
                    <div class="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-bold px-4 py-1.5 rounded-full mb-4">
                        🔐 Zero-Knowledge · IP Protected · 0.10 USDC fee
                    </div>
                    <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                        Submit Optimization Log
                    </h1>
                    <p class="text-xl text-gray-700 dark:text-gray-300 mb-6">
                        Prove your agent improved without exposing prompts, weights, or customer data.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                        <div class="flex items-center gap-2"><span>🛡️</span><span>Wallet-encrypted</span></div>
                        <div class="flex items-center gap-2"><span>🧮</span><span>ZK-SNARK validated</span></div>
                        <div class="flex items-center gap-2"><span>⚡</span><span>Light Protocol compressed</span></div>
                        <div class="flex items-center gap-2"><span>👥</span><span>Committee-reviewed</span></div>
                    </div>
                </div>
            </div>

            <div class="max-w-3xl mx-auto px-4 pb-12">
                <Suspense fallback={<div class="py-16 text-center text-slate-600 dark:text-slate-300 font-bold">Loading form…</div>}>
                    <EncryptedOptimizationLogForm />
                </Suspense>

                <div class="mt-8 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                    <strong class="text-slate-800 dark:text-slate-200">After submitting:</strong> your log enters the review queue. Validators with sufficient clearance will verify the ZK proof and confirm the performance delta — without ever seeing your proprietary data.{" "}
                    <a href="/validators" class="text-brand hover:underline font-semibold">Become a reviewer →</a>
                </div>
            </div>
        </div>
    );
}
