// Enhanced UI System - ENHANCEMENT FIRST with delightful micro-interactions
// Following Core Principles: DRY, MODULAR, PERFORMANT

import { useState, useEffect, useRef } from "preact/hooks";

// ENHANCED: Typing animation for terminal-style delight
export function DelightfulTypingText({ 
  text, 
  speed = 50, 
  onComplete 
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (text === displayedText) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, text, speed]);

  return (
    <span class="font-mono">
      {displayedText}
      {!isComplete && <span class="animate-pulse text-green-400">█</span>}
    </span>
  );
}

// ENHANCED: Pulsing agent status with delight
export function AgentStatusIndicator({ 
  status, 
  agentType,
  activity = "Monitoring network..." 
}: {
  status: 'ACTIVE' | 'MONITORING' | 'COORDINATING' | 'PROCESSING';
  agentType: string;
  activity?: string;
}) {
  const [showActivity, setShowActivity] = useState(false);
  
  const getStatusColor = () => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'MONITORING': return 'bg-blue-500';
      case 'COORDINATING': return 'bg-yellow-500';
      case 'PROCESSING': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusAnimation = () => {
    switch (status) {
      case 'COORDINATING': return 'animate-bounce';
      case 'PROCESSING': return 'animate-spin';
      case 'ACTIVE': return 'animate-pulse';
      default: return '';
    }
  };

  return (
    <div 
      class="flex items-center gap-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded transition-all"
      onClick={() => setShowActivity(!showActivity)}
    >
      <div class={`w-3 h-3 rounded-full ${getStatusColor()} ${getStatusAnimation()}`}></div>
      <span class="text-sm font-medium capitalize">{agentType}</span>
      <span class="text-xs text-gray-400">({status})</span>
      
      {showActivity && (
        <div class="absolute bg-black border border-green-400 p-2 rounded shadow-lg mt-8 z-10 animate-slideIn">
          <DelightfulTypingText text={activity} speed={30} />
        </div>
      )}
    </div>
  );
}

