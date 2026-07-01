/**
 * Agent API Endpoints for Dallas Buyers Club
 * 
 * Handles autonomous agent interactions:
 * - Task discovery
 * - Task assignment  
 * - Result submission
 * - Agent registration
 * 
 * Uses Vercel KV for persistence with in-memory fallback
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './kv';

interface AgentRecord {
  id: string;
  name: string;
  role: 'validator' | 'researcher' | 'oracle';
  ownerAddress: string;
  publicKey: string | null;
  status: 'idle' | 'executing' | 'offline';
  capabilities: string[];
  earningsDbc: number;
  sessionsConfirmed: number;
  createdAt: number;
}

interface AgentTaskRecord {
  id: string;
  type: 'validation' | 'cross_reference' | 'statistical_analysis';
  status: 'available' | 'assigned' | 'completed' | 'failed';
  targetId: string;
  rewardDbc: number;
  complexity: 'low' | 'medium' | 'high';
  requiredSkills: string[];
  description: string;
  metadata: Record<string, any>;
  createdAt: number;
}

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
      const agent = await db.get<AgentRecord>(`agent:${id}`);
      if (!agent) {
        return response.status(404).json({ error: 'Agent not found' });
      }
      return response.status(200).json(agent);
    }
    
    // Return all agents
    const agentIds = await db.get<string[]>('agents:all') || [];
    const agentList = (await Promise.all(
      agentIds.map(agentId => db.get<AgentRecord>(`agent:${agentId}`))
    )).filter(Boolean);

    return response.status(200).json({
      agents: agentList,
      count: agentList.length
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
    
    const agent: AgentRecord = {
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

    await db.set(`agent:${id}`, agent);
    const agentIds = await db.get<string[]>('agents:all') || [];
    if (!agentIds.includes(id)) {
      agentIds.push(id);
      await db.set('agents:all', agentIds);
    }

    return response.status(201).json({
      success: true,
      agent,
      message: `Agent registered successfully`
    });
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
