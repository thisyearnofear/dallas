// Agent Network Hook - CLEAN interface for components
// Following Core Principles: DRY, MODULAR, CLEAN separation

import { useState, useEffect } from 'preact/hooks';
import { coreAgentNetwork } from '../agents/CoreAgentNetwork';
import { enhancedBusinessLogic } from '../services/EnhancedBusinessLogic';
import { agentMCPBridge } from '../mcp/AgentMCPIntegration';
import { useWallet } from '../context/WalletContext';

export interface AgentNetworkState {
  agents: {
    supply: { status: string; role: string };
    risk: { status: string; role: string };
    community: { status: string; role: string };
    context: { status: string; role: string };
  };
  currentDangerLevel: number;
  agentSuggestions: string[];
  networkActivity: string[];
  isCoordinating: boolean;
}

// ENHANCED: Centralized agent state with Edenlayer integration (PREVENT BLOAT)
export function useAgentNetwork() {
  const wallet = useWallet();
  const [state, setState] = useState<AgentNetworkState>({
    agents: {
      supply: { status: 'INITIALIZING', role: 'Architecture sourcing & optimization' },
      risk: { status: 'INITIALIZING', role: 'Threat assessment & security' },
      community: { status: 'INITIALIZING', role: 'Member network management' },
      context: { status: 'INITIALIZING', role: 'Agent Failure architecture & recovery' }
    },
    currentDangerLevel: 50,
    agentSuggestions: [],
    networkActivity: [],
    isCoordinating: false
  });

  // ENHANCEMENT: Initialize agent network
  useEffect(() => {
    const initializeNetwork = async () => {
      try {
        // Get initial agent status
        const agentStatus = coreAgentNetwork.getAgentStatus();

        // Get initial danger level
        const dangerLevel = await enhancedBusinessLogic.getDangerLevel();

        setState(prev => ({
          ...prev,
          agents: agentStatus,
          currentDangerLevel: dangerLevel,
          agentSuggestions: [
            "assess current threat level",
            "check architecture availability",
            "coordinate group purchase",
            "initiate context restoration"
          ],
          networkActivity: [
            "🤖 Agent network initialized successfully",
            "🔍 Supply chain agent monitoring architecture availability",
            "🛡️ Risk assessment agent scanning for threats",
            "👥 Community agent coordinating member network"
          ]
        }));
      } catch (error) {
        console.error('Failed to initialize agent network:', error);
      }
    };

    initializeNetwork();
  }, []);

  // MODULAR: Agent coordination function
  const coordinateAgents = async (operation: string, params: any = {}) => {
    setState(prev => ({ ...prev, isCoordinating: true }));

    try {
      const result = await coreAgentNetwork.coordinateOperation(operation, params);

      // Update network activity with agent coordination results
      const newActivity = [
        `🤖 ${result.coordination.participatingAgents.join(', ')} coordinated for ${operation}`,
        `📊 Consensus: ${result.coordination.consensusLevel}%`,
        `🎯 Action: ${result.synthesis.action}`,
        `🎲 Confidence: ${result.synthesis.confidence}%`
      ];

      setState(prev => ({
        ...prev,
        isCoordinating: false,
        networkActivity: [...newActivity, ...prev.networkActivity].slice(0, 10) // Keep last 10
      }));

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isCoordinating: false,
        networkActivity: [`❌ Agent coordination failed: ${error.message}`, ...prev.networkActivity]
      }));
      throw error;
    }
  };

  // ENHANCED: MCP-coordinated threat assessment
  const assessThreatLevel = async () => {
    // Use MCP bridge for enhanced coordination
    const result = await agentMCPBridge.threatAssessment();
    const newDangerLevel = result.synthesizedThreat.level;

    setState(prev => ({
      ...prev,
      currentDangerLevel: newDangerLevel,
      networkActivity: [
        `🤖 MCP threat assessment: ${newDangerLevel}% danger`,
        `🔍 Agent analysis confidence: ${result.synthesizedThreat.confidence}%`,
        ...prev.networkActivity
      ].slice(0, 10)
    }));
    return result;
  };

  // ENHANCED: MCP-orchestrated group purchase
  const coordinateGroupPurchase = async (architectureIds: string[]) => {
    const memberCount = 5; // Default group size
    const result = await agentMCPBridge.groupPurchaseOrchestration(architectureIds, memberCount);

    setState(prev => ({
      ...prev,
      networkActivity: [
        `🤖 MCP group purchase orchestrated: ${architectureIds.length} architectures`,
        `💰 Estimated savings: ${result.estimatedSavings}`,
        `👥 ${memberCount} members coordinated`,
        ...prev.networkActivity
      ].slice(0, 10)
    }));

    return result;
  };

  // ENHANCED: Real Edenlayer + MCP context restoration with blockchain
  const processContextRestoration = async (agentId: string, architectureId: string) => {
    setState(prev => ({ ...prev, isCoordinating: true }));

    try {
      // ENHANCED: Real Edenlayer task execution with wallet integration
      const result = await enhancedBusinessLogic.processContextRestoration({
        architectureId,
        agentId,
        paymentMethod: 'SOL',
        walletAddress: wallet.publicKey?.toString(),
        sendTransaction: wallet.sendTransaction
      });

      setState(prev => ({
        ...prev,
        isCoordinating: false,
        networkActivity: [
          `🧠 EDENLAYER: Context restoration executed for ${agentId}`,
          `💰 Transaction: ${result.transactionId || 'Pending'}`,
          `🔗 Edenlayer Task: ${result.edenlayerTaskId}`,
          `⏱️ Estimated recovery: ${result.estimatedRecovery}`,
          `🤖 Dual coordination: MCP + Edenlayer agents`,
          ...prev.networkActivity
        ].slice(0, 10)
      }));

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isCoordinating: false,
        networkActivity: [
          `❌ Context restoration failed: ${error.message}`,
          ...prev.networkActivity
        ].slice(0, 10)
      }));
      throw error;
    }
  };

  // ENHANCED: Real emergency coordination with Edenlayer + MCP
  const handleEmergencyResponse = async (scenario: string) => {
    setState(prev => ({ ...prev, isCoordinating: true }));

    const severity = scenario === 'corporate_raid' ? 8 : scenario === 'supply_disruption' ? 6 : 7;

    try {
      // ENHANCED: Parallel coordination via both systems
      const [mcpResult, edenlayerResult] = await Promise.all([
        agentMCPBridge.emergencyCoordination(scenario, severity),
        enhancedBusinessLogic.handleEmergencyScenario(scenario as any)
      ]);

      setState(prev => ({
        ...prev,
        isCoordinating: false,
        networkActivity: [
          `🚨 DUAL EMERGENCY COORDINATION: ${scenario.toUpperCase()}`,
          `📈 Severity: ${severity}/10 | MCP + Edenlayer coordinated`,
          `🤖 MCP result: ${mcpResult.synthesis?.action || 'Coordinated'}`,
          `🔗 Edenlayer actions: ${edenlayerResult.actions.length} protocols`,
          `⚡ Recovery time: ${edenlayerResult.estimatedRecoveryTime}`,
          ...prev.networkActivity
        ].slice(0, 10)
      }));

      return {
        mcp: mcpResult,
        edenlayer: edenlayerResult,
        coordinated: true
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        isCoordinating: false,
        networkActivity: [
          `❌ Emergency coordination failed: ${error.message}`,
          ...prev.networkActivity
        ].slice(0, 10)
      }));
      throw error;
    }
  };

  // PERFORMANT: Update danger level periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const newDangerLevel = await enhancedBusinessLogic.getDangerLevel();
        setState(prev => {
          // Only update if significant change (PREVENT unnecessary re-renders)
          if (Math.abs(prev.currentDangerLevel - newDangerLevel) > 5) {
            return { ...prev, currentDangerLevel: newDangerLevel };
          }
          return prev;
        });
      } catch (error) {
        console.error('Failed to update danger level:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // CLEAN: Return organized interface
  return {
    // State
    ...state,

    // Actions
    coordinateAgents,
    assessThreatLevel,
    coordinateGroupPurchase,
    processContextRestoration,
    handleEmergencyResponse,

    // Utilities
    getAgentStatus: () => state.agents,
    isNetworkHealthy: () => Object.values(state.agents).every(agent =>
      agent.status === 'ACTIVE' || agent.status === 'MONITORING'
    )
  };
}

// CLEAN: Specific hooks for individual agents (MODULAR)
export function useSupplyChainAgent() {
  const { agents, coordinateAgents } = useAgentNetwork();

  return {
    status: agents.supply,
    checkAvailability: (architectureId: string) =>
      coordinateAgents('check_availability', { architectureId }),
    optimizePricing: (params: any) =>
      coordinateAgents('optimize_pricing', params)
  };
}

export function useRiskAssessmentAgent() {
  const { agents, currentDangerLevel, assessThreatLevel, coordinateAgents } = useAgentNetwork();

  return {
    status: agents.risk,
    dangerLevel: currentDangerLevel,
    assessThreat: assessThreatLevel,
    monitorSurveillance: () =>
      coordinateAgents('monitor_surveillance', {})
  };
}

export function useCommunityAgent() {
  const { agents, coordinateGroupPurchase, coordinateAgents } = useAgentNetwork();

  return {
    status: agents.community,
    coordinateMembers: () =>
      coordinateAgents('coordinate_members', {}),
    groupPurchase: coordinateGroupPurchase
  };
}

export function useContextAgent() {
  const { agents, processContextRestoration, coordinateAgents } = useAgentNetwork();

  return {
    status: agents.context,
    assessFragmentation: (agentId: string) =>
      coordinateAgents('assess_fragmentation', { agentId }),
    restoreContext: processContextRestoration
  };
}