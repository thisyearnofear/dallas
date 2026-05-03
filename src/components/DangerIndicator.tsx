// CONSOLIDATED Danger Indicator - AGGRESSIVE CONSOLIDATION of RetroAesthetics + UndergroundTheme
// Following Core Principles: DRY, CLEAN separation, PREVENT BLOAT

// CONSOLIDATE: All danger/status indicators into one enhanced component
export function AgentEnhancedDangerIndicator({
  level,
  agentAnalysis
}: {
  level: number;
  agentAnalysis?: {
    threats: string[];
    recommendations: string[];
    confidence: number;
  };
}) {
  const getDangerColor = (level: number) => {
    if (level < 30) return "bg-green-500";
    if (level < 60) return "bg-yellow-500";
    if (level < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  const getDangerLabel = (level: number) => {
    if (level < 30) return "SAFE";
    if (level < 60) return "CAUTION";
    if (level < 80) return "DANGER";
    return "CRITICAL";
  };

  return (
    <div class="bg-white dark:bg-slate-950 p-6 border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-mono shadow-sm transition-colors">
      <div class="flex justify-between items-center mb-4">
        <span class="text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest">Threat Assessment</span>
        {agentAnalysis && (
          <span class="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">🤖 AI Analysis: {agentAnalysis.confidence}%</span>
        )}
      </div>

      {/* Danger Level Bar */}
      <div class="flex items-center gap-3 mb-4">
        <span class="text-slate-700 dark:text-white text-[10px] font-black w-16 uppercase tracking-tighter">{getDangerLabel(level)}</span>
        <div class="flex-1 bg-slate-100 dark:bg-slate-800 h-4 border border-slate-200 dark:border-slate-700 rounded-full overflow-hidden shadow-inner">
          <div
            class={`h-full ${getDangerColor(level)} transition-all duration-700 shadow-md`}
            style={`width: ${level}%`}
          ></div>
        </div>
        <span class="text-slate-900 dark:text-white text-xs font-black w-10 text-right">{level}%</span>
      </div>

      {/* NEW: Agent analysis details */}
      {agentAnalysis && (
        <div class="mt-4 space-y-2 text-[10px] font-bold border-t border-slate-100 dark:border-slate-800 pt-4">
          {agentAnalysis.threats.length > 0 && (
            <div class="text-red-600 dark:text-red-400 flex items-start gap-2 uppercase">
              <span>⚠️</span>
              <span>Threats: {agentAnalysis.threats.slice(0, 2).join(", ")}</span>
            </div>
          )}
          {agentAnalysis.recommendations.length > 0 && (
            <div class="text-green-600 dark:text-green-400 flex items-start gap-2 uppercase">
              <span>💡</span>
              <span>Recommend: {agentAnalysis.recommendations[0]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
