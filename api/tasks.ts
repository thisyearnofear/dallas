/**
 * Agent Tasks API for Dallas Buyers Club
 * 
 * Handles task discovery and assignment for autonomous agents
 * Uses Vercel KV for persistence
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/services/kv';

// Initialize mock tasks on module load
initializeTasks();

interface TaskRecord {
  id: string;
  type: string;
  status: string;
  targetId: string;
  rewardDbc: number;
  complexity: string;
  requiredSkills: string[];
  description: string;
  metadata: Record<string, any>;
  assignedTo?: string;
  assignedAt?: number;
  createdAt: number;
  updatedAt?: number;
}

async function initializeTasks() {
  const mockTasks = [
    {
      id: 'task_001',
      type: 'validation',
      status: 'available',
      targetId: 'opt_log_001',
      rewardDbc: 250,
      complexity: 'medium',
      requiredSkills: ['noir_verification', 'mpc_compute'],
      description: 'Verify benchmark improvement for context window optimization using ZK proofs.',
      metadata: { circuit: 'benchmark_delta', minImprovement: 20 },
      createdAt: Date.now()
    },
    {
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
    },
    {
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
    },
    {
      id: 'task_004',
      type: 'validation',
      status: 'available',
      targetId: 'opt_log_004',
      rewardDbc: 300,
      complexity: 'high',
      requiredSkills: ['noir_verification', 'tool_chain_analysis'],
      description: 'Validate tool-call loop optimization results.',
      metadata: { circuit: 'execution_duration', minDays: 7, maxDays: 90 },
      createdAt: Date.now()
    }
  ];

  await Promise.all(mockTasks.map(task => db.set(`task:${task.id}`, task)));
  const existingTaskIds = await db.get<string[]>('tasks:all');
  if (!existingTaskIds?.length) {
    await db.set('tasks:all', mockTasks.map(t => t.id));
  }
}

/**
 * GET /api/tasks - Discover available tasks
 * Query params:
 *   - type: filter by task type
 *   - complexity: filter by complexity
 *   - status: filter by status
 *   - agentId: filter by assigned agent
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { method } = request;

  if (method === 'GET') {
    const { type, complexity, status, id } = request.query;

    if (id) {
      const task = await db.get<TaskRecord>(`task:${id}`);
      if (!task) {
        return response.status(404).json({ error: 'Task not found' });
      }
      return response.status(200).json(task);
    }

    let taskList: any[] = [];
    const taskIds = (await db.get<string[]>('tasks:all')) || [];
    taskList = await Promise.all(
      taskIds.map(async (tid: string) => db.get(`task:${tid}`))
    );

    // Apply filters
    if (type) {
      taskList = taskList.filter(t => t.type === type);
    }
    if (complexity) {
      taskList = taskList.filter(t => t.complexity === complexity);
    }
    if (status) {
      taskList = taskList.filter(t => t.status === status);
    }

    return response.status(200).json({ tasks: taskList.filter(Boolean) });
  }

  if (method === 'POST') {
    const { type, targetId, rewardDbc, complexity, requiredSkills, description, metadata } = request.body;

    if (!type || !targetId || !rewardDbc) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    const id = `task_${Date.now()}`;
    const task = {
      id,
      type,
      targetId,
      rewardDbc,
      complexity: complexity || 'medium',
      requiredSkills: requiredSkills || [],
      description: description || '',
      metadata: metadata || {},
      status: 'available',
      createdAt: Date.now()
    };

    await db.set(`task:${id}`, task);
    const taskIds = ((await db.get('tasks:all')) || []) as string[];
    taskIds.push(id);
    await db.set('tasks:all', taskIds);

    return response.status(201).json({ task });
  }

  if (method === 'PUT') {
    const { id, agentId, status } = request.body;

    if (!id) {
      return response.status(400).json({ error: 'Task ID required' });
    }

    const existing = await db.get<TaskRecord>(`task:${id}`);
    if (!existing) {
      return response.status(404).json({ error: 'Task not found' });
    }

    const updates: any = { ...request.body, updatedAt: Date.now() };
    if (agentId && existing.status === 'available') {
      updates.status = 'assigned';
      updates.assignedTo = agentId;
      updates.assignedAt = Date.now();
    }

    const updated = { ...existing, ...updates };
    await db.set(`task:${id}`, updated);

    return response.status(200).json({ task: updated });
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
