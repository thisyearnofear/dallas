/**
 * Agent Tasks API for Dallas Buyers Club
 * 
 * Handles task discovery and assignment for autonomous agents
 * Uses Vercel KV for persistence
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/services/kv';

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
    const { agentId, status } = request.body;
    const id = request.body.id || request.body.taskId;

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
