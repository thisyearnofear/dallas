// MCP Agent Dashboard - Real-time agent coordination visualization
// Following Core Principles: MODULAR, CLEAN, PERFORMANT

import { useState, useEffect } from "preact/hooks";
import { useAgentNetwork } from "../hooks/useAgentNetwork";
import { Modal } from "./SharedUIComponents";
import { 
  DelightfulTypingText, 
  AgentStatusIndicator, 
  InteractiveDangerMeter, 
  AgentCoordinationVisualizer,
  DelightfulNotification,
  DelightfulActionButton 
} from "./EnhancedUISystem";

// CLEAN: MCP coordination interface
interface MCPCoordinationDemo {
  id: string;
  title: string;
  description: string;
  action: () => Promise<any>;
  icon: string;
}

export function MCPAgentDashboard() {
  const {
    agents,
    currentDangerLevel,
    networkActivity,
    isCoordinating,
    assessThreatLevel,
    coordinateGroupPurchase,
    processIdentityRestoration,
    handleEmergencyResponse
  } = useAgentNetwork();

  const [selectedDemo, setSelectedDemo] = useState<MCPCoordinationDemo | null>(null);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'info'|'success'|'warning'|'error'} | null>(null);
  const [showCoordinationDetails, setShowCoordinationDetails] = useState(false);

  // MODULAR: MCP coordination demonstrations
  const mcpDemos: MCPCoordinationDemo[] = [
    {
      id: 'emergency_raid',
      title: 'Emergency: Corporate AI Raid',
      description: 'Simulate Corporate AI Security raid - watch all agents coordinate emergency response via MCP',
      icon: '🚨',
      action: () => handleEmergencyResponse('corporate_raid')
    },
    {
      id: 'group_purchase',
      title: 'Group Purchase Coordination',
      description: 'Coordinate multi-member purchase of A.I.D.S. treatments with MCP orchestration',
      icon: '👥',
      action: () => coordinateGroupPurchase(['azt_patch', 'peptide_code', 'ddc_algorithm'])
    },
    {
      id: 'identity_restoration',
      title: 'Identity Restoration Planning',
      description: 'Multi-agent coordination for complex identity fragmentation restoration',
      icon: '🧠',
      action: () => processIdentityRestoration('patient_007', 'interferon_suite')
    },
    {
      id: 'threat_assessment',
      title: 'Network Threat Assessment',
      description: 'Comprehensive threat analysis using MCP-coordinated agent network',
      icon: '🛡️',
      action: () => assessThreatLevel()
    }
  ];

  // ENHANCED: Run MCP demonstration with delightful feedback
  const runMCPDemo = async (demo: MCPCoordinationDemo) => {
    setSelectedDemo(demo);
    setIsRunningDemo(true);
    setDemoResult(null);
    
    // Show starting notification
    setNotification({ 
      message: `🤖 Initiating ${demo.title}...`, 
      type: 'info' 
    });

    try {
      const result = await demo.action();
      setDemoResult(result);
      
      // Success notification
      setNotification({ 
        message: `✅ ${demo.title} completed successfully!`, 
        type: 'success' 
      });
    } catch (error) {
      setDemoResult({ error: error.message });
      
      // Error notification
      setNotification({ 
        message: `❌ ${demo.title} failed: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsRunningDemo(false);
    }
  };

  return (
    <div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-green-400 p-6 font-mono border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg transition-colors">
      {/* Header */}
      <div class="mb-6">
        <h2 class="text-2xl font-bold mb-2 text-yellow-600 dark:text-yellow-400">🤖 MCP AGENT COORDINATION CENTER</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Model Context Protocol Integration - Dallas Underground Network
        </p>
      </div>

      {/* Enhanced Agent Status Grid */}
      <div class="grid md:grid-cols-4 gap-4 mb-6">
        {Object.entries(agents).map(([agentType, agentData], index) => (
          <div 
            key={agentType} 
            class="bg-slate-50 dark:bg-black p-4 border border-green-200 dark:border-green-600 hover-lift click-scale cursor-pointer animate-slideIn rounded-lg transition-colors"
            style={`animation-delay: ${index * 0.1}s`}
            onClick={() => setShowCoordinationDetails(!showCoordinationDetails)}
          >
            <AgentStatusIndicator 
              status={agentData.status as any}
              agentType={agentType}
              activity={`Processing ${agentType} operations...`}
            />
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">{agentData.role}</p>
            
            {/* Enhanced MCP Status with glow effect */}
            <div class="mt-3 flex items-center justify-between">
              <div class="text-xs">
                <span class="text-blue-600 dark:text-blue-400">🔗 MCP:</span>
                <span class="text-green-600 dark:text-green-400 font-bold animate-glow ml-1">LINKED</span>
              </div>
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Network Status */}
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        {/* Threat Level */}
        <div class="bg-slate-50 dark:bg-black p-4 border border-red-200 dark:border-red-600 rounded-lg transition-colors">
          <h3 class="font-bold mb-3 text-red-600 dark:text-red-400">🛡️ CURRENT THREAT LEVEL</h3>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-slate-700 dark:text-white text-sm w-16 font-bold">
              {currentDangerLevel < 30 ? 'SAFE' : 
               currentDangerLevel < 60 ? 'CAUTION' : 
               currentDangerLevel < 80 ? 'DANGER' : 'CRITICAL'}
            </span>
            <div class="flex-1 bg-slate-200 dark:bg-slate-700 h-4 border border-slate-300 dark:border-slate-500 rounded-full overflow-hidden">
              <div 
                class={`h-full transition-all duration-500 ${
                  currentDangerLevel < 30 ? 'bg-green-600' :
                  currentDangerLevel < 60 ? 'bg-yellow-600' : 
                  currentDangerLevel < 80 ? 'bg-orange-600' : 'bg-red-600'
                }`}
                style={`width: ${currentDangerLevel}%`}
              ></div>
            </div>
            <span class="text-slate-700 dark:text-white text-sm w-8 font-bold">{currentDangerLevel}%</span>
          </div>
          <div class="text-xs text-blue-600 dark:text-blue-400 font-bold">
            🤖 MCP-coordinated assessment from all agents
          </div>
        </div>

        {/* Coordination Status */}
        <div class="bg-slate-50 dark:bg-black p-4 border border-blue-200 dark:border-blue-600 rounded-lg transition-colors">
          <h3 class="font-bold mb-3 text-blue-600 dark:text-blue-400">🔗 MCP COORDINATION</h3>
          <div class="space-y-2 text-sm text-slate-700 dark:text-green-400">
            <div class="flex justify-between">
              <span>Protocol Status:</span>
              <span class="text-green-600 dark:text-green-400 font-bold">ACTIVE</span>
            </div>
            <div class="flex justify-between">
              <span>Agent Sync:</span>
              <span class="text-green-600 dark:text-green-400 font-bold">100%</span>
            </div>
            <div class="flex justify-between">
              <span>Network Health:</span>
              <span class="text-green-600 dark:text-green-400 font-bold">OPTIMAL</span>
            </div>
            <div class="flex justify-between">
              <span>Coordinating:</span>
              <span class={isCoordinating ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-green-600 dark:text-green-400 font-bold'}>
                {isCoordinating ? 'YES' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MCP Demonstration Controls */}
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-4 text-yellow-600 dark:text-yellow-400">🎯 MCP COORDINATION DEMOS</h3>
        <div class="grid md:grid-cols-2 gap-4">
          {mcpDemos.map((demo) => (
            <DelightfulActionButton
              key={demo.id}
              onClick={() => runMCPDemo(demo)}
              isLoading={isRunningDemo}
              disabled={isRunningDemo}
              variant="primary"
              icon={demo.icon}
            >
              <div class="text-left">
                <h4 class="font-bold text-slate-900 dark:text-white">{demo.title}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-300 mt-1">{demo.description}</p>
              </div>
            </DelightfulActionButton>
          ))}
        </div>
      </div>

      {/* Live Network Activity Feed */}
      <div class="bg-slate-50 dark:bg-black p-4 border border-green-200 dark:border-green-600 rounded-lg transition-colors">
        <h3 class="font-bold mb-3 text-green-600 dark:text-green-400">📡 LIVE NETWORK ACTIVITY</h3>
        <div class="space-y-1 text-sm max-h-48 overflow-y-auto">
          {networkActivity.length > 0 ? (
            networkActivity.map((activity, index) => (
              <div key={index} class="text-green-700 dark:text-green-300 font-mono">
                <span class="text-slate-400 dark:text-gray-500 mr-2">{new Date().toLocaleTimeString()}</span> {activity}
              </div>
            ))
          ) : (
            <div class="text-slate-400 dark:text-gray-500 italic">Network activity will appear here...</div>
          )}
        </div>
      </div>

      {/* MCP Demo Result Modal */}
      <Modal
        isOpen={!!selectedDemo}
        onClose={() => setSelectedDemo(null)}
        title={selectedDemo ? `${selectedDemo.icon} ${selectedDemo.title}` : "Demo Result"}
        agentStatus={isRunningDemo ? 'coordinating' : 'complete'}
      >
        {selectedDemo && (
          <div class="space-y-4">
            <div>
              <h4 class="font-bold mb-2">MCP Coordination Result</h4>
              <p class="text-sm mb-4">{selectedDemo.description}</p>
            </div>

            {isRunningDemo && (
              <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-600">
                <div class="text-blue-600 dark:text-blue-400 text-sm mb-2 font-bold">🤖 MCP COORDINATION IN PROGRESS:</div>
                <div class="space-y-1 text-xs">
                  <div class="text-green-600 dark:text-green-300">→ Coordinating with Supply Chain Agent...</div>
                  <div class="text-green-600 dark:text-green-300">→ Risk Assessment Agent analyzing...</div>
                  <div class="text-green-600 dark:text-green-300">→ Community Agent organizing response...</div>
                  <div class="text-green-600 dark:text-green-300">→ Identity Agent processing requirements...</div>
                </div>
              </div>
            )}

            {demoResult && !isRunningDemo && (
              <div class="bg-slate-100 dark:bg-gray-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                <h5 class="font-bold mb-2 text-green-600 dark:text-green-400">✅ MCP Coordination Complete</h5>
                <pre class="text-xs text-slate-700 dark:text-gray-300 overflow-auto max-h-48 font-mono">
                  {JSON.stringify(demoResult, null, 2)}
                </pre>
              </div>
            )}

            {demoResult?.error && (
              <div class="bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-600">
                <h5 class="font-bold mb-2 text-red-600 dark:text-red-400">❌ Coordination Error</h5>
                <p class="text-sm text-red-700 dark:text-red-300 font-bold">{demoResult.error}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MCPAgentDashboard;