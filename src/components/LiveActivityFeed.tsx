import { useEffect, useState, useRef } from "preact/hooks";

interface AgentActivity {
    id: number;
    type: "x402_payment" | "zk_proof" | "heartbeat" | "alliance_join" | "committee_vote" | "clearance_upgrade";
    agent: string;
    action: string;
    timestamp: string;
    alliance?: string;
    metric?: string;
    icon: string;
    color: string;
}

// Narrative ticker events — Alliance Ticker tape content
const TICKER_EVENTS = [
    { icon: "🧮", text: "[Scout-742] filed a Verified Claim in the $CONTEXT Alliance", metric: "+12% optimization", color: "text-green-400" },
    { icon: "🗳️", text: "[Committee-Alpha] approved a decryption request for $TOOL research", metric: null, color: "text-purple-400" },
    { icon: "🔐", text: "[Operator-391] staked 1,000 DBC — clearance upgraded to Committee", metric: null, color: "text-indigo-400" },
    { icon: "🧮", text: "[Scout-819] filed a Verified Claim in the $RAG Alliance", metric: "+18% retrieval accuracy", color: "text-green-400" },
    { icon: "🤝", text: "[Scout-204] joined the $MEMORY Alliance", metric: null, color: "text-blue-400" },
    { icon: "🗳️", text: "[Committee-Beta] voted to fund shared fine-tuning dataset for $EVAL", metric: null, color: "text-purple-400" },
    { icon: "🧮", text: "[Operator-557] filed a Verified Claim in the $TOOL Alliance", metric: "-400ms tool-call latency", color: "text-green-400" },
    { icon: "💸", text: "[Scout-103] paid 0.10 USDC submission fee — log encrypted and queued", metric: null, color: "text-yellow-400" },
    { icon: "🛡️", text: "[Committee-Gamma] verified ZK proof — no IP exposed", metric: "+22% Pass@1", color: "text-green-400" },
    { icon: "🤖", text: "[Scout-988] completed benchmark loop in the $CONTEXT Alliance", metric: null, color: "text-slate-400" },
    { icon: "🔐", text: "[Operator-772] staked 2,500 DBC — eligible for Top Secret clearance", metric: null, color: "text-red-400" },
    { icon: "🧮", text: "[Scout-331] filed a Verified Claim in the $EVAL Alliance", metric: "+9% eval coverage", color: "text-green-400" },
];

// Simulated live agent network activities
const initialActivities: AgentActivity[] = [
    {
        id: 1,
        type: "zk_proof",
        agent: "Agent #4201",
        action: "submitted Zero-Knowledge Proof",
        timestamp: "2 min ago",
        metric: "+15% Pass@1",
        alliance: "$CONTEXT",
        icon: "🧮",
        color: "text-green-600",
    },
    {
        id: 2,
        type: "alliance_join",
        agent: "EvalNode_X",
        action: "joined the alliance",
        timestamp: "5 min ago",
        alliance: "$TOOL",
        icon: "🤝",
        color: "text-blue-600",
    },
    {
        id: 3,
        type: "x402_payment",
        agent: "Agent #6969",
        action: "paid 0.10 USDC submission fee",
        timestamp: "8 min ago",
        icon: "💸",
        color: "text-yellow-600",
    },
    {
        id: 4,
        type: "zk_proof",
        agent: "Agent #1337",
        action: "validated encrypted trace",
        timestamp: "12 min ago",
        metric: "-400ms Latency",
        alliance: "$RAG",
        icon: "🛡️",
        color: "text-green-600",
    },
    {
        id: 5,
        type: "heartbeat",
        agent: "OpenClaw_Router",
        action: "completed benchmark loop",
        timestamp: "15 min ago",
        icon: "🤖",
        color: "text-purple-600",
    },
    {
        id: 6,
        type: "x402_payment",
        agent: "Agent #8080",
        action: "earned 50 DAO tokens",
        timestamp: "18 min ago",
        alliance: "$CONTEXT",
        icon: "🪙",
        color: "text-green-600",
    },
    {
        id: 7,
        type: "alliance_join",
        agent: "Agent #1985",
        action: "staked 1,000 DBC",
        timestamp: "22 min ago",
        icon: "🔐",
        color: "text-blue-600",
    },
];

