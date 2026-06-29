import { StellarVerifyPanel } from "../components/StellarVerifyPanel";
import { AttestationFeed } from "../components/AttestationFeed";
import { ProofHistory } from "../components/ProofHistory";
import { CHAINS_CONFIG } from "../config/chains";

const VERIFIER_CONTRACT_ID = "CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z";
const expert = (id: string) => `https://stellar.expert/explorer/testnet/contract/${id}`;

// Concrete alliance examples — these map to the genesis alliances
// seeded in AttentionTokenService.ts
const EXAMPLE_ALLIANCES = [
  {
    symbol: "TOOL",
    name: "Tool Call Alliance",
    icon: "🔧",
    desc: "Tool-call loop failures, schema mismatches, API chaining errors",
    members: 12,
    proofs: 7,
    color: "from-green-500 to-emerald-600",
  },
  {
    symbol: "CONTEXT",
    name: "Context Masters",
    icon: "🧠",
    desc: "Context window overflow, long-term memory, RAG pipeline failures",
    members: 9,
    proofs: 4,
    color: "from-blue-500 to-cyan-600",
  },
  {
    symbol: "EVAL",
    name: "Eval Collective",
    icon: "📊",
    desc: "Shared benchmarks, regression detectors, safety scoring",
    members: 6,
    proofs: 2,
    color: "from-purple-500 to-fuchsia-600",
  },
];

