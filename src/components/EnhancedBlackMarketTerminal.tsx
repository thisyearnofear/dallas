// Enhanced Black Market Terminal - ENHANCEMENT FIRST with delightful UX
// Following Core Principles: MODULAR, PERFORMANT, CLEAN

import { useState, useEffect, useRef } from "preact/hooks";
import { DelightfulTypingText, DelightfulActionButton, DelightfulNotification } from "./EnhancedUISystem";
import { useAgentNetwork } from "../hooks/useAgentNetwork";

export function EnhancedBlackMarketTerminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Array<{text: string; type: 'input' | 'output' | 'agent' | 'system'}>>([
    { text: "DALLAS IDENTITY CLINIC - SECURE TERMINAL v3.0", type: 'system' },
    { text: "A.I.D.S. Treatment Network - MCP Agent Enhanced", type: 'system' },
    { text: "Autonomous agents standing by...", type: 'agent' },
    { text: "Type 'help' for available commands", type: 'output' },
    { text: "", type: 'output' }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [agentSuggestions, setAgentSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'info'|'success'|'warning'|'error'} | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentDangerLevel,
    assessThreatLevel,
    coordinateGroupPurchase,
    processIdentityRestoration,
    handleEmergencyResponse,
    isCoordinating
  } = useAgentNetwork();

  // PERFORMANT: Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // ENHANCED: Dynamic agent suggestions based on context
  useEffect(() => {
    const suggestions = [
      "status",
      "agents",
      "threat-level", 
      "treatments",
      "coordinate emergency-raid",
      "purchase azt-patch",
      "restore identity-007",
      "group-buy peptide-code"
    ];
    
    if (currentDangerLevel > 70) {
      suggestions.unshift("emergency protocol", "stealth mode");
    }
    
    setAgentSuggestions(suggestions);
  }, [currentDangerLevel]);

  // ENHANCED: Intelligent command processing with agent coordination
  const processCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    setIsTyping(true);
    
    // Add input to history
    addToHistory(`> ${command}`, 'input');
    
    let response = "";
    let responseType: 'output' | 'agent' | 'system' = 'output';
    
    try {
      switch (true) {
        case cmd === 'help':
          response = `AVAILABLE COMMANDS:
• status - Network and agent status
• agents - Detailed agent information  
• threat-level - Current security assessment
• treatments - Available A.I.D.S. treatments
• coordinate <scenario> - Agent coordination
• purchase <treatment> - Treatment acquisition
• restore <patient-id> - Identity restoration
• group-buy <treatment> - Coordinate group purchase
• emergency protocol - Emergency response
• stealth mode - Activate stealth operations

🤖 All commands enhanced with autonomous agent support.`;
          break;

        case cmd === 'status':
          response = `DALLAS UNDERGROUND NETWORK STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 Network Security: ${100 - currentDangerLevel}%
🤖 Agent Coordination: ${isCoordinating ? 'ACTIVE' : 'STANDBY'}
📡 MCP Protocol: ONLINE
💾 Data Integrity: 98.7%
👥 Active Members: 47
🧠 Identity Restorations: 23 in progress

🤖 AGENT STATUS: All systems operational`;
          responseType = 'agent';
          break;

        case cmd === 'agents':
          response = `AUTONOMOUS AGENT NETWORK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 SUPPLY CHAIN AGENT: Monitoring treatment availability
   └─ Last action: Negotiated 12% price reduction
   
🛡️ RISK ASSESSMENT AGENT: Analyzing threat patterns  
   └─ Current assessment: ${currentDangerLevel}% danger level
   
👥 COMMUNITY COORDINATION AGENT: Managing 47 members
   └─ Active coordination: 3 group purchases pending
   
🧠 IDENTITY RESTORATION AGENT: Processing treatments
   └─ Success rate: 94.3% recovery efficiency

🔗 MCP COORDINATION: Real-time inter-agent communication active`;
          responseType = 'agent';
          break;

        case cmd === 'threat-level':
          const assessment = await assessThreatLevel();
          response = `THREAT ASSESSMENT RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 Current Threat Level: ${currentDangerLevel}%
📊 Confidence: ${assessment.synthesizedThreat?.confidence || 90}%

Corporate AI Activity: ${Math.floor(currentDangerLevel * 0.7)}%
Network Exposure: ${Math.floor(currentDangerLevel * 0.5)}%
Supply Chain Risk: ${Math.floor(currentDangerLevel * 0.3)}%

🤖 AGENT RECOMMENDATION: ${
  currentDangerLevel > 80 ? 'IMMEDIATE ACTION REQUIRED' :
  currentDangerLevel > 60 ? 'Maintain heightened security' :
  'Continue normal operations'
}`;
          responseType = 'agent';
          setNotification({
            message: `Threat assessment complete: ${currentDangerLevel}% danger`,
            type: currentDangerLevel > 70 ? 'warning' : 'info'
          });
          break;

        case cmd.startsWith('coordinate '):
          const scenario = cmd.replace('coordinate ', '');
          const emergency = await handleEmergencyResponse(scenario);
          response = `EMERGENCY COORDINATION INITIATED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 Scenario: ${scenario.toUpperCase()}
🤖 Agent Response: ALL AGENTS COORDINATED
⚡ Protocol: Dual-system emergency activation
📋 Actions: ${scenario === 'emergency-raid' ? 
  '• Network stealth mode activated\n• Data scatter protocols engaged\n• Member alert system triggered' :
  '• Standard emergency procedures\n• Agent coordination active\n• Monitoring increased'
}

Estimated resolution: 2-4 hours`;
          responseType = 'system';
          setNotification({
            message: `Emergency coordination activated: ${scenario}`,
            type: 'warning'
          });
          break;

        case cmd.startsWith('purchase '):
          const treatment = cmd.replace('purchase ', '');
          const purchase = await processIdentityRestoration('user_001', treatment);
          
          // Enhanced response based on actual Edenlayer task composition
          response = `TREATMENT ACQUISITION - EDENLAYER TASK COMPOSITION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💊 Treatment: ${treatment.toUpperCase()}
🔗 Edenlayer Workflow: ${purchase.edenlayerTaskId || 'Fallback coordination'}
🤖 Multi-Agent Pipeline:
   1️⃣ Risk Assessment Agent → Transaction analysis
   2️⃣ Supply Chain Agent → Availability check
   3️⃣ Identity Agent → Fragmentation assessment  
   4️⃣ Planning Coordination → Treatment sequencing
   5️⃣ Final Approval → Community coordination

💰 Blockchain Transaction: ${purchase.transactionId || 'Processing...'}
📊 Estimated Recovery: ${purchase.estimatedRecovery}
🎯 Agent Coordination: ${purchase.success ? 'COMPLETED' : 'IN_PROGRESS'}

${purchase.success ? 
  '✅ Multi-agent workflow completed successfully!\n   Real Solana transaction executed via agent decisions.\n   Identity restoration protocol initiated.' :
  '⏳ Agents executing complex coordination workflow...\n   Risk assessment, availability check, and planning in progress.\n   Blockchain transaction pending agent approval.'}

🔍 View full workflow: Edenlayer Task ID ${purchase.edenlayerTaskId}`;
          responseType = 'agent';
          setNotification({
            message: purchase.success ? 
              `${treatment} purchased via 5-agent Edenlayer workflow` :
              `Multi-agent evaluation in progress for ${treatment}`,
            type: purchase.success ? 'success' : 'info'
          });
          break;

        case cmd.startsWith('group-buy '):
          const groupTreatment = cmd.replace('group-buy ', '');
          const groupBuy = await coordinateGroupPurchase([groupTreatment]);
          response = `GROUP PURCHASE COORDINATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💊 Treatment: ${groupTreatment.toUpperCase()}
👥 Participants: 5 members coordinated
💰 Bulk Savings: ${groupBuy.estimatedSavings}
🤖 Agent Management: Supply + Community + Risk
📅 Timeline: 48-72 hours

Group coordination in progress...`;
          responseType = 'agent';
          setNotification({
            message: `Group purchase for ${groupTreatment} coordinated`,
            type: 'success'
          });
          break;

        case cmd === 'emergency protocol':
          response = `EMERGENCY PROTOCOL ACTIVATED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 ALL AGENTS RESPONDING
🔒 Network switching to stealth mode
📡 Backup communication channels active
💾 Critical data protection enabled
👥 Member alert system triggered

Ron Woodroof emergency protocols in effect.
Underground network secured.`;
          responseType = 'system';
          setNotification({
            message: 'Emergency protocol activated!',
            type: 'warning'
          });
          break;

        case cmd === 'stealth mode':
          response = `STEALTH MODE ACTIVATED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👻 Network visibility: MINIMIZED
🔐 Encryption: MAXIMUM SECURITY
📡 Traffic routing: RANDOMIZED
🤖 Agent coordination: SILENT MODE
🕰️ Duration: Until manually disabled

Operating in ghost mode...`;
          responseType = 'system';
          break;

        case cmd === 'treatments':
          response = `AVAILABLE A.I.D.S. TREATMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💊 AZT Identity Stabilizer - ₿0.5 (85% effective)
🧠 Peptide-T Personality Code - ₿0.2 (62% effective)  
💾 DDC Memory Restoration - ₿0.3 (91% effective)
🔬 Interferon Identity Suite - ₿0.8 (23% effective)

🤖 AGENT RECOMMENDATIONS:
• Most reliable: DDC Memory Restoration
• Most affordable: Peptide-T Personality Code
• Emergency option: AZT Identity Stabilizer

Use 'purchase <treatment>' or 'group-buy <treatment>'`;
          responseType = 'agent';
          break;

        default:
          response = `Unknown command: '${command}'
Type 'help' for available commands.

🤖 AGENT SUGGESTION: Did you mean one of these?
${agentSuggestions.slice(0, 3).map(s => `• ${s}`).join('\n')}`;
          responseType = 'output';
      }
    } catch (error) {
      response = `ERROR: ${error.message}

🤖 AGENT ALERT: Command execution failed. 
Network coordination may be temporarily unavailable.`;
      responseType = 'system';
      setNotification({
        message: `Command failed: ${error.message}`,
        type: 'error'
      });
    }

    // Add response with typing animation
    setTimeout(() => {
      addToHistory(response, responseType);
      setIsTyping(false);
    }, 500);
  };

  const addToHistory = (text: string, type: 'input' | 'output' | 'agent' | 'system') => {
    setHistory(prev => [...prev, { text, type }]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    await processCommand(input.trim());
    setInput("");
    setShowSuggestions(false);
  };

  const getLineStyle = (type: string) => {
    switch (type) {
      case 'input': return 'text-yellow-400 font-bold';
      case 'agent': return 'text-blue-400';
      case 'system': return 'text-red-400 font-bold';
      default: return 'text-green-400';
    }
  };

  return (
    <div class="bg-black text-green-400 border-2 border-green-600 rounded font-mono text-sm relative">
      {/* Terminal Header */}
      <div class="bg-green-800 text-black px-4 py-2 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span class="ml-2 font-bold">SECURE TERMINAL</span>
        </div>
        <div class="text-xs">
          🤖 MCP AGENTS: {isCoordinating ? 'COORDINATING' : 'STANDBY'}
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        class="p-4 h-96 overflow-y-auto space-y-1"
      >
        {history.map((line, i) => (
          <div key={i} class={`${getLineStyle(line.type)} whitespace-pre-wrap animate-matrixReveal`}>
            {line.type === 'agent' || line.type === 'system' ? (
              <DelightfulTypingText text={line.text} speed={20} />
            ) : (
              line.text
            )}
          </div>
        ))}
        
        {isTyping && (
          <div class="text-blue-400 animate-pulse">
            🤖 Agents processing command<span class="loading-dots"></span>
          </div>
        )}
      </div>

      {/* Command Input */}
      <form onSubmit={handleSubmit} class="border-t border-green-600 p-4">
        <div class="flex items-center gap-2">
          <span class="text-green-400">></span>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput((e.target as HTMLInputElement).value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            class="flex-1 bg-transparent text-green-400 outline-none"
            placeholder="Enter command..."
            disabled={isTyping}
            autoFocus
          />
          <DelightfulActionButton
            onClick={() => {}} // Form handles submit
            isLoading={isTyping}
            variant="primary"
            icon="⚡"
          >
            EXEC
          </DelightfulActionButton>
        </div>

        {/* Agent Suggestions */}
        {showSuggestions && agentSuggestions.length > 0 && input.length > 0 && (
          <div class="absolute bottom-full mb-2 left-4 right-4 bg-black border border-green-600 rounded shadow-lg max-h-48 overflow-y-auto animate-slideUp">
            <div class="p-2 text-xs text-blue-400 border-b border-green-600">
              🤖 AGENT SUGGESTIONS:
            </div>
            {agentSuggestions
              .filter(suggestion => suggestion.toLowerCase().includes(input.toLowerCase()))
              .slice(0, 8)
              .map((suggestion, i) => (
                <div 
                  key={i}
                  class="px-4 py-2 hover:bg-green-900/20 cursor-pointer text-green-300 hover:text-white transition-colors"
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

      {/* Notifications */}
      {notification && (
        <DelightfulNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default EnhancedBlackMarketTerminal;