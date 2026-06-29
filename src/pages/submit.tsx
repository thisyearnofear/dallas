import { lazy, Suspense } from "preact/compat";
import { useState, useEffect } from "preact/hooks";
import { StellarVerifyPanel } from "../components/StellarVerifyPanel";
import { readProofFromUrl, type ProofRecord } from "../services/proofHistory";

const EncryptedOptimizationLogForm: any = lazy(() =>
    import("../components/EncryptedOptimizationLogForm").then((m) => ({
        default: m.EncryptedOptimizationLogForm,
    })),
);

export default function Submit() {
    const [proofData, setProofData] = useState<Partial<ProofRecord> | null>(null);

    useEffect(() => {
        setProofData(readProofFromUrl());
    }, []);

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

            <div class="max-w-3xl mx-auto px-4 pb-12">
                {/* Proof verified banner */}
                {proofData && proofData.txHash && (
                    <div class="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-700">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-black flex-shrink-0">✓</span>
                            <div class="flex-grow">
                                <div class="font-black text-green-700 dark:text-green-300">Proof verified on Soroban</div>
                                <div class="text-xs text-green-600 dark:text-green-400">
                                    {proofData.metric && <span class="capitalize">{proofData.metric}</span>}
                                    {proofData.passed !== undefined && proofData.passed ? " · passed" : " · failed"}
                                    {proofData.threshold !== undefined && ` · ${proofData.threshold}% threshold`}
                                    {proofData.allianceId && ` · ${proofData.allianceId}`}
                                </div>
                            </div>
                            <a
                                href={`https://stellar.expert/explorer/testnet/tx/${proofData.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                class="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex-shrink-0"
                            >
                                tx ↗
                            </a>
                        </div>
                        <div class="text-[10px] font-mono text-slate-500 dark:text-slate-400 break-all">
                            {proofData.txHash}
                        </div>
                        <div class="text-xs text-slate-600 dark:text-slate-400 mt-2">
                            Complete the form below to submit your full encrypted optimization log.
                            The metrics are pre-filled from your proof.
                        </div>
                    </div>
                )}

                {/* Live ZK verify -- shown only when no proof is pre-filled */}
                {!proofData && (
                    <>
                        <div class="mb-3 flex items-center gap-2">
                            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Run the ZK proof now</h2>
                            <span class="text-[10px] font-black bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">LIVE</span>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            The same proof loop your submission triggers -- run it standalone to see the Stellar
                            attestation land on-chain.
                        </p>
                        <div class="mb-10">
                            <StellarVerifyPanel />
                        </div>
                    </>
                )}

                {/* Full submission form */}
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    {proofData ? "Complete your submission" : "Full encrypted submission"}
                </h2>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    {proofData
                        ? "Encrypt your log, compress with Light Protocol, and submit across Solana + Stellar."
                        : "Encrypt your log, compress with Light Protocol, and submit across Solana (coordination) + Stellar (ZK attestation)."}
                </p>
                <Suspense fallback={<div class="py-16 text-center text-slate-600 dark:text-slate-300 font-bold">Loading form...</div>}>
                    <EncryptedOptimizationLogForm proofData={proofData} />
                </Suspense>

                <div class="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                    <strong class="text-purple-800 dark:text-purple-200">After submitting:</strong> your log is
                    encrypted on Solana and a Noir <code class="font-mono">benchmark_delta</code> proof is verified
                    in the Soroban attestation contract.{" "}
                    <a href="/validators" class="text-brand hover:underline font-semibold">Become a reviewer →</a>
                </div>
            </div>
        </div>
    );
}