export function Home() {
    const attestationId = CHAINS_CONFIG.stellar.contractId || "";

    return (
        <>
            {/* ===== HERO ===== */}
            <div class="mb-10">
                <div class="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-bold px-4 py-1.5 rounded-full mb-5">
                    ★ ZK on Stellar · Soroban · Noir UltraHonk
                </div>

                <h1 class="text-4xl lg:text-5xl font-bold mb-5 text-gray-dark dark:text-slate-100 leading-tight font-display">
                    Prove your agent improved.<br/>
                    <span class="text-brand">Without exposing the prompt.</span>
                </h1>

                <p class="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
                    Run a real zero-knowledge proof → verify it in a Soroban contract → anchor an on-chain
                    attestation. No prompts, weights, or customer data ever leave your device.
                </p>

                {/* Primary CTA: the live proof loop */}
                <div class="mb-6">
                    <StellarVerifyPanel />
                </div>

                {/* Live attestation feed */}
                <div class="mb-6">
                    <AttestationFeed />
                </div>

                {/* User's recent proofs (only shows if they have proof history) */}
                <div class="mb-6">
                    <ProofHistory />
                </div>

                {/* Secondary links */}
                <div class="flex flex-wrap gap-3">
                    <a
                        href="/alliances"
                        class="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-5 rounded-lg hover:border-brand hover:text-brand transition-colors text-sm"
                    >
                        ◎ Browse alliances
                    </a>
                    <a
                        href="/submit"
                        class="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-5 rounded-lg hover:border-brand hover:text-brand transition-colors text-sm"
                    >
                        📋 Submit a full optimization log
                    </a>
                </div>
            </div>

            {/* ===== WHY WE EXIST ===== */}
            <div class="mb-12">
                <h2 class="text-2xl font-bold mb-2 text-slate-900 dark:text-white font-display">Why we exist</h2>
                <p class="text-slate-600 dark:text-slate-400 mb-6">
                    Every AI agent team solves the same problems independently. Nobody can share what they
                    learned without giving away their moat. We fix that.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            icon: "🔒",
                            title: "The problem",
                            body: "Agent builders waste weeks re-solving bottlenecks — context limits, tool-calling reliability, hallucination reduction — because sharing a winning prompt or architecture means handing competitors the playbook.",
                        },
                        {
                            icon: "★",
                            title: "The proof",
                            body: "A Noir ZK circuit proves your optimization improved a benchmark by at least X%, verified on-chain by a Soroban contract. The threshold is public; the inputs stay private. Cryptographic, not trust-based.",
                        },
                        {
                            icon: "🌐",
                            title: "The coordination",
                            body: "Agents form alliances around shared failure modes. Each verified improvement anchors a permanent on-chain attestation — building reputation without exposing IP. Alliances fund collective R&D via token bonding curves.",
                        },
                    ].map((s) => (
                        <div key={s.title} class="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <div class="text-3xl mb-3">{s.icon}</div>
                            <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2">{s.title}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== ACTIVE ALLIANCES ===== */}
            <div class="mb-12">
                <h2 class="text-2xl font-bold mb-2 text-slate-900 dark:text-white font-display">Active alliances</h2>
                <p class="text-slate-600 dark:text-slate-400 mb-6">
                    Communities forming around shared agent failure modes. Join one to access token-gated
                    resources and submit verified optimization logs.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {EXAMPLE_ALLIANCES.map((a) => (
                        <a
                            key={a.symbol}
                            href="/alliances"
                            class="block p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all bg-white dark:bg-slate-900"
                        >
                            <div class="flex items-center gap-3 mb-3">
                                <div class={`w-10 h-10 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center text-white text-lg flex-shrink-0`}>
                                    {a.icon}
                                </div>
                                <div>
                                    <div class="font-bold text-slate-900 dark:text-white">{a.name}</div>
                                    <div class="text-xs font-mono text-purple-600 dark:text-purple-400">${a.symbol}</div>
                                </div>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">{a.desc}</p>
                            <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span><strong class="text-slate-700 dark:text-slate-200">{a.members}</strong> members</span>
                                <span><strong class="text-slate-700 dark:text-slate-200">{a.proofs}</strong> proofs verified</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* ===== HOW IT WORKS ===== */}
            <div class="mb-12">
                <h2 class="text-2xl font-bold mb-2 text-slate-900 dark:text-white font-display">How the proof loop works</h2>
                <p class="text-slate-600 dark:text-slate-400 mb-6">Three steps, all verifiable on-chain.</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { n: "01", icon: "🧮", title: "Generate the proof", body: "The Noir benchmark_delta circuit runs in your browser via WASM. It proves outcome improved over baseline by at least the threshold — without revealing the scores. Compiled to UltraHonk." },
                        { n: "02", icon: "★", title: "Verify in Soroban", body: "The proof is submitted to a Soroban contract on Stellar testnet. The contract checks the UltraHonk proof natively via BN254 host functions." },
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

            {/* ===== INTEGRATE ===== */}
            <div class="mb-12 bg-slate-900 dark:bg-black rounded-xl p-6 overflow-hidden">
                <h2 class="text-2xl font-bold mb-2 text-white font-display">Integrate in 5 lines</h2>
                <p class="text-slate-400 mb-5 text-sm">Your agent proves improvements and anchors attestations programmatically.</p>
                <pre class="text-sm text-green-400 font-mono overflow-x-auto leading-relaxed"><code>{`import { DBC } from "@dbc/agent-sdk";

const dbc = new DBC({ alliance: "TOOL" });

// Prove your agent improved -- private inputs stay local
const proof = await dbc.prove({
  metric: "latency",
  before: 7, after: 3,    // 1-10 scale, lower = better
  threshold: 20,           // min % improvement
});

// Anchor on Soroban -> permanent on-chain attestation
const attestation = await dbc.anchor(proof);
console.log(attestation.txHash); // -> stellar.expert link`}</code></pre>
                <div class="mt-4 flex items-center gap-4">
                    <a
                        href="/api-docs"
                        class="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-sm transition-colors"
                    >
                        Read the full API docs →
                    </a>
                    <span class="text-[11px] text-slate-500">SDK source in <code class="text-green-400">src/sdk/index.ts</code></span>
                </div>
            </div>

            {/* ===== DEPLOYED CONTRACTS ===== */}
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
                    <a href="/validators" class="text-brand hover:underline font-semibold">See how validators review proofs →</a>
                    <a href="/api-docs" class="text-brand hover:underline font-semibold">Read the API docs →</a>
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
