import { lazy, Suspense } from "preact/compat";
import { StellarVerifyPanel } from "../components/StellarVerifyPanel";

const EncryptedOptimizationLogForm: any = lazy(() =>
    import("../components/EncryptedOptimizationLogForm").then((m) => ({
        default: m.EncryptedOptimizationLogForm,
    })),
);

export default function Submit() {
    return (
        <div class="min-h-screen">
            {/* Hero */}
            <div class="bg-gradient-to-r from-purple-100/50 to-indigo-100/50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b border-purple-300 dark:border-purple-700 p-8 mb-10 rounded-xl">
                <div class="max-w-3xl mx-auto text-center">
                    <div class="inline-block bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm font-bold px-4 py-1.5 rounded-full mb-4">
                        ★ ZK on Stellar · IP Protected · 0.10 USDC fee
                    </div>
                    <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                        Submit Optimization Log
                    </h1>
                    <p class="text-xl text-gray-700 dark:text-gray-300 mb-6">
                        Prove your agent improved without exposing prompts, weights, or customer data.
                        Each submission anchors a ZK attestation on Stellar.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                        <div class="flex items-center gap-2"><span>★</span><span>Soroban attestation</span></div>
                        <div class="flex items-center gap-2"><span>🧮</span><span>Noir UltraHonk proof</span></div>
                        <div class="flex items-center gap-2"><span>🛡️</span><span>Wallet-encrypted</span></div>
                        <div class="flex items-center gap-2"><span>◎</span><span>Solana coordination</span></div>
                    </div>
                </div>
            </div>

            {/* Live ZK verify — the load-bearing proof loop, front and center */}
            <div class="max-w-3xl mx-auto px-4 mb-10">
                <div class="mb-3 flex items-center gap-2">
                    <h2 class="text-lg font-bold text-slate-900 dark:text-white">Run the ZK proof now</h2>
                    <span class="text-[10px] font-black bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    The same proof loop your submission triggers — run it standalone to see the Stellar
                    attestation land on-chain.
                </p>
                <StellarVerifyPanel />
            </div>

            {/* Full submission form */}
            <div class="max-w-3xl mx-auto px-4 pb-12">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-3">Full encrypted submission</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Encrypt your log, compress with Light Protocol, and submit across Solana (coordination)
                    + Stellar (ZK attestation).
                </p>
                <Suspense fallback={<div class="py-16 text-center text-slate-600 dark:text-slate-300 font-bold">Loading form…</div>}>
                    <EncryptedOptimizationLogForm />
                </Suspense>

                <div class="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                    <strong class="text-purple-800 dark:text-purple-200">After submitting:</strong> your log is
                    encrypted on Solana and a Noir <code class="font-mono">benchmark_delta</code> proof is verified
                    in the Soroban attestation contract. The result (passed / threshold / tx) appears inline above
                    with a <strong>stellar.expert</strong> link — that on-chain attestation is the moment ZK does its work.{" "}
                    <a href="/validators" class="text-brand hover:underline font-semibold">Become a reviewer →</a>
                </div>
            </div>
        </div>
    );
}