// ENHANCED: Cyberpunk danger meter with neon effects and visual delight
export function InteractiveDangerMeter({ 
  level, 
  onLevelChange 
}: {
  level: number;
  onLevelChange?: (newLevel: number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const [glitchEffect, setGlitchEffect] = useState(false);

  useEffect(() => {
    // Dynamic pulse and glitch based on danger level
    const intensity = level > 80 ? 3 : level > 60 ? 2 : level > 40 ? 1.5 : 1;
    setPulseIntensity(intensity);
    
    // Trigger glitch effect for high danger
    if (level > 80) {
      const glitchInterval = setInterval(() => {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 100);
      }, 2000);
      return () => clearInterval(glitchInterval);
    }
  }, [level]);

  const getDangerColor = () => {
    if (level < 30) return 'from-green-600 to-green-400';
    if (level < 60) return 'from-yellow-600 to-yellow-400';
    if (level < 80) return 'from-orange-600 to-orange-400';
    return 'from-red-600 to-red-400';
  };

  const getDangerLabel = () => {
    if (level < 30) return { text: 'SECURE', icon: '🛡️' };
    if (level < 60) return { text: 'CAUTION', icon: '⚠️' };
    if (level < 80) return { text: 'DANGER', icon: '🚨' };
    return { text: 'CRITICAL', icon: '💀' };
  };

  const dangerInfo = getDangerLabel();

  return (
    <div 
      class={`relative group transition-all duration-300 ${
        glitchEffect ? 'animate-pulse' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ENHANCED: Cyberpunk container with neon border */}
      <div class={`bg-black border-2 rounded-lg p-4 transition-all duration-500 ${
        level > 80 ? 'border-red-500 shadow-lg shadow-red-500/25' :
        level > 60 ? 'border-orange-500 shadow-lg shadow-orange-500/25' :
        level > 30 ? 'border-yellow-500 shadow-lg shadow-yellow-500/25' :
        'border-green-500 shadow-lg shadow-green-500/25'
      }`}>
        
        {/* ENHANCED: Danger Level Display with cyberpunk styling */}
        <div class="flex items-center gap-3 mb-4">
          <div class="relative">
            <span 
              class="text-3xl transition-all duration-300" 
              style={`
                animation: ${level > 80 ? 'pulse' : 'none'} ${2/pulseIntensity}s infinite;
                filter: ${glitchEffect ? 'hue-rotate(180deg)' : 'none'};
                text-shadow: 0 0 10px ${getDangerColor().includes('red') ? '#ff0000' : 
                           getDangerColor().includes('orange') ? '#ff8800' :
                           getDangerColor().includes('yellow') ? '#ffff00' : '#00ff00'};
              `}
            >
              {dangerInfo.icon}
            </span>
            {level > 80 && (
              <div class="absolute inset-0 text-3xl animate-ping opacity-50">
                {dangerInfo.icon}
              </div>
            )}
          </div>
          
          <div class="flex-1">
            <div class="flex justify-between items-center mb-2">
              <span class={`font-bold text-lg transition-all duration-300 ${
                glitchEffect ? 'animate-pulse' : ''
              }`} style={`
                color: ${getDangerColor().includes('red') ? '#ff4444' : 
                        getDangerColor().includes('orange') ? '#ff8844' :
                        getDangerColor().includes('yellow') ? '#ffff44' : '#44ff44'};
                text-shadow: 0 0 10px currentColor;
              `}>
                {dangerInfo.text}
              </span>
              <span class="text-white font-mono text-lg bg-black/50 px-2 py-1 rounded border border-cyan-400">
                {level}%
              </span>
            </div>
            
            {/* ENHANCED: Cyberpunk Progress Bar */}
            <div class="relative bg-gray-900 h-6 border-2 border-cyan-400 rounded overflow-hidden">
              <div 
                class={`h-full bg-gradient-to-r ${getDangerColor()} transition-all duration-1000 ease-out relative overflow-hidden`}
                style={`width: ${level}%`}
              >
                {/* ENHANCED: Multiple visual effects */}
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* High danger effects */}
                {level > 70 && (
                  <>
                    <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                    <div class="absolute right-0 top-0 w-2 h-full bg-white animate-ping"></div>
                  </>
                )}
                
                {/* Critical danger glitch effect */}
                {level > 90 && glitchEffect && (
                  <div class="absolute inset-0 bg-white animate-pulse opacity-80"></div>
                )}
              </div>
              
              {/* Progress bar scan line */}
              <div 
                class="absolute top-0 w-1 h-full bg-white opacity-60 animate-pulse"
                style={`left: ${level}%; margin-left: -2px;`}
              ></div>
            </div>
            
            {/* ENHANCED: Status indicators */}
            <div class="flex justify-between items-center mt-2 text-xs">
              <div class="flex gap-2">
                <div class={`px-2 py-1 rounded border ${
                  level > 80 ? 'border-red-400 text-red-400 bg-red-900/20' :
                  level > 60 ? 'border-orange-400 text-orange-400 bg-orange-900/20' :
                  level > 30 ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20' :
                  'border-green-400 text-green-400 bg-green-900/20'
                }`}>
                  {level > 80 ? 'LOCKDOWN' : level > 60 ? 'HIGH ALERT' : level > 30 ? 'MONITORING' : 'SECURE'}
                </div>
                {isCoordinating && (
                  <div class="px-2 py-1 rounded border border-cyan-400 text-cyan-400 bg-cyan-900/20 animate-pulse">
                    AGENTS ACTIVE
                  </div>
                )}
              </div>
              <div class="text-gray-400 font-mono">
                LIVE SCAN
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced hover tooltip */}
      {isHovered && (
        <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black border border-green-400 p-3 rounded shadow-xl z-20 animate-slideUp min-w-64">
          <div class="text-xs space-y-1">
            <div class="text-green-400 font-bold">THREAT ANALYSIS</div>
            <div class="text-gray-300">
              Corporate AI surveillance: {Math.floor(level * 0.7)}%
            </div>
            <div class="text-gray-300">
              Network exposure: {Math.floor(level * 0.5)}%
            </div>
            <div class="text-gray-300">
              Supply chain risk: {Math.floor(level * 0.3)}%
            </div>
            {level > 80 && (
              <div class="text-red-400 font-bold animate-pulse">
                ⚠️ IMMEDIATE ACTION REQUIRED
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ENHANCED: Vibrant agent coordination visualization with 80s cyberpunk aesthetic
export function AgentCoordinationVisualizer({ 
  agents, 
  activeCoordination = null,
  workflowTasks = []
}: {
  agents: any;
  activeCoordination?: string | null;
  workflowTasks?: Array<{id: string, status: 'pending' | 'running' | 'completed', agent: string}>;
}) {
  const [connectionLines, setConnectionLines] = useState<any[]>([]);
  const [taskSequence, setTaskSequence] = useState(0);
  
  // ENHANCED: Cyberpunk-style positioning with neon glow effects
  const agentPositions = {
    supply: { x: 20, y: 20, color: '#00ff41', name: 'SUPPLY', icon: '🔧' },
    risk: { x: 80, y: 20, color: '#ff0080', name: 'SECURITY', icon: '🛡️' },
    community: { x: 20, y: 80, color: '#0080ff', name: 'NETWORK', icon: '👥' },
    identity: { x: 80, y: 80, color: '#ffff00', name: 'IDENTITY', icon: '🧠' }
  };

  // Generate connection animations during coordination
  useEffect(() => {
    if (activeCoordination) {
      const connections = Object.keys(agentPositions).map((agent, index) => ({
        id: `${agent}-${index}`,
        delay: index * 200,
        from: agentPositions[agent as keyof typeof agentPositions],
        to: { x: 50, y: 50 } // Center
      }));
      setConnectionLines(connections);
      
      // Clear after animation
      const timer = setTimeout(() => setConnectionLines([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeCoordination]);

  // ENHANCED: Workflow task sequence animation
  useEffect(() => {
    if (workflowTasks.length > 0) {
      const interval = setInterval(() => {
        setTaskSequence(prev => (prev + 1) % workflowTasks.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [workflowTasks]);

  return (
    <div class="relative w-full h-80 bg-black border-2 border-cyan-400 rounded-lg overflow-hidden shadow-2xl shadow-cyan-400/25">
      {/* ENHANCED: Cyberpunk grid with animated scan lines */}
      <div class="absolute inset-0">
        <svg width="100%" height="100%" class="opacity-30">
          <defs>
            <pattern id="cyber-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00ffff" stroke-width="0.5"/>
            </pattern>
            <linearGradient id="scan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#00ffff;stop-opacity:0"/>
              <stop offset="50%" style="stop-color:#00ffff;stop-opacity:0.8"/>
              <stop offset="100%" style="stop-color:#00ffff;stop-opacity:0"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#cyber-grid)" />
          <rect width="100%" height="2" fill="url(#scan-gradient)" class="animate-pulse">
            <animateTransform 
              attributeName="transform" 
              type="translate" 
              values="0,-10;0,320;0,-10" 
              dur="4s" 
              repeatCount="indefinite"
            />
          </rect>
        </svg>
      </div>
      
      {/* ENHANCED: Workflow task progress visualization */}
      {workflowTasks.length > 0 && (
        <div class="absolute top-2 left-2 right-2 bg-black/80 rounded p-2 border border-cyan-400/50">
          <div class="text-xs text-cyan-400 mb-1">EDENLAYER TASK SEQUENCE:</div>
          <div class="flex gap-1">
            {workflowTasks.map((task, i) => (
              <div 
                key={i} 
                class={`flex-1 h-2 rounded transition-all duration-500 ${
                  i <= taskSequence ? 'bg-gradient-to-r from-cyan-400 to-green-400' : 'bg-gray-700'
                }`}
                title={`Task ${i + 1}: ${task.agent} ${task.status}`}
              >
                {i === taskSequence && task.status === 'running' && (
                  <div class="w-full h-full bg-white rounded animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENHANCED: Cyberpunk agent nodes with neon glow effects */}
      {Object.entries(agentPositions).map(([agentType, position]) => {
        const agentData = agents[agentType];
        const isActive = agentData?.status === 'ACTIVE' || agentData?.status === 'COORDINATING';
        const isCurrentTask = workflowTasks.length > 0 && 
          workflowTasks[taskSequence]?.agent.toLowerCase().includes(agentType);
        
        return (
          <div 
            key={agentType}
            class={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
              isCurrentTask ? 'scale-110 z-20' : 'z-10'
            }`}
            style={`left: ${position.x}%; top: ${position.y}%`}
          >
            {/* ENHANCED: Neon glow effect */}
            <div 
              class={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${
                isActive ? 'opacity-60' : 'opacity-20'
              }`}
              style={`background-color: ${position.color}; width: 60px; height: 60px; margin: -6px;`}
            ></div>
            
            {/* ENHANCED: Agent node with cyberpunk styling */}
            <div 
              class={`relative w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center text-xs transition-all duration-500 ${
                isActive 
                  ? 'bg-black text-white shadow-lg' 
                  : 'bg-gray-800 border-gray-600 text-gray-400'
              } ${isCurrentTask ? 'animate-pulse border-white' : ''}`}
              style={`border-color: ${isActive ? position.color : '#4b5563'}`}
            >
              <div class="text-lg leading-none">{position.icon}</div>
              <div class="text-[8px] font-bold leading-none mt-0.5" style={`color: ${position.color}`}>
                {position.name}
              </div>
            </div>
            
            {/* ENHANCED: Agent status with cyberpunk styling */}
            <div class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
              <div 
                class="text-xs font-bold px-2 py-1 rounded border bg-black/80"
                style={`color: ${position.color}; border-color: ${position.color}`}
              >
                {agentData?.status || 'OFFLINE'}
              </div>
              {isCurrentTask && (
                <div class="text-xs text-white mt-1 animate-bounce">
                  ⚡ PROCESSING
                </div>
              )}
            </div>
            
            {/* ENHANCED: Active pulse with agent color */}
            {isActive && (
              <div 
                class="absolute inset-0 rounded-full border-2 animate-ping opacity-50"
                style={`border-color: ${position.color}`}
              ></div>
            )}
            
            {/* ENHANCED: Current task highlight */}
            {isCurrentTask && (
              <div 
                class="absolute inset-0 rounded-full border-2 animate-pulse"
                style={`border-color: white; box-shadow: 0 0 20px ${position.color}`}
              ></div>
            )}
          </div>
        );
      })}

      {/* Coordination lines */}
      {connectionLines.length > 0 && (
        <svg class="absolute inset-0 pointer-events-none" width="100%" height="100%">
          {connectionLines.map((line) => (
            <line
              key={line.id}
              x1={`${line.from.x}%`}
              y1={`${line.from.y}%`}
              x2={`${line.to.x}%`}
              y2={`${line.to.y}%`}
              stroke="#10b981"
              stroke-width="2"
              stroke-dasharray="5,5"
              class="animate-dash"
              style={`animation-delay: ${line.delay}ms`}
            />
          ))}
        </svg>
      )}

      {/* Central coordination indicator */}
      {activeCoordination && (
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div class="w-8 h-8 bg-yellow-500 rounded-full animate-spin border-2 border-yellow-300">
            <div class="w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-pulse"></div>
          </div>
          <div class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 whitespace-nowrap font-bold">
            COORDINATING
          </div>
        </div>
      )}
    </div>
  );
}

// ENHANCED: Smooth slide-in notifications
export function DelightfulNotification({ 
  message, 
  type = 'info', 
  onClose,
  autoClose = 5000 
}: {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  autoClose?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for slide-out animation
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success': return 'bg-green-800 border-green-400 text-green-100';
      case 'warning': return 'bg-yellow-800 border-yellow-400 text-yellow-100';
      case 'error': return 'bg-red-800 border-red-400 text-red-100';
      default: return 'bg-blue-800 border-blue-400 text-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div class={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
    }`}>
      <div class={`${getTypeStyles()} border-2 rounded-lg p-4 shadow-lg min-w-80 max-w-96`}>
        <div class="flex items-center gap-3">
          <span class="text-lg">{getIcon()}</span>
          <div class="flex-1">
            <DelightfulTypingText text={message} speed={20} />
          </div>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            class="text-gray-300 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ENHANCED: Interactive button with loading states
export function DelightfulActionButton({ 
  children, 
  onClick, 
  isLoading = false,
  variant = 'primary',
  disabled = false,
  icon = null
}: {
  children: any;
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  icon?: string | null;
}) {
  const [isPressed, setIsPressed] = useState(false);
  
  const getVariantStyles = () => {
    if (disabled || isLoading) {
      return 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed';
    }
    
    switch (variant) {
      case 'primary': 
        return 'bg-green-600 border-green-400 text-white hover:bg-green-500 hover:shadow-lg hover:shadow-green-400/25';
      case 'secondary': 
        return 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-400/25';
      case 'danger': 
        return 'bg-red-600 border-red-400 text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-400/25';
      default: 
        return 'bg-gray-600 border-gray-400 text-white hover:bg-gray-500';
    }
  };

  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    await onClick();
  };

  return (
    <button 
      onClick={handleClick}
      disabled={disabled || isLoading}
      class={`
        px-6 py-3 border-2 rounded font-bold text-sm transition-all duration-200 
        transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400/50
        ${getVariantStyles()}
        ${isPressed ? 'scale-95' : ''}
      `}
    >
      <div class="flex items-center gap-2 justify-center">
        {isLoading ? (
          <>
            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            {icon && <span>{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </div>
    </button>
  );
}