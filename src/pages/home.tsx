import { useState } from "preact/hooks";
import { StellarVerifyPanel } from "../components/StellarVerifyPanel";
import { ServiceReadinessPanel } from "../components/ServiceReadinessPanel";
import { CHAINS_CONFIG } from "../config/chains";

const VERIFIER_CONTRACT_ID = "CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z";

const expert = (id: string) => `https://stellar.expert/explorer/testnet/contract/${id}`;

export function Home() {
    const [secretClicks, setSecretClicks] = useState(0);
    const [showUndergroundAccess, setShowUndergroundAccess] = useState(false);

    const handleSecretClick = () => {
        const next = secretClicks + 1;
        setSecretClicks(next);
        if (next >= 5) setShowUndergroundAccess(true);
    };

    const attestationId = CHAINS_CONFIG.stellar.contractId || "";

    return (
        <>
            {/* ===== HERO: Prove it on Stellar ===== */}
            <div class="mb-10">
                <div class="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-bold px-4 py-1.5 rounded-full mb-5">
                    ★ ZK on Stellar · Soroban · Noir UltraHonk
                </div>

                <h1 class="text-4xl lg:text-5xl font-bold mb-5 text-gray-dark dark:text-slate-100 leading-tight font-display">
                    Prove your agent improved.<br/>
                    <span class="text-brand">On Stellar. Without exposing the prompt.</span>
                </h1>

                <p class="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
                    Run a real zero-knowledge proof → verify it in a Soroban contract → anchor an on-chain
                    attestation. No prompts, weights, or customer data ever leave your device.
                </p>

                {/* Primary CTA: the live proof loop */}
                <div class="mb-6">
                    <StellarVerifyPanel />
                </div>

                {/* Secondary, clearly-labeled coordination links */}
                <div class="flex flex-wrap gap-3">
                    <a
                        href="/alliances"
                        class="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-5 rounded-lg hover:border-brand hover:text-brand transition-colors text-sm"
                    >
                        ◎ Browse alliances (Solana)
                    </a>
                    <a
                        href="/submit"
                        class="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-5 rounded-lg hover:border-brand hover:text-brand transition-colors text-sm"
                    >
                        📋 Submit a full optimization log
                    </a>
                </div>
            </div>

            {/* ===== 3-STEP: how the ZK works ===== */}
            <div class="mb-12">
                <h2 class="text-2xl font-bold mb-2 text-slate-900 dark:text-white font-display">How the proof loop works</h2>
                <p class="text-slate-600 dark:text-slate-400 mb-6">Three steps, all verifiable on-chain.</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { n: "01", icon: "🧮", title: "Generate the proof", body: "The Noir benchmark_delta circuit proves outcome_metric improved over baseline_metric by at least min_improvement_percent — without revealing the prompt or weights. Compiled to UltraHonk." },
                        { n: "02", icon: "★", title: "Verify in Soroban", body: "The proof bytes + public inputs are submitted to a deployed rs_soroban_ultrahonk verifier on Stellar testnet. The contract checks the UltraHonk proof natively." },
                        { n: "03", icon: "✓", title: "Anchor the attestation", body: "verify_and_attest stores a permanent attestation (alliance, submission, passed, threshold) on-chain. Anyone can audit it on stellar.expert." },
                    ].map((s) => (
                        <div key={s.n} class="relative p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900">
                            <div class="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.25em] mb-3">{s.n}</div>
                            <div class="text-3xl mb-3">{s.icon}</div>
                            <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2">{s.title}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== DEPLOYED-CONTRACTS PROOF ===== */}
            <div class="mb-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div class="flex items-center gap-2 mb-1">
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white font-display">Deployed on Stellar testnet</h2>
                    <span class="text-[10px] font-black bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <p class="text-slate-600 dark:text-slate-400 mb-5 text-sm">
                    Real Soroban contracts you can inspect right now on stellar.expert.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ContractCard
                        name="Stateful attestation contract"
                        purpose="verify_and_attest · stores permanent attestations"
                        contractId={attestationId}
                    />
                    <ContractCard
                        name="rs_soroban_ultrahonk verifier"
                        purpose="verify_proof · native UltraHonk check"
                        contractId={VERIFIER_CONTRACT_ID}
                    />
                </div>
                <div class="mt-5 flex flex-wrap gap-3 text-sm">
                    <a href="/underground" class="text-brand hover:underline font-semibold">Explore the full ZK/MPC stack →</a>
                    <a href="/validators" class="text-brand hover:underline font-semibold">See how validators review proofs →</a>
                </div>
            </div>

            {/* Secret Underground Access (demoted easter egg) */}
            {showUndergroundAccess && (
                <div class="mb-12 bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 dark:from-black dark:via-red-950 dark:to-black text-white p-6 rounded-lg border-2 border-red-500 shadow-2xl animate-fadeIn">
                    <div class="text-center">
                        <div class="text-5xl mb-3 animate-pulse">🕋</div>
                        <h2 class="text-2xl font-bold mb-3 text-red-400 font-display">ACCESS GRANTED</h2>
                        <p class="text-sm mb-4 text-red-200">You found the underground operations entrance.</p>
                        <a
                            href="/underground"
                            class="inline-block bg-gradient-to-r from-red-600 to-black text-white font-bold py-3 px-6 rounded-lg hover:from-red-500 hover:to-red-900 transition-all"
                        >
                            🔓 ENTER UNDERGROUND NETWORK
                        </a>
                    </div>
                </div>
            )}

            <details class="mb-8">
                <summary class="text-xs text-slate-400 dark:text-slate-600 cursor-pointer hover:text-brand transition-colors font-medium">
                    ⚙️ Infrastructure status (ops only)
                </summary>
                <ServiceReadinessPanel />
            </details>

            {/* Secret click area (kept, demoted) */}
            <div class="text-center mt-12">
                <div class="flex justify-center items-center space-x-6 opacity-50 text-slate-700 dark:text-slate-400">
                    <span class="text-sm">Open source</span>
                    <span class="text-sm">Stellar testnet live</span>
                    <span
                        class="text-sm cursor-pointer hover:text-brand transition-colors"
                        onClick={handleSecretClick}
                        title={secretClicks > 0 ? `${5 - secretClicks} more clicks to access underground` : "Since 1985"}
                    >
                        Since 1985
                        {secretClicks > 0 && (
                            <span class="ml-1 text-red-500 animate-pulse">{"•".repeat(secretClicks)}</span>
                        )}
                    </span>
                </div>
            </div>
        </>
    );
}

function ContractCard({ name, purpose, contractId }: { name: string; purpose: string; contractId: string }) {
    return (
        <a
            href={expert(contractId)}
            target="_blank"
            rel="noreferrer"
            class="block p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30"
        >
            <div class="flex items-center justify-between mb-1">
                <div class="font-bold text-slate-900 dark:text-white text-sm">{name}</div>
                <span class="text-purple-600 dark:text-purple-400 text-xs font-bold">↗</span>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mb-2">{purpose}</div>
            <div class="text-[10px] font-mono text-slate-400 dark:text-slate-500 break-all">{contractId}</div>
        </a>
    );
}
