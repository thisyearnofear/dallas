// CONSOLIDATED Loading Screen - AGGRESSIVE CONSOLIDATION of RetroAesthetics + UndergroundTheme
// Following Core Principles: DRY, CLEAN separation, PREVENT BLOAT

import { useState, useEffect } from "preact/hooks";

// CONSOLIDATE: All loading states into one component with agent enhancement
export function AgentLoadingScreen({ message = "Processing...", agentActivity }: {
  message?: string;
  agentActivity?: string[];
}) {
  const [dots, setDots] = useState("...");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "." : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div class="fixed inset-0 bg-slate-100/90 dark:bg-black/95 flex items-center justify-center z-[100] backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 border-2 border-green-500 p-10 rounded-2xl shadow-2xl font-mono text-green-600 dark:text-green-400 max-w-md w-full transition-all">
        <div class="text-center">
          <div class="text-xl font-black mb-6 uppercase tracking-tighter">{message}{dots}</div>

          {/* NEW: Agent activity feed */}
          {agentActivity && (
            <div class="mt-6 text-[10px] space-y-2 bg-slate-50 dark:bg-black/40 p-4 rounded-xl border border-slate-100 dark:border-white/5 text-left shadow-inner">
              <div class="text-yellow-600 dark:text-yellow-400 font-black tracking-widest mb-2 border-b border-yellow-500/20 pb-1">🤖 Agent Coordination:</div>
              {agentActivity.map((activity, i) => (
                <div key={i} class="text-slate-600 dark:text-green-300 font-bold flex items-start gap-2">
                  <span class="animate-pulse">→</span>
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          )}

          {/* Animated progress */}
          <div class="mt-8 w-full bg-slate-200 dark:bg-black h-3 border border-slate-300 dark:border-green-900 rounded-full overflow-hidden shadow-inner">
            <div class="bg-green-500 h-full animate-pulse shadow-sm shadow-green-500" style="width: 65%"></div>
          </div>
          <div class="mt-4 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Dallas Identity Restoration Protocol</div>
        </div>
      </div>
    </div>
  );
}
