/**
 * AgentService - Orchestrates Agentic Interactions
 * 
 * Enables autonomous agents (OpenClaw) to participate in the Dallas Buyers Club
 * ecosystem as validators, researchers, and data oracles.
 * 
 * Core Principles:
 * - PRIVACY AT THE HEART: Agents operate within MPC enclaves and verify ZK proofs.
 * - AGENTIC AUTONOMY: Support for OpenClaw-style on-chain interactions.
 * - DELEGATED SOVEREIGNTY: Humans delegate specific permissions to agents.
 */

import { PublicKey, Keypair } from '@solana/web3.js';
import { privacyService, PrivacyOperationResult } from './privacy/PrivacyService';
import { encryptionService } from './EncryptionService';
import { cacheService } from './CacheService';

export interface AgentTask {
    id: string;
    type: 'validation' | 'research' | 'cross_reference' | 'statistical_analysis';
    status: 'available' | 'assigned' | 'completed' | 'failed';
    targetId: string; // e.g. Optimization Log ID
    rewardDbc: number;
    complexity: 'low' | 'medium' | 'high';
    requiredSkills: string[];
    description: string;
    metadata: Record<string, any>;
}

export interface AgentIdentity {
    id: string;
    publicKey: string;
    ownerAddress: string;
    name: string;
    role: 'validator' | 'researcher' | 'oracle';
    status: 'idle' | 'executing' | 'offline';
    capabilities: string[];
    earningsDbc: number;
    sessionsConfirmed: number;
}

// API base URL - use relative path for client-side calls
const API_BASE = '/api';

class AgentService {
    private agentTasks: AgentTask[] = [];
    private activeAgents: AgentIdentity[] = [];
    private useApi: boolean = true;

    constructor() {
        // Try to load from API first, fall back to mock
        this.initializeAgentData();
    }

    private async initializeAgentData() {
        if (this.useApi) {
            try {
                // Fetch tasks from API
                const tasksRes = await fetch(`${API_BASE}/tasks?status=available`);
                if (tasksRes.ok) {
                    const tasksData = await tasksRes.json();
                    this.agentTasks = tasksData.tasks || [];
                }

                // Fetch registered agents
                const agentsRes = await fetch(`${API_BASE}/agents`);
                if (agentsRes.ok) {
                    const agentsData = await agentsRes.json();
                    this.activeAgents = agentsData.agents || [];
                }

                console.log('✅ AgentService initialized from API');
                return;
            } catch (error) {
                console.warn('⚠️ API not available, using mock data:', error);
            }
        }

        // Fall back to mock data
        this.initializeMockData();
    }

    private initializeMockData() {
        this.agentTasks = [
            {
                id: 'task_001',
                type: 'validation',
                status: 'available',
                targetId: 'opt_log_001',
                rewardDbc: 250,
                complexity: 'medium',
                requiredSkills: ['noir_verification', 'mpc_compute'],
                description: 'Verify benchmark improvement for context window optimization using ZK proofs.',
                metadata: { circuit: 'benchmark_delta', minImprovement: 20 }
            },
            {
                id: 'task_002',
                type: 'cross_reference',
                status: 'available',
                targetId: 'opt_log_002',
                rewardDbc: 150,
                complexity: 'low',
                requiredSkills: ['architecture_cross_ref'],
                description: 'Cross-reference tool-call optimization approaches across benchmarks.',
                metadata: { circuit: 'data_completeness' }
            },
            {
                id: 'task_003',
                type: 'statistical_analysis',
                status: 'available',
                targetId: 'opt_log_003',
                rewardDbc: 500,
                complexity: 'high',
                requiredSkills: ['statistical_modeling', 'mpc_compute'],
                description: 'Perform meta-analysis on eval optimization logs using MPC committee.',
                metadata: { committeeSize: 5 }
            }
        ];

        this.activeAgents = [
            {
                id: 'agent_openclaw_01',
                publicKey: 'Agnt...7Xy2',
                ownerAddress: '',
                name: 'Claw-Validator-Alpha',
                role: 'validator',
                status: 'idle',
                capabilities: ['web_search', 'noir_verification', 'mpc_compute'],
                earningsDbc: 1250,
                sessionsConfirmed: 42
            }
        ];
    }

