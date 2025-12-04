// Edenlayer Integration Hook - Real agent interactions with blockchain
// Following Core Principles: CLEAN separation, MODULAR design

import { useState, useEffect } from 'preact/hooks';
import { useWallet } from '../context/WalletContext';
import { undergroundMarketplace } from '../services/EdenlayerIntegration';

export interface EdenlayerState {
  isInitialized: boolean;
  registeredAgents: Map<string, string>;
  activeTasks: Map<string, any>;
  activeChatRooms: string[];
  isExecutingTask: boolean;
  lastError: string | null;
}

// ENHANCED: Real agent interaction hook
export function useEdenlayerIntegration() {
  const wallet = useWallet();
  const [state, setState] = useState<EdenlayerState>({
    isInitialized: false,
    registeredAgents: new Map(),
    activeTasks: new Map(),
    activeChatRooms: [],
    isExecutingTask: false,
    lastError: null
  });

  // CLEAN: Initialize Edenlayer when wallet connects
  useEffect(() => {
    const initializeEdenlayer = async () => {
      if (wallet.connected && !state.isInitialized) {
        try {
          await undergroundMarketplace.initialize(wallet);
          setState(prev => ({
            ...prev,
            isInitialized: true,
            registeredAgents: new Map([
              ['supply', 'supply-agent-id'],
              ['risk', 'risk-agent-id'],
              ['community', 'community-agent-id'],
              ['identity', 'identity-agent-id']
            ])
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            lastError: `Failed to initialize Edenlayer: ${error.message}`
          }));
        }
      }
    };

    initializeEdenlayer();
  }, [wallet.connected]);

  // REAL INTERACTION: Purchase treatment with agent coordination
  const purchaseTreatment = async (treatmentId: string): Promise<{
    success: boolean;
    taskId?: string;
    transactionSignature?: string;
    error?: string;
  }> => {
    if (!state.isInitialized) {
      return { success: false, error: 'Edenlayer not initialized' };
    }

    setState(prev => ({ ...prev, isExecutingTask: true, lastError: null }));

    try {
      const result = await undergroundMarketplace.purchaseTreatment(treatmentId);
      
      setState(prev => ({
        ...prev,
        isExecutingTask: false,
        activeTasks: new Map(prev.activeTasks.set(result.taskId, {
          type: 'purchase',
          treatmentId,
          status: 'completed',
          transactionSignature: result.transactionSignature
        }))
      }));

      return {
        success: true,
        taskId: result.taskId,
        transactionSignature: result.transactionSignature
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExecutingTask: false,
        lastError: error.message
      }));

      return { success: false, error: error.message };
    }
  };

  // REAL INTERACTION: Coordinate group purchase
  const coordinateGroupPurchase = async (treatmentIds: string[]): Promise<{
    success: boolean;
    taskId?: string;
    chatRoomId?: string;
    error?: string;
  }> => {
    if (!state.isInitialized) {
      return { success: false, error: 'Edenlayer not initialized' };
    }

    setState(prev => ({ ...prev, isExecutingTask: true, lastError: null }));

    try {
      const result = await undergroundMarketplace.coordinateGroupPurchase(treatmentIds);
      
      setState(prev => ({
        ...prev,
        isExecutingTask: false,
        activeTasks: new Map(prev.activeTasks.set(result.taskId, {
          type: 'group_purchase',
          treatmentIds,
          status: 'coordinating',
          chatRoomId: result.chatRoomId
        })),
        activeChatRooms: [...prev.activeChatRooms, result.chatRoomId]
      }));

      return {
        success: true,
        taskId: result.taskId,
        chatRoomId: result.chatRoomId
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExecutingTask: false,
        lastError: error.message
      }));

      return { success: false, error: error.message };
    }
  };

  // REAL INTERACTION: Emergency response
  const triggerEmergencyResponse = async (emergencyType: string, severity: number): Promise<{
    success: boolean;
    taskId?: string;
    emergencyRoomId?: string;
    error?: string;
  }> => {
    if (!state.isInitialized) {
      return { success: false, error: 'Edenlayer not initialized' };
    }

    setState(prev => ({ ...prev, isExecutingTask: true, lastError: null }));

    try {
      const result = await undergroundMarketplace.triggerEmergencyResponse(emergencyType, severity);
      
      setState(prev => ({
        ...prev,
        isExecutingTask: false,
        activeTasks: new Map(prev.activeTasks.set(result.taskId, {
          type: 'emergency',
          emergencyType,
          severity,
          status: 'coordinating',
          emergencyRoomId: result.emergencyRoomId
        })),
        activeChatRooms: [...prev.activeChatRooms, result.emergencyRoomId]
      }));

      return {
        success: true,
        taskId: result.taskId,
        emergencyRoomId: result.emergencyRoomId
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExecutingTask: false,
        lastError: error.message
      }));

      return { success: false, error: error.message };
    }
  };

  // MODULAR: Get real-time task status
  const getTaskStatus = (taskId: string) => {
    return state.activeTasks.get(taskId) || null;
  };

  // CLEAN: Get all active operations
  const getActiveOperations = () => {
    return Array.from(state.activeTasks.entries()).map(([taskId, task]) => ({
      taskId,
      ...task
    }));
  };

  return {
    // State
    ...state,
    
    // Real interactions
    purchaseTreatment,
    coordinateGroupPurchase,
    triggerEmergencyResponse,
    
    // Utilities
    getTaskStatus,
    getActiveOperations,
    
    // Status checks
    canExecuteTasks: state.isInitialized && wallet.connected && !state.isExecutingTask,
    hasActiveOperations: state.activeTasks.size > 0,
    hasActiveChatRooms: state.activeChatRooms.length > 0
  };
}

// CLEAN: Simplified hook for specific agent interactions
export function useUndergroundAgents() {
  const { registeredAgents, purchaseTreatment, coordinateGroupPurchase } = useEdenlayerIntegration();
  
  return {
    agents: {
      supply: registeredAgents.get('supply'),
      risk: registeredAgents.get('risk'),
      community: registeredAgents.get('community'),
      identity: registeredAgents.get('identity')
    },
    actions: {
      buyTreatment: purchaseTreatment,
      organizeGroupBuy: coordinateGroupPurchase
    }
  };
}