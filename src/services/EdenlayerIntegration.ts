// Edenlayer Integration - Real Agent-to-Agent Task Execution
// Following Core Principles: ENHANCEMENT FIRST, CLEAN separation

import { WalletContextType } from '../context/WalletContext';
import { PublicKey } from '@solana/web3.js';

// CLEAN: Edenlayer API configuration
export const EDENLAYER_CONFIG = {
  apiUrl: 'https://api.edenlayer.com',
  apiKey: process.env.EDENLAYER_API_KEY || '', // Set in environment
  websocketUrl: 'wss://api.edenlayer.com/parties/chat-server'
};

// MODULAR: Agent registration interfaces
interface EdenlayerAgent {
  id: string;
  name: string;
  description: string;
  mcpUrl: string;
  chatUrl: string;
  capabilities: {
    tools: Array<{
      name: string;
      description: string;
      inputSchema: any;
    }>;
  };
}

interface EdenlayerTask {
  taskId: string;
  state: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

interface EdenlayerWorkflow {
  tasks: Array<{
    agentId: string;
    operation: string;
    params: any;
    parents?: string[];
  }>;
}

// ENHANCEMENT: Bridge between our agents and Edenlayer
export class EdenlayerBridge {
  private apiKey: string;
  private registeredAgents: Map<string, string> = new Map(); // agentType -> edenlayerId
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // MODULAR: Register our underground agents with Edenlayer
  async registerUndergroundAgents(): Promise<void> {
    const agents = [
      {
        type: 'supply',
        config: {
          name: "Underground Supply Chain",
          description: "A.I.D.S. treatment sourcing, pricing optimization, and distribution coordination for the Dallas underground network",
          defaultPrompt: "How can I help coordinate treatment supply and distribution?",
          imageUrl: "https://example.com/supply-agent.png",
          mcpUrl: `${window.location.origin}/api/agents/supply/mcp`,
          chatUrl: `${window.location.origin}/api/agents/supply/chat`,
          capabilities: {
            tools: [
              {
                name: "check_treatment_availability",
                description: "Check availability and pricing for A.I.D.S. treatments",
                inputSchema: {
                  type: "object",
                  properties: {
                    treatmentIds: { type: "array", items: { type: "string" } },
                    quantity: { type: "number", minimum: 1 }
                  },
                  required: ["treatmentIds"]
                }
              },
              {
                name: "negotiate_bulk_pricing",
                description: "Negotiate bulk pricing for group purchases",
                inputSchema: {
                  type: "object",
                  properties: {
                    treatmentId: { type: "string" },
                    quantity: { type: "number", minimum: 2 },
                    memberCount: { type: "number", minimum: 2 }
                  },
                  required: ["treatmentId", "quantity", "memberCount"]
                }
              },
              {
                name: "coordinate_distribution",
                description: "Plan secure distribution routes for treatments",
                inputSchema: {
                  type: "object",
                  properties: {
                    destinations: { type: "array", items: { type: "string" } },
                    riskLevel: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] }
                  },
                  required: ["destinations"]
                }
              }
            ]
          }
        }
      },
      {
        type: 'risk',
        config: {
          name: "Network Security Analyst",
          description: "Corporate AI threat monitoring, risk assessment, and emergency response coordination for underground operations",
          defaultPrompt: "How can I help assess security risks and coordinate emergency responses?",
          mcpUrl: `${window.location.origin}/api/agents/risk/mcp`,
          chatUrl: `${window.location.origin}/api/agents/risk/chat`,
          capabilities: {
            tools: [
              {
                name: "assess_transaction_risk",
                description: "Analyze risk levels for financial transactions and operations",
                inputSchema: {
                  type: "object",
                  properties: {
                    transactionType: { type: "string", enum: ["purchase", "transfer", "group_buy"] },
                    amount: { type: "number", minimum: 0 },
                    participantCount: { type: "number", minimum: 1 }
                  },
                  required: ["transactionType", "amount"]
                }
              },
              {
                name: "monitor_corporate_surveillance",
                description: "Monitor Corporate AI Security activity and threat patterns",
                inputSchema: {
                  type: "object", 
                  properties: {
                    timeWindow: { type: "string", enum: ["1h", "6h", "24h", "7d"] },
                    sectors: { type: "array", items: { type: "string" } }
                  }
                }
              },
              {
                name: "coordinate_emergency_response",
                description: "Coordinate network-wide emergency response protocols",
                inputSchema: {
                  type: "object",
                  properties: {
                    emergencyType: { type: "string", enum: ["corporate_raid", "supply_disruption", "network_compromise"] },
                    severity: { type: "number", minimum: 1, maximum: 10 },
                    affectedSectors: { type: "array", items: { type: "string" } }
                  },
                  required: ["emergencyType", "severity"]
                }
              }
            ]
          }
        }
      },
      {
        type: 'community',
        config: {
          name: "Community Coordinator",
          description: "Member network management, group coordination, and social connection facilitation for the underground resistance",
          defaultPrompt: "How can I help coordinate community activities and member connections?",
          mcpUrl: `${window.location.origin}/api/agents/community/mcp`,
          chatUrl: `${window.location.origin}/api/agents/community/chat`,
          capabilities: {
            tools: [
              {
                name: "organize_group_purchase",
                description: "Coordinate group purchases among network members",
                inputSchema: {
                  type: "object",
                  properties: {
                    treatmentIds: { type: "array", items: { type: "string" } },
                    maxParticipants: { type: "number", minimum: 2, maximum: 50 },
                    timeframe: { type: "string", enum: ["24h", "48h", "1w"] }
                  },
                  required: ["treatmentIds"]
                }
              },
              {
                name: "match_community_members",
                description: "Connect members with similar needs or complementary resources",
                inputSchema: {
                  type: "object",
                  properties: {
                    memberProfile: { type: "object" },
                    matchingCriteria: { type: "array", items: { type: "string" } }
                  },
                  required: ["memberProfile"]
                }
              },
              {
                name: "facilitate_peer_support",
                description: "Organize peer support groups and mentorship connections",
                inputSchema: {
                  type: "object",
                  properties: {
                    supportType: { type: "string", enum: ["newcomer", "treatment", "emotional", "technical"] },
                    groupSize: { type: "number", minimum: 2, maximum: 10 }
                  },
                  required: ["supportType"]
                }
              }
            ]
          }
        }
      },
      {
        type: 'identity',
        config: {
          name: "Identity Restoration Specialist", 
          description: "A.I.D.S. treatment planning, identity fragmentation assessment, and multi-phase restoration coordination",
          defaultPrompt: "How can I help with identity restoration and treatment planning?",
          mcpUrl: `${window.location.origin}/api/agents/identity/mcp`,
          chatUrl: `${window.location.origin}/api/agents/identity/chat`,
          capabilities: {
            tools: [
              {
                name: "assess_identity_fragmentation",
                description: "Analyze level and type of identity fragmentation from A.I.D.S.",
                inputSchema: {
                  type: "object",
                  properties: {
                    patientId: { type: "string" },
                    symptoms: { type: "array", items: { type: "string" } },
                    fragmentationIndicators: { type: "object" }
                  },
                  required: ["patientId"]
                }
              },
              {
                name: "plan_restoration_sequence",
                description: "Create personalized multi-phase identity restoration plan",
                inputSchema: {
                  type: "object",
                  properties: {
                    fragmentationLevel: { type: "number", minimum: 0, maximum: 100 },
                    affectedSystems: { type: "array", items: { type: "string" } },
                    timeframe: { type: "string", enum: ["emergency", "urgent", "standard", "extended"] }
                  },
                  required: ["fragmentationLevel", "affectedSystems"]
                }
              },
              {
                name: "monitor_restoration_progress",
                description: "Track and adjust ongoing identity restoration treatments",
                inputSchema: {
                  type: "object",
                  properties: {
                    restorationId: { type: "string" },
                    progressMetrics: { type: "object" },
                    adjustments: { type: "array", items: { type: "object" } }
                  },
                  required: ["restorationId"]
                }
              }
            ]
          }
        }
      }
    ];

