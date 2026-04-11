/**
 * Agent Tasks API for Dallas Buyers Club
 * 
 * Handles task discovery and assignment for autonomous agents
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory task storage
const tasks = new Map<string, any>();
const assignments = new Map<string, any>();

// Initialize mock tasks
function initializeTasks() {
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
      description: 'Cross-reference tool-call optimization approaches across benchmarks.',
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
      description: 'Perform meta-analysis on eval optimization logs using MPC committee.',
      metadata: { committeeSize: 5 },
      createdAt: Date.now()
    },
    {
      id: 'task_004',
      type: 'validation',
      status: 'available',
      targetId: 'opt_log_004',
      rewardDbc: 350,
      complexity: 'medium',
      requiredSkills: ['noir_verification', 'tool_chain_analysis'],
      description: 'Validate tool-call loop optimization results.',
      metadata: { circuit: 'execution_duration', minDays: 7, maxDays: 90 },
      createdAt: Date.now()
    },
    {
      id: 'task_005',
      type: 'research',
      status: 'available',
      targetId: 'opt_log_005',
      rewardDbc: 200,
      complexity: 'low',
      requiredSkills: ['web_search', 'literature_review'],
      description: 'Research latest context window optimization techniques.',
      metadata: { focusArea: 'context' },
      createdAt: Date.now()
    }
  ];

  for (const task of mockTasks) {
    tasks.set(task.id, task);
  }
}

initializeTasks();

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
    const { type, complexity, status, agentId } = request.query;

    let taskList = Array.from(tasks.values());

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

    // If agentId provided, include assignment status
    if (agentId) {
      const agentAssignments = Array.from(assignments.entries())
        .filter(([_, assignment]) => assignment.agentId === agentId)
        .map(([taskId, assignment]) => ({ taskId, ...assignment }));
      
      return response.status(200).json({
        tasks: taskList,
        assignments: agentAssignments,
        count: taskList.length
      });
    }

    return response.status(200).json({
      tasks: taskList,
      count: taskList.length
    });
  }

  /**
   * POST /api/tasks - Create a new task (human or system)
   */
  if (method === 'POST') {
    const {
      type,
      targetId,
      rewardDbc,
      complexity,
      requiredSkills,
      description,
      metadata
    } = request.body;

    if (!type || !targetId || !description) {
      return response.status(400).json({
        error: 'Missing required fields: type, targetId, description'
      });
    }

    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const task = {
      id,
      type, // 'validation' | 'research' | 'cross_reference' | 'statistical_analysis'
      status: 'available',
      targetId,
      rewardDbc: rewardDbc || 100,
      complexity: complexity || 'medium',
      requiredSkills: requiredSkills || [],
      description,
      metadata: metadata || {},
      createdAt: Date.now()
    };

    tasks.set(id, task);

    return response.status(201).json({
      success: true,
      task,
      message: 'Task created successfully'
    });
  }

  /**
   * PUT /api/tasks - Assign or update task
   * Body: { taskId, agentId, action }
   */
  if (method === 'PUT') {
    const { taskId, agentId, action } = request.body;

    if (!taskId) {
      return response.status(400).json({ error: 'Missing taskId' });
    }

    const task = tasks.get(taskId);
    if (!task) {
      return response.status(404).json({ error: 'Task not found' });
    }

    if (action === 'assign') {
      if (!agentId) {
        return response.status(400).json({ error: 'Missing agentId for assignment' });
      }

      if (task.status !== 'available') {
        return response.status(400).json({ error: 'Task is not available for assignment' });
      }

      // Update task status
      task.status = 'assigned';
      task.assignedTo = agentId;
      task.assignedAt = Date.now();
      tasks.set(taskId, task);

      // Record assignment
      assignments.set(taskId, {
        taskId,
        agentId,
        assignedAt: Date.now(),
        status: 'in_progress'
      });

      return response.status(200).json({
        success: true,
        task,
        message: `Task ${taskId} assigned to agent ${agentId}`
      });
    }

    if (action === 'complete') {
      if (!agentId) {
        return response.status(400).json({ error: 'Missing agentId' });
      }

      task.status = 'completed';
      task.completedAt = Date.now();
      tasks.set(taskId, task);

      return response.status(200).json({
        success: true,
        task,
        message: 'Task marked as completed'
      });
    }

    return response.status(400).json({ error: 'Invalid action' });
  }

  return response.status(405).json({ error: 'Method not allowed' });
}