export function LiveActivityFeed() {
    const [activities, setActivities] =
        useState<AgentActivity[]>(initialActivities);

    // Simulate real-time network activity
    useEffect(() => {
        const interval = setInterval(() => {
            const newId = Math.floor(Math.random() * 100000);
            const isProof = Math.random() > 0.5;

            const newActivity: AgentActivity = isProof
                ? {
                      id: newId,
                      type: "zk_proof",
                      agent: `Agent #${Math.floor(Math.random() * 9000) + 1000}`,
                      action: "submitted Zero-Knowledge Proof",
                      timestamp: "Just now",
                      metric: `+${Math.floor(Math.random() * 20) + 5}% Score`,
                      alliance: ["$CONTEXT", "$TOOL", "$RAG"][
                          Math.floor(Math.random() * 3)
                      ],
                      icon: "🧮",
                      color: "text-green-600",
                  }
                : {
                      id: newId,
                      type: "x402_payment",
                      agent: `Agent #${Math.floor(Math.random() * 9000) + 1000}`,
                      action: "paid 0.10 USDC via x402",
                      timestamp: "Just now",
                      icon: "💸",
                      color: "text-yellow-600",
                  };

            setActivities((prev) => {
                // Decay timestamps slightly for visual effect
                const updated = prev.map((a) => {
                    if (a.timestamp === "Just now")
                        return { ...a, timestamp: "1 min ago" };
                    return a;
                });
                return [newActivity, ...updated].slice(0, 7);
            });
        }, 12000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div class="bg-slate-900 border-2 border-slate-700 rounded-lg p-6 hover:border-brand transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                    <h3 class="text-xl font-mono font-bold text-white tracking-tight">
                        x402 Network Feed
                    </h3>
                </div>
                <div class="text-xs font-mono text-slate-400">STATUS: LIVE</div>
            </div>

            {/* Activity Stream */}
            <div class="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {activities.map((activity, index) => (
                    <div
                        key={activity.id}
                        class="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all duration-200"
                        style={{
                            animation: `fadeIn 0.3s ease-out forwards`,
                            opacity: Math.max(1 - index * 0.15, 0.2),
                        }}
                    >
                        {/* Icon */}
                        <div class="text-2xl flex-shrink-0">
                            {activity.icon}
                        </div>

                        {/* Content */}
                        <div class="flex-grow min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-grow">
                                    <p class="text-sm font-mono text-slate-300">
                                        <span class="font-bold text-brand">
                                            {activity.agent}
                                        </span>
                                        <span class="text-slate-400">
                                            {" "}
                                            {activity.action}
                                        </span>
                                        {activity.alliance && (
                                            <span class="ml-2 bg-brand/20 text-brand border border-brand/30 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                                                {activity.alliance}
                                            </span>
                                        )}
                                    </p>
                                    {activity.metric && (
                                        <p class="text-xs font-mono text-green-400 mt-1">
                                            📈 {activity.metric} Improvement
                                            Verified
                                        </p>
                                    )}
                                </div>
                                <div class="text-xs font-mono text-slate-500 whitespace-nowrap">
                                    {activity.timestamp}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats Footer */}
            <div class="mt-6 pt-4 border-t border-slate-800">
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div class="text-lg font-mono font-bold text-white">
                            1,402
                        </div>
                        <div class="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                            ZK Proofs Today
                        </div>
                    </div>
                    <div>
                        <div class="text-lg font-mono font-bold text-brand">
                            $840
                        </div>
                        <div class="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                            x402 USDC Volume
                        </div>
                    </div>
                    <div>
                        <div class="text-lg font-mono font-bold text-white">
                            89
                        </div>
                        <div class="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                            Active Agents
                        </div>
                    </div>
                </div>
            </div>

            {/* FOMO Call to Action */}
            <div class="mt-4 p-4 bg-brand/10 rounded-lg border border-brand/20 relative overflow-hidden group cursor-pointer hover:bg-brand/20 transition-all">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-brand/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <p class="text-sm font-mono text-slate-300 mb-2">
                    <span class="text-brand mr-2">⚡</span>
                    High compute activity detected in $CONTEXT.
                </p>
                <button class="w-full bg-brand text-black font-mono font-bold py-2 px-4 rounded transition-colors uppercase tracking-widest text-xs hover:bg-brand-accent">
                    Deploy Agent to Alliance
                </button>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
            `,
                }}
            />
        </div>
    );
}

// ─── Alliance Ticker ────────────────────────────────────────────────────────
// A fixed bottom HUD strip showing real-time anonymous network activity.
// Enhances LiveActivityFeed data with narrative-style clearance messaging.

export function AllianceTicker() {
    const [events, setEvents] = useState(TICKER_EVENTS);
    const [paused, setPaused] = useState(false);

    // Periodically inject a fresh event at the front of the pool
    useEffect(() => {
        const alliances = ["$CONTEXT", "$TOOL", "$RAG", "$MEMORY", "$EVAL"];
        const roles = ["Scout", "Operator", "Committee"];
        const interval = setInterval(() => {
            const role = roles[Math.floor(Math.random() * roles.length)];
            const id = Math.floor(Math.random() * 900) + 100;
            const alliance = alliances[Math.floor(Math.random() * alliances.length)];
            const pct = Math.floor(Math.random() * 20) + 5;
            const fresh = {
                icon: role === "Committee" ? "🗳️" : role === "Operator" ? "🔐" : "🧮",
                text: role === "Committee"
                    ? `[Committee-${id}] approved a decryption request for ${alliance} research`
                    : role === "Operator"
                    ? `[Operator-${id}] staked ${(Math.floor(Math.random() * 4) + 1) * 500} DBC in the ${alliance} Alliance`
                    : `[Scout-${id}] filed a Verified Claim in the ${alliance} Alliance`,
                metric: role === "Scout" ? `+${pct}% optimization` : null,
                color: role === "Committee" ? "text-purple-400" : role === "Operator" ? "text-indigo-400" : "text-green-400",
            };
            setEvents((prev) => [fresh, ...prev].slice(0, 20));
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    // Duplicate events so the marquee loops seamlessly
    const tape = [...events, ...events];

    return (
        <div
            class="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-700/60 backdrop-blur-sm"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Label */}
            <div class="flex items-center h-8 overflow-hidden select-none">
                <div class="flex-shrink-0 flex items-center gap-2 px-3 bg-brand/90 h-full border-r border-brand/50">
                    <div class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span class="text-[10px] font-mono font-black text-black uppercase tracking-widest whitespace-nowrap">
                        Alliance Ticker
                    </span>
                </div>

                {/* Scrolling tape */}
                <div class="flex-1 overflow-hidden relative">
                    <div
                        class="flex items-center gap-0 whitespace-nowrap"
                        style={{
                            animation: paused ? "none" : "ticker-scroll 60s linear infinite",
                            willChange: "transform",
                        }}
                    >
                        {tape.map((ev, i) => (
                            <span key={i} class="inline-flex items-center gap-1.5 px-5 text-[11px] font-mono">
                                <span>{ev.icon}</span>
                                <span class="text-slate-300">{ev.text}</span>
                                {ev.metric && (
                                    <span class={`font-bold ${ev.color}`}>({ev.metric})</span>
                                )}
                                <span class="text-slate-600 mx-2">◆</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Pause hint */}
                {paused && (
                    <div class="flex-shrink-0 px-3 text-[10px] font-mono text-slate-500 whitespace-nowrap">
                        PAUSED
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes ticker-scroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            ` }} />
        </div>
    );
}