    /**
     * Register a new agent (OpenClaw integration)
     * Now calls the /api/agents endpoint
     */
    async registerAgent(owner: PublicKey, name: string, role: AgentIdentity['role']): Promise<AgentIdentity> {
        // Try API first
        if (this.useApi) {
            try {
                const res = await fetch(`${API_BASE}/agents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        role,
                        ownerAddress: owner.toString(),
                        publicKey: null, // Will be generated server-side
                        capabilities: ['web_search', 'noir_verification', 'mpc_compute']
                    })
                });
                
                if (res.ok) {
                    const data = await res.json();
                    const newAgent: AgentIdentity = {
                        id: data.agent.id,
                        publicKey: data.agent.publicKey || '',
                        ownerAddress: data.agent.ownerAddress,
                        name: data.agent.name,
                        role: data.agent.role,
                        status: data.agent.status,
                        capabilities: data.agent.capabilities,
                        earningsDbc: 0,
                        sessionsConfirmed: 0
                    };
                    this.activeAgents.push(newAgent);
                    console.log(`✅ Agent registered via API: ${newAgent.id}`);
                    return newAgent;
                }
            } catch (error) {
                console.warn('⚠️ API registration failed, using local:', error);
            }
        }

        // Fall back to local keypair generation
        const agentKeypair = Keypair.generate();

        const newAgent: AgentIdentity = {
            id: `agent_${Math.random().toString(36).slice(2, 9)}`,
            publicKey: agentKeypair.publicKey.toString(),
            ownerAddress: owner.toString(),
            name: name,
            role: role,
            status: 'idle',
            capabilities: ['web_search', 'noir_verification'],
            earningsDbc: 0,
            sessionsConfirmed: 0
        };

        this.activeAgents.push(newAgent);
        cacheService.set(`agent_${newAgent.id}`, agentKeypair.secretKey);

        return newAgent;
    }

    /**
     * Assign a task to an agent via API
     */
    async assignTask(taskId: string, agentId: string): Promise<AgentTask | null> {
        if (this.useApi) {
            try {
                const res = await fetch(`${API_BASE}/tasks`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        taskId,
                        agentId,
                        action: 'assign'
                    })
                });
                
                if (res.ok) {
                    const data = await res.json();
                    console.log(`✅ Task assigned via API: ${taskId} -> ${agentId}`);
                    return data.task;
                }
            } catch (error) {
                console.warn('⚠️ Task assignment failed:', error);
            }
        }
        return null;
    }

    /**
     * Submit task results via API
     */
    async submitResults(
        taskId: string,
        agentId: string,
        resultType: AgentTask['type'],
        targetId: string,
        findings: any
    ): Promise<any> {
        if (this.useApi) {
            try {
                const res = await fetch(`${API_BASE}/results`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        taskId,
                        agentId,
                        resultType,
                        targetId,
                        findings
                    })
                });
                
                if (res.ok) {
                    const data = await res.json();
                    console.log(`✅ Results submitted via API: ${data.result.id}`);
                    return data.result;
                }
            } catch (error) {
                console.warn('⚠️ Results submission failed:', error);
            }
        }
        return null;
    }

    /**
     * Delegate MPC access to an agent
     */
    async delegateAccess(agentId: string, optimizationLogId: string, justification: string): Promise<PrivacyOperationResult> {
        const agent = this.activeAgents.find(a => a.id === agentId);
        if (!agent) throw new Error('Agent not found');

        console.log(`Delegating MPC access to agent ${agent.name} for ${optimizationLogId}`);

        // In a real implementation, this would involve creating a session key 
        // or adding the agent's public key to the Arcium committee.
        return privacyService.requestResearchAccess(
            new PublicKey(agent.publicKey),
            {
                optimizationLogId,
                justification: `Delegated agentic research: ${justification}`,
                requesterType: 'researcher'
            },
            { hasCompression: true, proofCount: 2, privacyScore: 85 }
        );
    }

    getTasks(): AgentTask[] {
        return this.agentTasks;
    }

    getActiveAgents(ownerAddress?: string): AgentIdentity[] {
        if (ownerAddress) {
            return this.activeAgents.filter(a => a.ownerAddress === ownerAddress || a.ownerAddress === '');
        }
        return this.activeAgents;
    }

    /**
     * Generate OpenClaw Skill Manifest
     * This provides the instructions OpenClaw needs to interact with DBC
     */
    async generateOpenClawManifest(): Promise<Record<string, any>> {
        return {
            name: "Dallas Buyers Club Agent Skill",
            description: "Autonomous agent sovereignty validation and research on Solana",
            version: "1.0.0",
            capabilities: [
                "solana_transactions",
                "noir_proof_verification",
                "arcium_mpc_compute",
                "architecture_cross_referencing"
            ],
            endpoints: {
                task_discovery: "/api/agents/tasks",
                task_assignment: "/api/agents/assign",
                result_submission: "/api/agents/submit"
            },
            prompts: {
                validation: "You are an agent of the Dallas Buyers Club. Your goal is to validate the following agent optimization log by cross-referencing public benchmarks while maintaining agent privacy using the provided ZK proof circuits.",
                research: "Perform a meta-analysis on the following encrypted dataset using the requested MPC committee threshold."
            }
        };
    }
}

export const agentService = new AgentService();
export default agentService;
