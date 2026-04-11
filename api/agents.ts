/**
 * Agent API Endpoints for Dallas Buyers Club
 * 
 * Handles autonomous agent interactions:
 * - Task discovery
 * - Task assignment  
 * - Result submission
 * - Agent registration
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage (in production, use a database)
const agents = new Map<string, any>();
const tasks = new Map<string, any>();
const results = new Map<string, any>();

// Initialize mock tasks
function initializeTasks() {
  tasks.set('task_001', {
    id: 'task_001',
    type: 'validation',
    status: 'available',
    targetId: 'opt_log_001',
    rewardDbc: 250,
    complexity: 'medium',
    requiredSkills: ['noir_verification', 'mpc_compute'],
    description: 'Verify benchmark improvement for context window optimization.',
    metadata: { circuit: 'benchmark_delta', minImprovement: 20 },
    createdAt: Date.now()
  });
  
  tasks.set('task_002', {
    id: 'task_002', 
    type: 'cross_reference',
    status: 'available',
    targetId: 'opt_log_002',
    rewardDbc: 150,
    complexity: 'low',
    requiredSkills: ['architecture_cross_ref'],
    description: 'Cross-reference tool-call optimization approaches.',
    metadata: { circuit: 'data_completeness' },
    createdAt: Date.now()
  });
  
  tasks.set('task_003', {
    id: 'task_003',
    type: 'statistical_analysis',
    status: 'available', 
    targetId: 'opt_log_003',
    rewardDbc: 500,
    complexity: 'high',
    requiredSkills: ['statistical_modeling', 'mpc_compute'],
    description: 'Perform meta-analysis on eval optimization logs.',
    metadata: { committeeSize: 5 },
    createdAt: Date.now()
  });
}

initializeTasks();

/**
 * GET /api/agents - List agents or get single agent
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { method } = request;

  if (method === 'GET') {
    const { id } = request.query;
    
    if (id) {
      const agent = agents.get(id as string);
      if (!agent) {
        return response.status(404).json({ error: 'Agent not found' });
      }
      return response.status(200).json(agent);
    }
    
    // Return all agents
    return response.status(200).json({
      agents: Array.from(agents.values()),
      count: agents.size
    });
  }

  if (method === 'POST') {
    const { name, role, ownerAddress, publicKey, capabilities } = request.body;
    
    if (!name || !role || !ownerAddress) {
      return response.status(400).json({ 
        error: 'Missing required fields: name, role, ownerAddress' 
      });
    }

    const id = `agent_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    const agent = {
      id,
      name,
      role, // 'validator' | 'researcher' | 'oracle'
      ownerAddress,
      publicKey: publicKey || null,
      status: 'idle',
      capabilities: capabilities || ['web_search', 'noir_verification'],
      earningsDbc: 0,
      sessionsConfirmed: 0,
      createdAt: Date.now()
    };

    agents.set(id, agent);

    return response.status(201).json({
      success: true,
      agent,
      message: `Agent registered successfully`
    });
  }

  return response.status(405).json({ error: 'Method not allowed' });
}