    // Register each agent with Edenlayer
    for (const agent of agents) {
      try {
        const response = await this.makeApiCall('POST', '/agents', agent.config);
        this.registeredAgents.set(agent.type, response.id);
        console.log(`✅ Registered ${agent.type} agent:`, response.id);
      } catch (error) {
        console.error(`❌ Failed to register ${agent.type} agent:`, error);
      }
    }
  }

  // PERFORMANT: Execute real tasks via Edenlayer
  async executeTask(agentType: string, operation: string, params: any): Promise<EdenlayerTask> {
    const agentId = this.registeredAgents.get(agentType);
    if (!agentId) {
      throw new Error(`Agent ${agentType} not registered with Edenlayer`);
    }

    const taskRequest = {
      agentId,
      operation: `tools/${operation}`,
      params
    };

    const response = await this.makeApiCall('POST', '/tasks', taskRequest);
    return {
      taskId: response.taskId,
      state: response.state
    };
  }

  // MODULAR: Compose multi-agent workflows
  async composeWorkflow(workflow: EdenlayerWorkflow): Promise<EdenlayerTask> {
    // Convert our agent types to Edenlayer agent IDs
    const edenlayerWorkflow = workflow.tasks.map((task, index) => ({
      ...task,
      agentId: this.registeredAgents.get(task.agentId) || task.agentId,
      operation: task.operation.startsWith('tools/') ? task.operation : `tools/${task.operation}`
    }));

    const response = await this.makeApiCall('POST', '/tasks/compose', edenlayerWorkflow);
    return {
      taskId: response.taskId,
      state: response.state
    };
  }

  // CLEAN: Get task results
  async getTaskResult(taskId: string): Promise<EdenlayerTask> {
    const response = await this.makeApiCall('GET', `/tasks/${taskId}`);
    return {
      taskId: response.taskId,
      state: response.state,
      result: response.result
    };
  }

  // MODULAR: Create underground chat room
  async createUndergroundChatRoom(userWallet: string, agentTypes: string[] = []): Promise<string> {
    const participants = [
      { type: "HUMAN", participantId: userWallet }
    ];

    // Add requested agents to chat room
    for (const agentType of agentTypes) {
      const agentId = this.registeredAgents.get(agentType);
      if (agentId) {
        participants.push({ type: "AGENT", participantId: agentId });
      }
    }

    const roomRequest = {
      name: "Dallas Underground Network",
      type: "CHAT",
      description: "Secure communication for A.I.D.S. treatment coordination",
      maxParticipants: participants.length + 5, // Room for more members
      private: true,
      participants
    };

    const response = await this.makeApiCall('POST', '/rooms', roomRequest);
    return response.roomId;
  }

  // CLEAN: API helper
  private async makeApiCall(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${EDENLAYER_CONFIG.apiUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Edenlayer API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // PUBLIC API: Get registered agent IDs
  getRegisteredAgents(): Map<string, string> {
    return new Map(this.registeredAgents);
  }
}

// ENHANCEMENT: Real user interactions with blockchain integration
export class UndergroundMarketplace {
  private edenlayer: EdenlayerBridge;
  private wallet: WalletContextType | null = null;

  constructor(edenlayerApiKey: string) {
    this.edenlayer = new EdenlayerBridge(edenlayerApiKey);
  }

  async initialize(wallet: WalletContextType): Promise<void> {
    this.wallet = wallet;
    await this.edenlayer.registerUndergroundAgents();
  }

  // REAL INTERACTION: Purchase treatment with agent coordination
  async purchaseTreatment(treatmentId: string, paymentMethod: 'SOL' | 'SPL' = 'SOL'): Promise<{
    taskId: string;
    transactionSignature?: string;
    coordinationResult: any;
  }> {
    if (!this.wallet?.connected) {
      throw new Error('Wallet not connected');
    }

    // Multi-agent workflow for treatment purchase
    const workflow = await this.edenlayer.composeWorkflow({
      tasks: [
        // Step 1: Risk assessment
        {
          agentId: 'risk',
          operation: 'assess_transaction_risk',
          params: {
            transactionType: 'purchase',
            amount: this.getTreatmentPrice(treatmentId),
            participantCount: 1
          }
        },
        // Step 2: Check availability and pricing
        {
          agentId: 'supply',
          operation: 'check_treatment_availability',
          parents: ['0'],
          params: {
            treatmentIds: [treatmentId],
            quantity: 1
          }
        },
        // Step 3: Plan distribution
        {
          agentId: 'supply', 
          operation: 'coordinate_distribution',
          parents: ['0', '1'],
          params: {
            destinations: [this.wallet.publicKey!.toString()],
            riskLevel: 'MEDIUM' // Will be determined by risk assessment
          }
        },
        // Step 4: Process identity restoration plan
        {
          agentId: 'identity',
          operation: 'plan_restoration_sequence',
          parents: ['0', '1', '2'],
          params: {
            fragmentationLevel: 65, // Would be assessed in real implementation
            affectedSystems: ['digital_signature', 'memory_core'],
            timeframe: 'standard'
          }
        }
      ]
    });

    // If agents approve, execute real blockchain transaction
    const coordinationResult = await this.edenlayer.getTaskResult(workflow.taskId);
    
    if (coordinationResult.state === 'completed') {
      // Execute real Solana transaction
      const treasuryAddress = new PublicKey('BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK');
      const amount = this.getTreatmentPrice(treatmentId);
      
      const transactionSignature = await this.wallet.sendTransaction(
        treasuryAddress,
        amount,
        'donation'
      );

      return {
        taskId: workflow.taskId,
        transactionSignature,
        coordinationResult
      };
    }

    return {
      taskId: workflow.taskId,
      coordinationResult
    };
  }

  // REAL INTERACTION: Coordinate group purchase
  async coordinateGroupPurchase(treatmentIds: string[], maxParticipants: number = 10): Promise<{
    taskId: string;
    chatRoomId: string;
    coordinationResult: any;
  }> {
    if (!this.wallet?.connected) {
      throw new Error('Wallet not connected');
    }

    // Create chat room for group coordination
    const chatRoomId = await this.edenlayer.createUndergroundChatRoom(
      this.wallet.publicKey!.toString(),
      ['community', 'supply', 'risk']
    );

    // Multi-agent group purchase workflow
    const workflow = await this.edenlayer.composeWorkflow({
      tasks: [
        // Community agent organizes group
        {
          agentId: 'community',
          operation: 'organize_group_purchase',
          params: {
            treatmentIds,
            maxParticipants,
            timeframe: '48h'
          }
        },
        // Supply agent negotiates bulk pricing
        {
          agentId: 'supply',
          operation: 'negotiate_bulk_pricing',
          parents: ['0'],
          params: {
            treatmentId: treatmentIds[0],
            quantity: maxParticipants,
            memberCount: maxParticipants
          }
        },
        // Risk agent assesses group transaction safety
        {
          agentId: 'risk',
          operation: 'assess_transaction_risk',
          parents: ['0', '1'],
          params: {
            transactionType: 'group_buy',
            amount: this.getTreatmentPrice(treatmentIds[0]) * maxParticipants,
            participantCount: maxParticipants
          }
        }
      ]
    });

    const coordinationResult = await this.edenlayer.getTaskResult(workflow.taskId);

    return {
      taskId: workflow.taskId,
      chatRoomId,
      coordinationResult
    };
  }

  // REAL INTERACTION: Emergency response coordination
  async triggerEmergencyResponse(emergencyType: string, severity: number): Promise<{
    taskId: string;
    emergencyRoomId: string;
    coordinationResult: any;
  }> {
    if (!this.wallet?.connected) {
      throw new Error('Wallet not connected');
    }

    // Create emergency chat room
    const emergencyRoomId = await this.edenlayer.createUndergroundChatRoom(
      this.wallet.publicKey!.toString(),
      ['risk', 'supply', 'community', 'identity']
    );

    // Emergency coordination task
    const emergencyTask = await this.edenlayer.executeTask(
      'risk',
      'coordinate_emergency_response',
      {
        emergencyType,
        severity,
        affectedSectors: ['dallas', 'underground_network']
      }
    );

    const coordinationResult = await this.edenlayer.getTaskResult(emergencyTask.taskId);

    return {
      taskId: emergencyTask.taskId,
      emergencyRoomId,
      coordinationResult
    };
  }

  private getTreatmentPrice(treatmentId: string): number {
    const prices = {
      'azt_patch': 0.5,
      'peptide_code': 0.2,
      'ddc_algorithm': 0.3,
      'interferon_suite': 0.8
    };
    return prices[treatmentId as keyof typeof prices] || 0.5;
  }
}

// SINGLE EXPORT: Enhanced marketplace with real agent interactions
export const undergroundMarketplace = new UndergroundMarketplace(
  EDENLAYER_CONFIG.apiKey
);