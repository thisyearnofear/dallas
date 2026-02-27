import { useEffect, useState } from "preact/hooks";

interface AgentActivity {
    id: number;
    type: "x402_payment" | "zk_proof" | "heartbeat" | "alliance_join";
    agent: string;
    action: string;
    timestamp: string;
    alliance?: string;
    metric?: string;
    icon: string;
    color: string;
}

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
