// CONSOLIDATED UI Components - AGGRESSIVE CONSOLIDATION of RetroAesthetics + UndergroundTheme
// Following Core Principles: DRY, CLEAN separation, PREVENT BLOAT

import { useState, useEffect } from "preact/hooks";

// CONSOLIDATE: All modal/dialog functionality into one reusable component
export function AgentEnhancedModal({ isOpen, onClose, title, children, agentStatus, size = 'default', closeable = true }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
  agentStatus?: 'analyzing' | 'coordinating' | 'complete';
  size?: 'default' | 'large' | 'full';
  closeable?: boolean;
}) {
  if (!isOpen) return null;

  const sizeClass = size === 'large' ? 'max-w-4xl' : size === 'full' ? 'max-w-6xl max-h-[90vh]' : 'max-w-2xl';

  return (
    <div class="fixed inset-0 bg-slate-900/80 dark:bg-black/80 z-50 flex items-center justify-center p-4 font-mono backdrop-blur-sm">
      <div class={`bg-slate-50 dark:bg-slate-900 border-4 border-slate-400 dark:border-slate-700 shadow-2xl ${sizeClass} w-full relative rounded-xl overflow-hidden transition-colors duration-300`}>
        {/* Enhanced Title Bar with Agent Status */}
        <div class="bg-blue-700 dark:bg-blue-900 text-white px-4 py-3 flex justify-between items-center border-b-2 border-slate-300 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-white border border-black rounded-sm shadow-sm"></div>
            <span class="font-black text-xs uppercase tracking-widest">{title}</span>
            {/* NEW: Agent status indicator */}
            {agentStatus && (
              <span class="text-[10px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                🤖 {agentStatus.toUpperCase()}
              </span>
            )}
          </div>
          {closeable && (
            <button
              onClick={onClose}
              class="bg-red-500 hover:bg-red-600 text-white font-black px-3 py-1 rounded border border-red-700 shadow-md transition-all active:scale-95"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div class={`p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 ${size === 'full' ? 'overflow-y-auto max-h-[calc(90vh-60px)]' : ''}`}>
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
    <div class="bg-white dark:bg-black text-slate-900 dark:text-green-400 p-5 font-mono border-2 border-slate-200 dark:border-green-600 rounded-xl shadow-sm transition-colors">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500"></div>
        <span class="text-xs font-black uppercase tracking-widest">Network Status</span>
      </div>

      <div class="text-xs font-bold h-6 flex items-center bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5 shadow-inner overflow-hidden">
        {isDecrypting ? (
          <span class="animate-pulse text-blue-600 dark:text-blue-400 uppercase">⚡ Decrypting Signal...</span>
        ) : (
          <span class="text-slate-700 dark:text-green-300 transition-all duration-500 italic">"{networkMessages[currentMessage]}"</span>
        )}
      </div>

      {/* NEW: Agent coordination indicator */}
      <div class="mt-4 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-tighter">
        <span class="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">🤖 4 Agents</span>
        <span class="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded border border-green-200 dark:border-green-800">✅ Coordinated</span>
        <span class="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-800">⚡ Optimizing</span>
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

// LEGAL COMPONENTS - Integrated following Core Principles (enhancing SharedUIComponents)

import { 
  DISCLAIMER_BANNER, 
  SUBMISSION_CONSENT, 
  TERMS_OF_SERVICE, 
  PRIVACY_POLICY,
  DISCOVERY_DISCLAIMER 
} from '../config/legal';

// Persistent disclaimer banner for bottom of screen
export function DisclaimerBanner({ variant = 'minimal' }: { variant?: 'minimal' | 'full' }) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed && variant === 'minimal') return null;
  
  return (
    <div class="fixed bottom-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-900/95 border-t-2 border-yellow-400 dark:border-yellow-600 px-6 py-3 z-40 shadow-2xl backdrop-blur-md transition-all">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-6">
        <div class="flex items-center gap-4 text-yellow-800 dark:text-yellow-200 text-xs sm:text-sm font-bold">
          <span class="text-2xl animate-bounce">⚠️</span>
          <span class="leading-relaxed">{variant === 'full' ? DISCLAIMER_BANNER.full : DISCLAIMER_BANNER.short}</span>
        </div>
        {variant === 'minimal' && (
          <button 
            onClick={() => setDismissed(true)}
            class="bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-300 dark:hover:text-yellow-200 text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-yellow-400 dark:border-yellow-600 rounded-lg transition-all transform hover:scale-105 active:scale-95"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

// Pre-submission consent checkboxes (integrates into forms)
export function SubmissionConsentCheckboxes({ 
  onAllChecked 
}: { 
  onAllChecked: (allChecked: boolean) => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const allRequired = SUBMISSION_CONSENT.checkboxes
      .filter(c => c.required)
      .every(c => checked[c.id]);
    onAllChecked(allRequired);
  }, [checked, onAllChecked]);
  
  return (
    <div class="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-yellow-500/30 rounded-2xl shadow-inner transition-colors">
      <div class="text-yellow-700 dark:text-yellow-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
        <span class="text-lg">⚠️</span>
        <span>{SUBMISSION_CONSENT.title}</span>
      </div>
      <div class="space-y-3">
        {SUBMISSION_CONSENT.checkboxes.map((item) => (
          <label key={item.id} class="flex items-start gap-4 cursor-pointer group p-2 hover:bg-white dark:hover:bg-black/20 rounded-lg transition-all">
            <div class="relative flex items-center">
              <input
                type="checkbox"
                checked={checked[item.id] || false}
                onChange={(e) => setChecked(prev => ({ 
                  ...prev, 
                  [item.id]: (e.target as HTMLInputElement).checked 
                }))}
                class="sr-only peer"
              />
              <div class="w-5 h-5 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-md peer-checked:bg-green-500 peer-checked:border-green-600 transition-all shadow-sm"></div>
              <svg class="absolute w-3.5 h-3.5 text-white left-[3px] top-[3px] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span class="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white leading-relaxed">
              {item.label}
              {item.required && <span class="text-red-500 ml-1.5 font-black">*</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Terms of Service modal content
export function TermsOfServiceContent() {
  return (
    <div class="text-sm space-y-6 pr-4 font-medium leading-relaxed">
      {TERMS_OF_SERVICE.sections.map((section, i) => (
        <div key={i} class="bg-slate-50 dark:bg-black/20 p-5 rounded-xl border border-slate-100 dark:border-white/5">
          <h4 class="font-black text-green-700 dark:text-green-400 mb-3 uppercase tracking-tighter flex items-center gap-2">
            <span class="w-1.5 h-4 bg-green-500 rounded-full"></span>
            {section.heading}
          </h4>
          <p class="whitespace-pre-line text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{section.content}</p>
        </div>
      ))}
    </div>
  );
}

// Privacy Policy modal content
export function PrivacyPolicyContent() {
  return (
    <div class="text-sm space-y-6 pr-4 font-medium leading-relaxed">
      {PRIVACY_POLICY.sections.map((section, i) => (
        <div key={i} class="bg-slate-50 dark:bg-black/20 p-5 rounded-xl border border-slate-100 dark:border-white/5">
          <h4 class="font-black text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-tighter flex items-center gap-2">
            <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
            {section.heading}
          </h4>
          <p class="whitespace-pre-line text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{section.content}</p>
        </div>
      ))}
    </div>
  );
}

// First-time terms acceptance modal - lightweight, non-intrusive
export function TermsAcceptanceModal({ 
  isOpen, 
  onAccept 
}: { 
  isOpen: boolean; 
  onAccept: () => void;
}) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  if (!isOpen) return null;
  
  return (
    <>
      <div class="fixed inset-0 bg-slate-900/90 dark:bg-black/95 z-[100] flex items-center justify-center p-4 font-mono backdrop-blur-xl transition-all duration-500">
        <div class="bg-white dark:bg-slate-900 border-2 border-green-500/50 shadow-2xl max-w-md w-full rounded-2xl overflow-hidden transform animate-scaleIn">
          {/* Title Bar */}
          <div class="bg-green-600 text-white px-6 py-5 border-b border-green-700 flex items-center gap-3">
            <div class="text-2xl bg-white/20 p-2 rounded-xl backdrop-blur-sm">🏥</div>
            <div>
              <span class="font-black uppercase tracking-[0.2em] text-sm block">Verification Protocol</span>
              <span class="text-[9px] font-bold opacity-70 uppercase tracking-widest">Dallas_Buyers_Club_Mainnet</span>
            </div>
          </div>
          
          {/* Content */}
          <div class="p-8">
            <p class="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-6 tracking-tight">
              A privacy-first community for sharing wellness experiments. 
              This is <strong class="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-1 rounded">not medical advice</strong>.
            </p>
            
            <p class="text-slate-600 dark:text-slate-400 text-xs font-medium mb-8 leading-relaxed">
              By continuing, you acknowledge our mission and agree to our{' '}
              <button 
                onClick={() => setShowTerms(true)} 
                class="text-green-600 dark:text-green-400 underline decoration-dotted underline-offset-4 hover:text-green-700 dark:hover:text-green-300 font-black transition-colors"
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button 
                onClick={() => setShowPrivacy(true)} 
                class="text-green-600 dark:text-green-400 underline decoration-dotted underline-offset-4 hover:text-green-700 dark:hover:text-green-300 font-black transition-colors"
              >
                Privacy Policy
              </button>.
            </p>
            
            <button
              onClick={onAccept}
              class="w-full py-4 font-black text-lg rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl border border-green-500 uppercase tracking-widest"
            >
              Enter Club
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Terms Modal */}
      {showTerms && (
        <div class="fixed inset-0 bg-slate-900/95 dark:bg-black/90 z-[110] flex items-center justify-center p-4 font-mono backdrop-blur-md">
          <div class="bg-white dark:bg-slate-900 border-2 border-green-500 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col rounded-2xl overflow-hidden animate-slideUp">
            <div class="bg-green-600 text-white px-6 py-4 flex justify-between items-center border-b border-green-700 shadow-md">
              <span class="font-black uppercase tracking-[0.2em] text-sm">Terms of Service</span>
              <button 
                onClick={() => setShowTerms(false)} 
                class="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-all"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="p-8 overflow-y-auto flex-1 custom-scrollbar scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <TermsOfServiceContent />
            </div>
            <div class="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 text-center">
              <button onClick={() => setShowTerms(false)} class="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline">Close Document</button>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Privacy Modal */}
      {showPrivacy && (
        <div class="fixed inset-0 bg-slate-900/95 dark:bg-black/90 z-[110] flex items-center justify-center p-4 font-mono backdrop-blur-md">
          <div class="bg-white dark:bg-slate-900 border-2 border-green-500 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col rounded-2xl overflow-hidden animate-slideUp">
            <div class="bg-green-600 text-white px-6 py-4 flex justify-between items-center border-b border-green-700 shadow-md">
              <span class="font-black uppercase tracking-[0.2em] text-sm">Privacy Policy</span>
              <button 
                onClick={() => setShowPrivacy(false)} 
                class="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-all"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="p-8 overflow-y-auto flex-1 custom-scrollbar scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <PrivacyPolicyContent />
            </div>
            <div class="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 text-center">
              <button onClick={() => setShowPrivacy(false)} class="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline">Close Document</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Discovery results disclaimer (inline)
export function DiscoveryDisclaimer() {
  return (
    <div class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 p-5 rounded-2xl text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 shadow-sm transition-all animate-fadeIn">
      <div class="flex items-start gap-4">
        <span class="text-2xl animate-pulse">⚠️</span>
        <div class="font-bold leading-relaxed">{DISCOVERY_DISCLAIMER}</div>
      </div>
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