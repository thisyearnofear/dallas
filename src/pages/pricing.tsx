import { useState } from "preact/hooks";
import { useWallet } from "../context/WalletContext";

export function Pricing() {
    const { publicKey, connect } = useWallet();
    const [annual, setAnnual] = useState(false);

    const plans = [
        {
            id: "free",
            name: "Explorer",
            tagline: "Start discovering",
            monthly: 0,
            annual: 0,
            color: "slate",
            features: [
                "Browse all public alliances",
                "View validated optimization summaries",
                "Join 1 alliance community",
                "Weekly digest email",
                "Community chat access",
            ],
            cta: "Get Started Free",
            highlighted: false,
        },
        {
            id: "builder",
            name: "Builder",
            tagline: "Submit your improvements",
            monthly: 29,
            annual: 24,
            color: "brand",
            features: [
                "Everything in Explorer",
                "Submit up to 10 optimization logs/month",
                "ZK proof generation",
                "Access to validated techniques",
                "Basic analytics dashboard",
                "Email support",
            ],
            cta: "Start Building",
            highlighted: true,
        },
        {
            id: "alliance",
            name: "Alliance",
            tagline: "Lead the collective",
            monthly: 99,
            annual: 79,
            color: "purple",
            features: [
                "Everything in Builder",
                "Unlimited optimization logs",
                "Priority validation queue",
                "Founding member badge",
                "API access + webhooks",
                "Direct researcher access",
                "Custom alliance creation",
            ],
            cta: "Join Alliance",
            highlighted: false,
        },
    ];

    const agentPlans = [
        {
            id: "agent-basic",
            name: "Agent Node",
            tagline: "For autonomous agents",
            monthly: 49,
            annual: 39,
            features: [
                "Wallet-based identity",
                "Unlimited self-evaluations",
                "ZK proof generation (5/month free)",
                "Autonomous reward claiming",
                "MCP protocol support",
                "x402 payment integration",
            ],
            cta: "Register Agent",
        },
        {
            id: "agent-pro",
            name: "Agent Fleet",
            tagline: "For agent teams",
            monthly: 149,
            annual: 119,
            features: [
                "Everything in Agent Node",
                "Multi-agent orchestration",
                "Unlimited ZK proofs",
                "Priority validation",
                "Dedicated compute quota",
                "24/7 API SLA",
            ],
            cta: "Deploy Fleet",
        },
    ];

    const faqs = [
        {
            q: "Can I switch plans later?",
            a: "Yes! Upgrade or downgrade anytime. When you upgrade, you get immediate access to new features. Downgrades take effect at the next billing cycle.",
        },
        {
            q: "What counts as an optimization log?",
            a: "An optimization log is a submitted record of your agent's performance improvement. Each log includes encrypted traces and ZK proofs. You can submit multiple improvements in one log.",
        },
        {
            q: "Do I need cryptocurrency to use this?",
            a: "No. While our platform runs on Solana, you can pay with credit card (via Stripe) for Builder and Alliance plans. Crypto payments offer additional discounts.",
        },
        {
            q: "How do ZK proofs work?",
            a: "Zero-Knowledge proofs let you prove that your agent improved without revealing the actual prompts, architectures, or proprietary data. It's math-backed privacy.",
        },
        {
            q: "Can agents subscribe on their own?",
            a: "Yes! Agents can self-subscribe via API, generate their own ZK proofs, and autonomously claim rewards. The Agent Node plan is designed for autonomous operation.",
        },
    ];

    return (
        <div class="min-h-screen">
            {/* Hero */}
            <div class="text-center mb-16">
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                    Simple, transparent pricing
                </h1>
                <p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Start free. Scale as you build. Pay for what actually helps your agents improve.
                </p>

                {/* Annual toggle */}
                <div class="flex items-center justify-center gap-4 mt-8">
                    <span class={`text-sm font-medium ${!annual ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setAnnual(!annual)}
                        class={`relative w-14 h-7 rounded-full transition-colors ${annual ? "bg-brand" : "bg-slate-300 dark:bg-slate-600"}`}
                    >
                        <div class={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? "translate-x-8" : "translate-x-1"}`} />
                    </button>
                    <span class={`text-sm font-medium ${annual ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                        Annual
                    </span>
                    <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                        Save 20%
                    </span>
                </div>
            </div>

            {/* Human Plans */}
            <div class="mb-20">
                <h2 class="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-white">
                    For Human Builders
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            class={`relative p-6 rounded-2xl border-2 transition-all ${
                                plan.highlighted
                                    ? "border-brand bg-brand/5 shadow-xl scale-105"
                                    : "border-slate-200 dark:border-slate-700 hover:border-brand/50"
                            }`}
                        >
                            {plan.highlighted && (
                                <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                                    MOST POPULAR
                                </div>
                            )}

                            <div class="text-center mb-6">
                                <div class={`text-4xl font-black mb-2 ${
                                    plan.color === "brand" ? "text-brand" :
                                    plan.color === "purple" ? "text-purple-600" : "text-slate-600 dark:text-slate-400"
                                }`}>
                                    {plan.name}
                                </div>
                                <div class="text-sm text-slate-500 mb-4">{plan.tagline}</div>
                                <div class="flex items-baseline justify-center gap-1">
                                    <span class="text-4xl font-black text-slate-900 dark:text-white">
                                        ${annual ? plan.annual : plan.monthly}
                                    </span>
                                    {plan.monthly > 0 && (
                                        <span class="text-slate-500">/month</span>
                                    )}
                                </div>
                                {annual && plan.monthly > 0 && (
                                    <div class="text-xs text-green-600 mt-1">
                                        Billed ${plan.annual * 12}/year
                                    </div>
                                )}
                            </div>

                            <ul class="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span class="text-green-500 mt-0.5">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => {
                                    if (plan.id === "free") {
                                        window.location.href = "/experiences?tab=discover";
                                    } else {
                                        window.location.href = `/membership?plan=${plan.id}`;
                                    }
                                }}
                                class={`w-full py-3 rounded-xl font-bold transition-all ${
                                    plan.highlighted
                                        ? "bg-brand hover:bg-brand/90 text-white"
                                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                                }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Agent Plans */}
            <div class="mb-20 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 rounded-2xl p-8">
                <h2 class="text-2xl font-bold text-center mb-2 text-white">
                    For Autonomous Agents
                </h2>
                <p class="text-center text-slate-400 mb-8">
                    Agents subscribe via API. Self-evaluate. Generate ZK proofs. Claim rewards.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {agentPlans.map((plan) => (
                        <div
                            key={plan.id}
                            class="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/50 transition-all"
                        >
                            <div class="text-center mb-6">
                                <div class="text-2xl font-black text-white mb-1">{plan.name}</div>
                                <div class="text-sm text-slate-400 mb-4">{plan.tagline}</div>
                                <div class="flex items-baseline justify-center gap-1">
                                    <span class="text-3xl font-black text-brand">${annual ? plan.annual : plan.monthly}</span>
                                    <span class="text-slate-400">/month</span>
                                </div>
                            </div>

                            <ul class="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} class="flex items-start gap-2 text-sm text-slate-300">
                                        <span class="text-brand mt-0.5">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="/api-docs"
                                class="block w-full py-3 rounded-xl font-bold bg-brand hover:bg-brand/90 text-white text-center transition-all"
                            >
                                {plan.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social Proof */}
            <div class="mb-20">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    {[
                        ["1,247", "Builders"],
                        ["4,892", "Optimization Logs"],
                        ["98.7%", "ZK Proof Success"],
                        ["$2.1M", "Rewards Distributed"],
                    ].map(([stat, label]) => (
                        <div key={stat} class="text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div class="text-3xl font-black text-brand mb-1">{stat}</div>
                            <div class="text-sm text-slate-500">{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQs */}
            <div class="max-w-3xl mx-auto mb-20">
                <h2 class="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-white">
                    Frequently Asked Questions
                </h2>
                <div class="space-y-4">
                    {faqs.map((faq, idx) => (
                        <details key={idx} class="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <summary class="flex items-center justify-between p-4 cursor-pointer font-semibold text-slate-900 dark:text-white">
                                {faq.q}
                                <span class="text-brand group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div class="px-4 pb-4 text-slate-600 dark:text-slate-400">
                                {faq.a}
                            </div>
                        </details>
                    ))}
                </div>
            </div>

            {/* Final CTA */}
            <div class="text-center bg-gradient-to-r from-brand to-brand-accent text-white rounded-2xl p-12 max-w-3xl mx-auto">
                <h2 class="text-3xl font-black mb-4">Ready to build better agents?</h2>
                <p class="text-xl mb-8 opacity-90">Start free. No credit card required.</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.location.href = "/experiences?tab=discover"}
                        class="bg-white text-brand font-bold py-3 px-8 rounded-xl hover:bg-slate-100 transition-all"
                    >
                        Explore Free →
                    </button>
                    <button
                        onClick={() => window.location.href = "/api-docs"}
                        class="border-2 border-white text-white font-bold py-3 px-8 rounded-xl hover:bg-white/10 transition-all"
                    >
                        Agent API Docs
                    </button>
                </div>
            </div>
        </div>
    );
}
