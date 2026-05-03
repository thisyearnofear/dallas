// CONSOLIDATED Terminal Interface - AGGRESSIVE CONSOLIDATION of RetroAesthetics + UndergroundTheme
// Following Core Principles: DRY, CLEAN separation, PREVENT BLOAT

import { useState } from "preact/hooks";

// CONSOLIDATE: All terminal/console interfaces 
export function EnhancedTerminalInterface({
  onCommand,
  agentSuggestions = []
}: {
  onCommand: (cmd: string) => void;
  agentSuggestions?: string[];
}) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    "DALLAS IDENTITY CLINIC - SECURE TERMINAL v2.1",
    "A.I.D.S. Architecture Network - Autonomous Agent Enhanced",
    "Type 'help' for available commands...",
    ""
  ]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;

    setHistory(prev => [...prev, `> ${input}`, ""]);
    onCommand(input.trim());
    setInput("");
  };

  return (
    <div class="bg-slate-950 dark:bg-black text-green-500 dark:text-green-400 p-6 font-mono text-sm border-2 border-green-500/30 rounded-2xl shadow-2xl min-h-[450px] flex flex-col transition-colors duration-500">
      {/* Terminal Output */}
      <div class="flex-grow mb-6 space-y-1 overflow-y-auto max-h-[350px] custom-scrollbar scrollbar-thin scrollbar-thumb-green-900">
        {history.map((line, i) => (
          <div key={i} class={`${line.startsWith(">") ? "text-yellow-400 font-black" : "font-medium"} leading-tight`}>
            {line}
          </div>
        ))}
      </div>

      {/* NEW: Agent Suggestions */}
      {agentSuggestions.length > 0 && (
        <div class="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl shadow-inner">
          <div class="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            🤖 Agent Suggestions:
          </div>
          <div class="flex flex-wrap gap-2">
            {agentSuggestions.map((suggestion, i) => (
              <div
                key={i}
                class="text-blue-300 text-[10px] font-bold cursor-pointer hover:text-white bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 hover:border-blue-400 transition-all hover:bg-blue-500/30 uppercase tracking-tighter"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Command Input */}
      <form onSubmit={handleSubmit} class="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner group">
        <span class="text-green-500 font-black animate-pulse">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput((e.target as HTMLInputElement).value)}
          class="flex-1 bg-transparent text-green-400 outline-none font-bold placeholder:opacity-20 placeholder:text-green-900"
          placeholder="Enter command (e.g. HELP, SCAN, SYNC)"
          autoFocus
        />
      </form>
    </div>
  );
}
