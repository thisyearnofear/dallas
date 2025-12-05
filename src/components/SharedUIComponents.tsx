// CONSOLIDATED UI Components - AGGRESSIVE CONSOLIDATION of RetroAesthetics + UndergroundTheme
// Following Core Principles: DRY, CLEAN separation, PREVENT BLOAT

import { useState, useEffect } from "preact/hooks";

// CONSOLIDATE: All modal/dialog functionality into one reusable component
export function AgentEnhancedModal({ isOpen, onClose, title, children, agentStatus }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
  agentStatus?: 'analyzing' | 'coordinating' | 'complete';
}) {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 font-mono">
      <div class="bg-gray-200 border-4 border-gray-400 shadow-2xl max-w-2xl w-full relative">
        {/* Enhanced Title Bar with Agent Status */}
        <div class="bg-blue-800 text-white px-4 py-2 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-white border border-black"></div>
            <span class="font-bold text-sm">{title}</span>
            {/* NEW: Agent status indicator */}
            {agentStatus && (
              <span class="text-xs bg-green-600 px-2 py-1 rounded">
                🤖 {agentStatus.toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            class="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 text-xs border border-black"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div class="p-6 bg-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}

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
    <div class="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div class="bg-green-900 border-2 border-green-400 p-8 font-mono text-green-400">
        <div class="text-center">
          <div class="text-lg mb-4">{message}{dots}</div>

          {/* NEW: Agent activity feed */}
          {agentActivity && (
            <div class="mt-4 text-xs space-y-1">
              <div class="text-yellow-400">🤖 AGENT COORDINATION:</div>
              {agentActivity.map((activity, i) => (
                <div key={i} class="text-green-300">→ {activity}</div>
              ))}
            </div>
          )}

          {/* Animated progress */}
          <div class="mt-4 w-full bg-black h-2 border border-green-400">
            <div class="bg-green-400 h-full animate-pulse" style="width: 60%"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CONSOLIDATE: All network status components into one enhanced component  
export function EnhancedNetworkStatus() {
  // ENHANCED: Underground network messages with A.I.D.S. theme
  const networkMessages = [
    "🔒 Identity restoration network online - 47 nodes active",
    "🧠 A.I.D.S. stability patch distributed to Dallas network",
    "⚡ Agent coordination: Supply chain optimized",
    "🚨 Corporate AI sweep detected - network switching to stealth mode",
    "💾 New identity algorithms sourced from underground developers",
    "🤝 Connection established with sympathetic AI researchers",
    "📡 Encrypted communication from Ron's digital assistant",
    "🛡️ Agent security protocols upgraded - network resilient",
    "🔧 Identity fragmentation crisis resolved in sector 7",
    "📊 Agent network performance: 94% coordination efficiency"
  ];

  const [currentMessage, setCurrentMessage] = useState(0);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDecrypting(true);
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % networkMessages.length);
        setIsDecrypting(false);
      }, 1000);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div class="bg-black text-green-400 p-4 font-mono border border-green-600">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span class="text-sm font-bold">UNDERGROUND NETWORK STATUS</span>
      </div>

      <div class="text-xs h-4">
        {isDecrypting ? (
          <span class="animate-pulse">⚡ DECRYPTING...</span>
        ) : (
          <span>{networkMessages[currentMessage]}</span>
        )}
      </div>

      {/* NEW: Agent coordination indicator */}
      <div class="mt-2 flex gap-2 text-xs">
        <span class="bg-blue-900 px-2 py-1 rounded">🤖 4 AGENTS</span>
        <span class="bg-green-900 px-2 py-1 rounded">✅ COORDINATED</span>
        <span class="bg-yellow-900 px-2 py-1 rounded">⚡ OPTIMIZING</span>
      </div>
    </div>
  );
}

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
    if (level < 30) return "bg-green-600";
    if (level < 60) return "bg-yellow-600";
    if (level < 80) return "bg-orange-600";
    return "bg-red-600";
  };

  const getDangerLabel = (level: number) => {
    if (level < 30) return "SAFE";
    if (level < 60) return "CAUTION";
    if (level < 80) return "DANGER";
    return "CRITICAL";
  };

  return (
    <div class="bg-gray-900 p-4 border border-gray-600 font-mono">
      <div class="flex justify-between items-center mb-2">
        <span class="text-white text-sm font-bold">THREAT ASSESSMENT</span>
        {agentAnalysis && (
          <span class="text-xs text-blue-400">🤖 AI ANALYSIS: {agentAnalysis.confidence}% CONFIDENCE</span>
        )}
      </div>

      {/* Danger Level Bar */}
      <div class="flex items-center gap-2 mb-2">
        <span class="text-white text-xs w-16">{getDangerLabel(level)}</span>
        <div class="flex-1 bg-gray-700 h-4 border border-gray-500">
          <div
            class={`h-full ${getDangerColor(level)} transition-all duration-500`}
            style={`width: ${level}%`}
          ></div>
        </div>
        <span class="text-white text-xs w-8">{level}%</span>
      </div>

      {/* NEW: Agent analysis details */}
      {agentAnalysis && (
        <div class="mt-2 space-y-1 text-xs">
          {agentAnalysis.threats.length > 0 && (
            <div class="text-red-400">
              ⚠️ THREATS: {agentAnalysis.threats.slice(0, 2).join(", ")}
            </div>
          )}
          {agentAnalysis.recommendations.length > 0 && (
            <div class="text-green-400">
              💡 RECOMMEND: {agentAnalysis.recommendations[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    "A.I.D.S. Treatment Network - Autonomous Agent Enhanced",
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
    <div class="bg-black text-green-400 p-4 font-mono text-sm border-2 border-green-600 min-h-[400px]">
      {/* Terminal Output */}
      <div class="mb-4 space-y-1">
        {history.map((line, i) => (
          <div key={i} class={line.startsWith(">") ? "text-yellow-400" : ""}>
            {line}
          </div>
        ))}
      </div>

      {/* NEW: Agent Suggestions */}
      {agentSuggestions.length > 0 && (
        <div class="mb-2 p-2 bg-blue-900/30 border border-blue-600">
          <div class="text-blue-400 text-xs mb-1">🤖 AGENT SUGGESTIONS:</div>
          {agentSuggestions.map((suggestion, i) => (
            <div
              key={i}
              class="text-blue-300 text-xs cursor-pointer hover:text-white"
              onClick={() => setInput(suggestion)}
            >
              → {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Command Input */}
      <form onSubmit={handleSubmit} class="flex items-center">
        <span class="text-green-400 mr-2">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput((e.target as HTMLInputElement).value)}
          class="flex-1 bg-transparent text-green-400 outline-none"
          placeholder="Enter command..."
          autoFocus
        />
      </form>
    </div>
  );
}

// EXPORT: Single consolidated UI system
export {
  AgentEnhancedModal as Modal,
  AgentLoadingScreen as LoadingScreen,
  EnhancedNetworkStatus as NetworkStatus,
  AgentEnhancedDangerIndicator as DangerIndicator,
  EnhancedTerminalInterface as Terminal
};