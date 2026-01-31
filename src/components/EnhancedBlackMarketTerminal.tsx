// Enhanced Black Market Terminal - IMMERSIVE CINEMATIC EXPERIENCE
// Following Core Principles: MODULAR, PERFORMANT, CLEAN

import { useState, useEffect, useRef } from "preact/hooks";
import { useAgentNetwork } from "../hooks/useAgentNetwork";

// Terminal line type
type LineType = 'input' | 'output' | 'agent' | 'system' | 'error' | 'success' | 'warning';

interface TerminalLine {
  text: string;
  type: LineType;
  delay?: number;
}

export function EnhancedBlackMarketTerminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [agentSuggestions, setAgentSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentDangerLevel,
    assessThreatLevel,
    coordinateGroupPurchase,
    processIdentityRestoration,
    handleEmergencyResponse,
    isCoordinating
  } = useAgentNetwork();

  // Boot sequence on mount
  useEffect(() => {
    const bootSequence: TerminalLine[] = [
      { text: "", type: 'system' },
      { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
      { text: "║     DALLAS IDENTITY CLINIC - SECURE TERMINAL v2.1            ║", type: 'system' },
      { text: "║     A.I.D.S. Treatment Network - Autonomous Agent Enhanced   ║", type: 'system' },
      { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
      { text: "", type: 'system' },
      { text: "[SYSTEM] Initializing secure connection...", type: 'agent', delay: 300 },
      { text: "[SYSTEM] Handshake established. Encryption: AES-256-GCM", type: 'agent', delay: 200 },
      { text: "[SYSTEM] Agent network status: ONLINE", type: 'agent', delay: 200 },
      { text: "", type: 'system' },
      { text: "⚠️  UNAUTHORIZED ACCESS PROHIBITED  ⚠️", type: 'warning' },
      { text: "", type: 'system' },
      { text: "Type 'gm' to authenticate or 'help' for available commands...", type: 'output' },
      { text: "", type: 'output' },
    ];

    let delay = 0;
    bootSequence.forEach((line, index) => {
      delay += line.delay || 50;
      setTimeout(() => {
        setHistory(prev => [...prev, line]);
        if (index === bootSequence.length - 1) {
          setShowBootSequence(false);
        }
      }, delay);
    });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Dynamic agent suggestions
  useEffect(() => {
    const baseSuggestions = [
      "gm",
      "help",
      "status", 
      "agents",
      "treatments",
      "purchase",
      "coordinate",
      "threat-level",
    ];
    
    if (isAuthenticated) {
      baseSuggestions.push("group-buy", "emergency", "stealth", "bypass_auth.exe");
    }
    
    if (currentDangerLevel > 70) {
      baseSuggestions.unshift("emergency");
    }
    
    setAgentSuggestions(baseSuggestions);
  }, [currentDangerLevel, isAuthenticated]);

  const addToHistory = (text: string, type: LineType) => {
    setHistory(prev => [...prev, { text, type }]);
  };

  const typeLines = async (lines: TerminalLine[]) => {
    setIsTyping(true);
    for (const line of lines) {
      await new Promise(r => setTimeout(r, line.delay || 30));
      addToHistory(line.text, line.type);
    }
    setIsTyping(false);
  };

  const authenticateUser = async () => {
    const authSequence: TerminalLine[] = [
      { text: "", type: 'system' },
      { text: "⚠️  ACCESS DENIED  ⚠️", type: 'error', delay: 200 },
      { text: "DALLAS BUYERS CLUB NETWORK", type: 'warning', delay: 100 },
      { text: "Unauthorized Access Prohibited", type: 'warning', delay: 100 },
      { text: "", type: 'system', delay: 300 },
      { text: "[AGENT] Initiating authentication protocol...", type: 'agent', delay: 400 },
      { text: "[AGENT] Verifying wallet signature...", type: 'agent', delay: 300 },
      { text: "[AGENT] Scanning biometric hashes...", type: 'agent', delay: 300 },
      { text: "", type: 'system', delay: 200 },
      { text: "✅ AUTHENTICATED", type: 'success', delay: 200 },
      { text: "", type: 'system', delay: 100 },
      { text: "Welcome to the inner circle, fighter.", type: 'success', delay: 150 },
      { text: "Identity Scrambled • Access Granted", type: 'agent', delay: 100 },
      { text: "[ Debug Mode Active ]", type: 'warning', delay: 100 },
      { text: "", type: 'system' },
      { text: "Type 'help' to see available commands...", type: 'output' },
      { text: "", type: 'output' },
    ];
    
    await typeLines(authSequence);
    setIsAuthenticated(true);
  };

  const showHelp = async () => {
    const helpText: TerminalLine[] = isAuthenticated ? [
      { text: "", type: 'system' },
      { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
      { text: "║           DALLAS UNDERGROUND - COMMAND REFERENCE             ║", type: 'system' },
      { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
      { text: "", type: 'system' },
      { text: "AUTHENTICATION:", type: 'warning' },
      { text: "  gm              - Greet the system / Authenticate", type: 'output' },
      { text: "  bypass_auth.exe - [DEBUG] Force authentication (dev only)", type: 'output' },
      { text: "", type: 'system' },
      { text: "NETWORK STATUS:", type: 'warning' },
      { text: "  status          - Network and agent status", type: 'output' },
      { text: "  agents          - Detailed agent information", type: 'output' },
      { text: "  threat-level    - Current security assessment", type: 'output' },
      { text: "", type: 'system' },
      { text: "TREATMENTS:", type: 'warning' },
      { text: "  treatments      - List available A.I.D.S. treatments", type: 'output' },
      { text: "  purchase <name> - Acquire treatment via agent network", type: 'output' },
      { text: "  group-buy <name>- Coordinate bulk purchase", type: 'output' },
      { text: "", type: 'system' },
      { text: "OPERATIONS:", type: 'warning' },
      { text: "  coordinate <op> - Agent coordination for scenarios", type: 'output' },
      { text: "  emergency       - Activate emergency protocols", type: 'output' },
      { text: "  stealth         - Enter stealth mode", type: 'output' },
      { text: "", type: 'system' },
      { text: "🤖 All commands enhanced with autonomous agent support.", type: 'agent' },
      { text: "", type: 'output' },
    ] : [
      { text: "", type: 'system' },
      { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
      { text: "║              PUBLIC ACCESS - LIMITED COMMANDS                ║", type: 'system' },
      { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
      { text: "", type: 'system' },
      { text: "AVAILABLE COMMANDS:", type: 'warning' },
      { text: "  gm              - Authenticate with the network", type: 'output' },
      { text: "  help            - Show this help message", type: 'output' },
      { text: "  status          - Basic network status", type: 'output' },
      { text: "", type: 'system' },
      { text: "⚠️  Full access requires authentication.", type: 'warning' },
      { text: "    Type 'gm' to begin authentication sequence.", type: 'warning' },
      { text: "", type: 'output' },
    ];
    
    await typeLines(helpText);
  };

  const processCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    // Add input to history
    addToHistory(`> ${command}`, 'input');
    
    // Special commands that work without auth
    if (cmd === 'gm') {
      await authenticateUser();
      return;
    }
    
    if (cmd === 'help') {
      await showHelp();
      return;
    }
    
    if (cmd === 'bypass_auth.exe') {
      await typeLines([
        { text: "", type: 'system' },
        { text: "[DEBUG Mode] Force authentication initiated...", type: 'warning', delay: 200 },
        { text: "⚠️  WARNING: This bypasses security checks", type: 'error', delay: 200 },
        { text: "", type: 'system', delay: 300 },
        { text: "✅ AUTHENTICATED (Debug Override)", type: 'success', delay: 200 },
        { text: "Identity Scrambled • Access Granted", type: 'agent', delay: 100 },
        { text: "[ Debug Mode Active ]", type: 'warning', delay: 100 },
        { text: "", type: 'output' },
      ]);
      setIsAuthenticated(true);
      return;
    }
    
    // Require authentication for other commands
    if (!isAuthenticated) {
      await typeLines([
        { text: "", type: 'system' },
        { text: "⚠️  ACCESS DENIED", type: 'error', delay: 100 },
        { text: "Authentication required for this command.", type: 'warning', delay: 100 },
        { text: "Type 'gm' to authenticate.", type: 'output', delay: 100 },
        { text: "", type: 'output' },
      ]);
      return;
    }
    
    // Process authenticated commands
    setIsTyping(true);
    
    try {
      switch (true) {
        case cmd === 'status':
          await typeLines([
            { text: "", type: 'system' },
            { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
            { text: "║              DALLAS UNDERGROUND NETWORK STATUS               ║", type: 'system' },
            { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
            { text: "", type: 'system' },
            { text: `🔒 Network Security:      ${100 - currentDangerLevel}%`, type: 'output' },
            { text: `🤖 Agent Coordination:    ${isCoordinating ? 'ACTIVE' : 'STANDBY'}`, type: 'agent' },
            { text: `📡 MCP Protocol:          ONLINE`, type: 'agent' },
            { text: `💾 Data Integrity:        98.7%`, type: 'output' },
            { text: `👥 Active Members:        47`, type: 'output' },
            { text: `🧠 Identity Restorations: 23 in progress`, type: 'output' },
            { text: "", type: 'system' },
            { text: "🤖 AGENT STATUS: All systems operational", type: 'agent' },
            { text: "", type: 'output' },
          ]);
          break;

        case cmd === 'agents':
          await typeLines([
            { text: "", type: 'system' },
            { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
            { text: "║              AUTONOMOUS AGENT NETWORK                        ║", type: 'system' },
            { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
            { text: "", type: 'system' },
            { text: "🔧 SUPPLY CHAIN AGENT", type: 'agent' },
            { text: "   └─ Monitoring treatment availability", type: 'output' },
            { text: "   └─ Last action: Negotiated 12% price reduction", type: 'output' },
            { text: "", type: 'system' },
            { text: "🛡️  RISK ASSESSMENT AGENT", type: 'agent' },
            { text: `   └─ Current assessment: ${currentDangerLevel}% danger level`, type: 'output' },
            { text: "", type: 'system' },
            { text: "👥 COMMUNITY COORDINATION AGENT", type: 'agent' },
            { text: "   └─ Managing 47 members", type: 'output' },
            { text: "   └─ Active coordination: 3 group purchases pending", type: 'output' },
            { text: "", type: 'system' },
            { text: "🧠 IDENTITY RESTORATION AGENT", type: 'agent' },
            { text: "   └─ Success rate: 94.3% recovery efficiency", type: 'output' },
            { text: "", type: 'system' },
            { text: "🔗 MCP COORDINATION: Real-time inter-agent communication active", type: 'agent' },
            { text: "", type: 'output' },
          ]);
          break;

        case cmd === 'treatments':
          await typeLines([
            { text: "", type: 'system' },
            { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
            { text: "║           AVAILABLE A.I.D.S. TREATMENTS                      ║", type: 'system' },
            { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
            { text: "", type: 'system' },
            { text: "💊 AZT Identity Stabilizer", type: 'agent' },
            { text: "   Price: ₿0.5  |  Effectiveness: 85%", type: 'output' },
            { text: "", type: 'system' },
            { text: "🧠 Peptide-T Personality Code", type: 'agent' },
            { text: "   Price: ₿0.2  |  Effectiveness: 62%", type: 'output' },
            { text: "", type: 'system' },
            { text: "💾 DDC Memory Restoration", type: 'agent' },
            { text: "   Price: ₿0.3  |  Effectiveness: 91%", type: 'output' },
            { text: "", type: 'system' },
            { text: "🔬 Interferon Identity Suite", type: 'agent' },
            { text: "   Price: ₿0.8  |  Effectiveness: 23%", type: 'output' },
            { text: "", type: 'system' },
            { text: "🤖 AGENT RECOMMENDATIONS:", type: 'agent' },
            { text: "   • Most reliable: DDC Memory Restoration", type: 'output' },
            { text: "   • Most affordable: Peptide-T Personality Code", type: 'output' },
            { text: "   • Emergency option: AZT Identity Stabilizer", type: 'output' },
            { text: "", type: 'system' },
            { text: "Use 'purchase <treatment>' or 'group-buy <treatment>'", type: 'output' },
            { text: "", type: 'output' },
          ]);
          break;

        case cmd === 'threat-level':
          const assessment = await assessThreatLevel();
          await typeLines([
            { text: "", type: 'system' },
            { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
            { text: "║              THREAT ASSESSMENT RESULTS                       ║", type: 'system' },
            { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
            { text: "", type: 'system' },
            { text: `🚨 Current Threat Level: ${currentDangerLevel}%`, type: currentDangerLevel > 70 ? 'error' : 'warning' },
            { text: `📊 Confidence: ${assessment.synthesizedThreat?.confidence || 90}%`, type: 'output' },
            { text: "", type: 'system' },
            { text: `Corporate AI Activity: ${Math.floor(currentDangerLevel * 0.7)}%`, type: 'output' },
            { text: `Network Exposure:      ${Math.floor(currentDangerLevel * 0.5)}%`, type: 'output' },
            { text: `Supply Chain Risk:     ${Math.floor(currentDangerLevel * 0.3)}%`, type: 'output' },
            { text: "", type: 'system' },
            { text: `🤖 AGENT RECOMMENDATION: ${
              currentDangerLevel > 80 ? 'IMMEDIATE ACTION REQUIRED' :
              currentDangerLevel > 60 ? 'Maintain heightened security' :
              'Continue normal operations'
            }`, type: 'agent' },
            { text: "", type: 'output' },
          ]);
          break;

        case cmd === 'emergency':
          await typeLines([
            { text: "", type: 'system' },
            { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
            { text: "║           🚨 EMERGENCY PROTOCOL ACTIVATED 🚨                 ║", type: 'error' },
            { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
            { text: "", type: 'system' },
            { text: "🚨 ALL AGENTS RESPONDING", type: 'error' },
            { text: "🔒 Network switching to stealth mode", type: 'warning' },
            { text: "📡 Backup communication channels active", type: 'agent' },
            { text: "💾 Critical data protection enabled", type: 'agent' },
            { text: "👥 Member alert system triggered", type: 'agent' },
            { text: "", type: 'system' },
            { text: "Ron Woodroof emergency protocols in effect.", type: 'warning' },
            { text: "Underground network secured.", type: 'success' },
            { text: "", type: 'output' },
          ]);
          break;

        case cmd === 'stealth':
          await typeLines([
            { text: "", type: 'system' },
            { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
            { text: "║              👻 STEALTH MODE ACTIVATED                       ║", type: 'system' },
            { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
            { text: "", type: 'system' },
            { text: "👻 Network visibility:   MINIMIZED", type: 'agent' },
            { text: "🔐 Encryption:           MAXIMUM SECURITY", type: 'agent' },
            { text: "📡 Traffic routing:      RANDOMIZED", type: 'agent' },
            { text: "🤖 Agent coordination:   SILENT MODE", type: 'agent' },
            { text: "🕰️  Duration:            Until manually disabled", type: 'output' },
            { text: "", type: 'system' },
            { text: "Operating in ghost mode...", type: 'agent' },
            { text: "", type: 'output' },
          ]);
          break;

        default:
          await typeLines([
            { text: "", type: 'system' },
            { text: `Unknown command: '${command}'`, type: 'error' },
            { text: "Type 'help' for available commands.", type: 'output' },
            { text: "", type: 'system' },
            { text: "🤖 AGENT SUGGESTION: Did you mean one of these?", type: 'agent' },
            ...agentSuggestions.slice(0, 3).map(s => ({ 
              text: `  • ${s}`, 
              type: 'output' as LineType 
            })),
            { text: "", type: 'output' },
          ]);
      }
    } catch (error: any) {
      await typeLines([
        { text: "", type: 'system' },
        { text: `ERROR: ${error.message}`, type: 'error' },
        { text: "", type: 'system' },
        { text: "🤖 AGENT ALERT: Command execution failed.", type: 'agent' },
        { text: "Network coordination may be temporarily unavailable.", type: 'output' },
        { text: "", type: 'output' },
      ]);
    }
    
    setIsTyping(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || isTyping || showBootSequence) return;
    
    await processCommand(input.trim());
    setInput("");
    setShowSuggestions(false);
  };

  const getLineStyle = (type: LineType) => {
    switch (type) {
      case 'input': return 'text-yellow-400 font-bold';
      case 'agent': return 'text-blue-400';
      case 'system': return 'text-green-500 font-bold';
      case 'error': return 'text-red-500 font-bold';
      case 'success': return 'text-green-400 font-bold';
      case 'warning': return 'text-orange-400 font-bold';
      default: return 'text-green-400';
    }
  };

  return (
    <div class="bg-black text-green-400 border-2 border-green-600 rounded-lg font-mono text-sm relative overflow-hidden shadow-2xl">
      {/* CRT Scanline Effect */}
      <div class="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
      
      {/* Terminal Header */}
      <div class="bg-green-800 text-black px-4 py-3 flex justify-between items-center border-b-2 border-green-600">
        <div class="flex items-center gap-3">
          <div class="flex gap-1.5">
            <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span class="ml-2 font-bold text-sm tracking-wider">SECURE TERMINAL v2.1</span>
        </div>
        <div class="flex items-center gap-4 text-xs">
          <span class={isAuthenticated ? "text-green-300" : "text-red-300"}>
            {isAuthenticated ? "🔓 AUTHENTICATED" : "🔒 LOCKED"}
          </span>
          <span class="text-green-300">
            🤖 {isCoordinating ? 'COORDINATING' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        class="p-4 h-[28rem] overflow-y-auto space-y-1 bg-black scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-black"
      >
        {history.map((line, i) => (
          <div 
            key={i} 
            class={`${getLineStyle(line.type)} whitespace-pre-wrap ${line.type === 'input' ? 'animate-fadeIn' : ''}`}
          >
            {line.text}
          </div>
        ))}
        
        {isTyping && (
          <div class="text-blue-400 animate-pulse flex items-center gap-2">
            <span>🤖</span>
            <span>Agents processing command</span>
            <span class="loading-dots"></span>
          </div>
        )}
      </div>

      {/* Command Input */}
      <form onSubmit={handleSubmit} class="border-t-2 border-green-600 p-4 bg-green-900/10">
        <div class="flex items-center gap-3">
          <span class="text-green-400 text-lg">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput((e.target as HTMLInputElement).value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            class="flex-1 bg-transparent text-green-400 outline-none text-base placeholder-green-700"
            placeholder={showBootSequence ? "Initializing..." : "Enter command..."}
            disabled={isTyping || showBootSequence}
            autoFocus
          />
          <button
            type="submit"
            disabled={isTyping || showBootSequence || !input.trim()}
            class="bg-green-700 hover:bg-green-600 disabled:bg-green-900 text-black font-bold px-4 py-2 rounded transition-colors text-sm"
          >
            EXEC
          </button>
        </div>

        {/* Agent Suggestions */}
        {showSuggestions && agentSuggestions.length > 0 && input.length > 0 && !showBootSequence && (
          <div class="absolute bottom-full mb-2 left-4 right-4 bg-black border-2 border-green-600 rounded-lg shadow-2xl max-h-48 overflow-y-auto z-20">
            <div class="p-2 text-xs text-blue-400 border-b border-green-600 bg-green-900/20 font-bold">
              🤖 AGENT SUGGESTIONS:
            </div>
            {agentSuggestions
              .filter(suggestion => suggestion.toLowerCase().includes(input.toLowerCase()))
              .slice(0, 6)
              .map((suggestion, i) => (
                <div 
                  key={i}
                  class="px-4 py-2 hover:bg-green-900/40 cursor-pointer text-green-300 hover:text-white transition-colors text-sm"
                  onClick={() => {
                    setInput(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </div>
              ))}
          </div>
        )}
      </form>

      {/* Status Bar */}
      <div class="border-t border-green-800 px-4 py-2 bg-green-900/20 text-xs flex justify-between items-center">
        <span class="text-green-600">
          DALLAS IDENTITY CLINIC • A.I.D.S. Treatment Network
        </span>
        <span class={currentDangerLevel > 70 ? "text-red-400 animate-pulse" : "text-green-600"}>
          Threat: {currentDangerLevel}%
        </span>
      </div>
    </div>
  );
}

export default EnhancedBlackMarketTerminal;
