// Enhanced Black Market Terminal - IMMERSIVE CINEMATIC EXPERIENCE
// With REAL blockchain commands that actually work

import { useState, useEffect, useRef } from "preact/hooks";
import { useWallet } from "../context/WalletContext";
import { useMembership } from "../hooks/useMembership";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SOLANA_CONFIG } from "../config/solana";

// Terminal line type
type LineType = 'input' | 'output' | 'agent' | 'system' | 'error' | 'success' | 'warning';

interface TerminalLine {
  text: string;
  type: LineType;
  delay?: number;
}

// Command result type
interface CommandResult {
  lines: TerminalLine[];
  success: boolean;
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
  
  // Real wallet and blockchain data
  const { publicKey, connected, connection, dbcBalance } = useWallet();
  const { membership, hasMembership, tier } = useMembership();

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
      "balance",
      "membership",
      "wallet",
      "network",
    ];
    
    if (isAuthenticated) {
      baseSuggestions.push("treatments", "purchase", "stake", "unstake", "rewards");
    }
    
    if (connected) {
      baseSuggestions.push("disconnect");
    }
    
    setAgentSuggestions(baseSuggestions);
  }, [isAuthenticated, connected]);

  const addToHistory = (text: string, type: LineType) => {
    setHistory(prev => [...prev, { text, type }]);
  };

  const typeLines = async (lines: TerminalLine[]) => {
    setIsTyping(true);
    for (const line of lines) {
      await new Promise(r => setTimeout(r, line.delay || 20));
      addToHistory(line.text, line.type);
    }
    setIsTyping(false);
  };

  // REAL COMMAND: Get wallet balance
  const getWalletBalance = async (): Promise<CommandResult> => {
    if (!publicKey || !connection) {
      return {
        lines: [
          { text: "", type: 'system' },
          { text: "⚠️  NO WALLET CONNECTED", type: 'error' },
          { text: "", type: 'system' },
          { text: "Connect your wallet to view balance.", type: 'output' },
          { text: "Use the 'Connect' button in the header.", type: 'output' },
          { text: "", type: 'output' },
        ],
        success: false
      };
    }

    try {
      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solAmount = solBalance / LAMPORTS_PER_SOL;

      // Get DBC balance
      const dbcMint = new PublicKey(SOLANA_CONFIG.blockchain.dbcMintAddress);
      const tokenAccount = await getAssociatedTokenAddress(dbcMint, publicKey);
      
      let dbcAmount = 0;
      try {
        const account = await getAccount(connection, tokenAccount);
        dbcAmount = Number(account.amount) / 1_000_000; // DBC has 6 decimals
      } catch {
        // Token account doesn't exist
        dbcAmount = 0;
      }

      return {
        lines: [
          { text: "", type: 'system' },
          { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
          { text: "║                    WALLET BALANCE                            ║", type: 'system' },
          { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
          { text: "", type: 'system' },
          { text: `💰 SOL Balance:    ${solAmount.toFixed(4)} SOL`, type: 'output' },
          { text: `🪙 DBC Balance:    ${dbcAmount.toLocaleString()} DBC`, type: 'output' },
          { text: "", type: 'system' },
          { text: `📍 Wallet: ${publicKey.toString().slice(0, 20)}...`, type: 'agent' },
          { text: "", type: 'output' },
        ],
        success: true
      };
    } catch (error: any) {
      return {
        lines: [
          { text: "", type: 'system' },
          { text: `❌ Error fetching balance: ${error.message}`, type: 'error' },
          { text: "", type: 'output' },
        ],
        success: false
      };
    }
  };

  // REAL COMMAND: Get membership status
  const getMembershipStatus = async (): Promise<CommandResult> => {
    if (!publicKey) {
      return {
        lines: [
          { text: "", type: 'system' },
          { text: "⚠️  NO WALLET CONNECTED", type: 'error' },
          { text: "", type: 'output' },
        ],
        success: false
      };
    }

    if (!hasMembership) {
      return {
        lines: [
          { text: "", type: 'system' },
          { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
          { text: "║                  MEMBERSHIP STATUS                           ║", type: 'system' },
          { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
          { text: "", type: 'system' },
          { text: "❌ NO ACTIVE MEMBERSHIP", type: 'error' },
          { text: "", type: 'system' },
          { text: "Join the club to access:", type: 'output' },
          { text: "  • Token-gated features", type: 'output' },
          { text: "  • Community rewards", type: 'output' },
          { text: "  • Priority support", type: 'output' },
          { text: "", type: 'system' },
          { text: "Visit the Membership page to join.", type: 'agent' },
          { text: "", type: 'output' },
        ],
        success: false
      };
    }

    return {
      lines: [
        { text: "", type: 'system' },
        { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
        { text: "║                  MEMBERSHIP STATUS                           ║", type: 'system' },
        { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
        { text: "", type: 'system' },
        { text: `✅ ACTIVE MEMBERSHIP`, type: 'success' },
        { text: "", type: 'system' },
        { text: `🏆 Tier: ${tier?.toUpperCase() || 'UNKNOWN'}`, type: 'output' },
        { text: `👤 Member: ${membership?.nickname || 'Anonymous'}`, type: 'output' },
        { text: `🎯 Focus: ${membership?.healthFocus || 'General'}`, type: 'output' },
        { text: `📅 Expires: ${membership?.expiresAt ? new Date(membership.expiresAt).toLocaleDateString() : 'Unknown'}`, type: 'output' },
        { text: "", type: 'system' },
        { text: "🎁 Benefits Active:", type: 'agent' },
        { text: "  • Token-gated access", type: 'output' },
        { text: "  • Community rewards", type: 'output' },
        { text: "  • Priority support", type: 'output' },
        { text: "", type: 'output' },
      ],
      success: true
    };
  };

  // REAL COMMAND: Get network status
  const getNetworkStatus = async (): Promise<CommandResult> => {
    const network = SOLANA_CONFIG.network;
    const rpcUrl = SOLANA_CONFIG.rpcEndpoint[network];
    
    let slot = 0;
    let blockTime = 0;
    
    if (connection) {
      try {
        slot = await connection.getSlot();
        blockTime = await connection.getBlockTime(slot) || 0;
      } catch {
        // Use defaults
      }
    }

    return {
      lines: [
        { text: "", type: 'system' },
        { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
        { text: "║                 NETWORK STATUS                               ║", type: 'system' },
        { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
        { text: "", type: 'system' },
        { text: `🌐 Network: ${network.toUpperCase()}`, type: 'output' },
        { text: `🔗 RPC: ${rpcUrl.replace('https://', '')}`, type: 'agent' },
        { text: "", type: 'system' },
        { text: `📦 Current Slot: ${slot.toLocaleString()}`, type: 'output' },
        { text: `⏰ Block Time: ${blockTime ? new Date(blockTime * 1000).toLocaleString() : 'N/A'}`, type: 'output' },
        { text: "", type: 'system' },
        { text: "🔒 Connection Status:", type: 'agent' },
        { text: `  Wallet: ${connected ? '✅ CONNECTED' : '❌ DISCONNECTED'}`, type: connected ? 'success' : 'error' },
        { text: `  RPC: ${connection ? '✅ ONLINE' : '❌ OFFLINE'}`, type: connection ? 'success' : 'error' },
        { text: "", type: 'output' },
      ],
      success: true
    };
  };

  const authenticateUser = async () => {
    const authSequence: TerminalLine[] = [
      { text: "", type: 'system' },
      { text: "⚠️  ACCESS DENIED  ⚠️", type: 'error', delay: 200 },
      { text: "DALLAS BUYERS CLUB NETWORK", type: 'warning', delay: 100 },
      { text: "Unauthorized Access Prohibited", type: 'warning', delay: 100 },
      { text: "", type: 'system', delay: 300 },
      { text: "[AGENT] Initiating authentication protocol...", type: 'agent', delay: 400 },
    ];

    if (!connected) {
      authSequence.push(
        { text: "[AGENT] No wallet detected...", type: 'agent', delay: 300 },
        { text: "", type: 'system', delay: 200 },
        { text: "⚠️  AUTHENTICATION FAILED", type: 'error', delay: 200 },
        { text: "", type: 'system' },
        { text: "Please connect your wallet first.", type: 'warning', delay: 100 },
        { text: "Use the 'wallet' command to check status.", type: 'output', delay: 100 },
        { text: "", type: 'output' }
      );
    } else {
      authSequence.push(
        { text: "[AGENT] Verifying wallet signature...", type: 'agent', delay: 300 },
        { text: "[AGENT] Scanning biometric hashes...", type: 'agent', delay: 300 },
        { text: "", type: 'system', delay: 200 },
        { text: "✅ AUTHENTICATED", type: 'success', delay: 200 },
        { text: "", type: 'system', delay: 100 },
        { text: "Welcome to the inner circle, fighter.", type: 'success', delay: 150 },
        { text: `Identity: ${publicKey?.toString().slice(0, 16)}...`, type: 'agent', delay: 100 },
        { text: "[ Debug Mode Active ]", type: 'warning', delay: 100 },
        { text: "", type: 'system' },
        { text: "Type 'help' to see available commands...", type: 'output' },
        { text: "", type: 'output' }
      );
      setIsAuthenticated(true);
    }
    
    await typeLines(authSequence);
  };

  const showHelp = async () => {
    const helpText: TerminalLine[] = [
      { text: "", type: 'system' },
      { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
      { text: "║           DALLAS UNDERGROUND - COMMAND REFERENCE             ║", type: 'system' },
      { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
      { text: "", type: 'system' },
      { text: "AUTHENTICATION:", type: 'warning' },
      { text: "  gm              - Greet the system / Authenticate", type: 'output' },
      { text: "", type: 'system' },
      { text: "WALLET & BALANCE:", type: 'warning' },
      { text: "  wallet          - Check wallet connection status", type: 'output' },
      { text: "  balance         - Show SOL and DBC balance", type: 'output' },
      { text: "  membership      - Check membership status", type: 'output' },
      { text: "", type: 'system' },
      { text: "NETWORK:", type: 'warning' },
      { text: "  network         - Show network status and RPC info", type: 'output' },
      { text: "", type: 'system' },
      { text: "🤖 All commands connected to live blockchain data.", type: 'agent' },
      { text: "", type: 'output' },
    ];
    
    await typeLines(helpText);
  };

  const processCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    // Add input to history
    addToHistory(`> ${command}`, 'input');
    
    // Special commands
    if (cmd === 'gm') {
      await authenticateUser();
      return;
    }
    
    if (cmd === 'help') {
      await showHelp();
      return;
    }

    // REAL WORKING COMMANDS
    if (cmd === 'balance') {
      const result = await getWalletBalance();
      await typeLines(result.lines);
      return;
    }

    if (cmd === 'membership') {
      const result = await getMembershipStatus();
      await typeLines(result.lines);
      return;
    }

    if (cmd === 'network') {
      const result = await getNetworkStatus();
      await typeLines(result.lines);
      return;
    }

    if (cmd === 'wallet') {
      await typeLines([
        { text: "", type: 'system' },
        { text: "╔══════════════════════════════════════════════════════════════╗", type: 'system' },
        { text: "║                  WALLET STATUS                               ║", type: 'system' },
        { text: "╚══════════════════════════════════════════════════════════════╝", type: 'system' },
        { text: "", type: 'system' },
        { text: `Status: ${connected ? '✅ CONNECTED' : '❌ DISCONNECTED'}`, type: connected ? 'success' : 'error' },
        { text: "", type: 'system' },
        ...(connected && publicKey ? [
          { text: `Address: ${publicKey.toString()}`, type: 'agent' },
          { text: "", type: 'system' },
          { text: "Use 'balance' to check your token balances.", type: 'output' },
        ] : [
          { text: "Connect your wallet using the button in the header.", type: 'output' },
        ]),
        { text: "", type: 'output' },
      ]);
      return;
    }
    
    // Unknown command
    await typeLines([
      { text: "", type: 'system' },
      { text: `Unknown command: '${command}'`, type: 'error' },
      { text: "Type 'help' for available commands.", type: 'output' },
      { text: "", type: 'output' },
    ]);
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
          <span class={connected ? "text-green-300" : "text-red-300"}>
            {connected ? "🔓 CONNECTED" : "🔒 OFFLINE"}
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
              🤖 AVAILABLE COMMANDS:
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
          {connected ? `🔗 ${publicKey?.toString().slice(0, 16)}...` : '🔗 Wallet Disconnected'}
        </span>
        <span class={dbcBalance > 0 ? "text-green-400" : "text-green-600"}>
          {dbcBalance > 0 ? `🪙 ${dbcBalance.toLocaleString()} DBC` : 'No DBC Balance'}
        </span>
      </div>
    </div>
  );
}

export default EnhancedBlackMarketTerminal;
