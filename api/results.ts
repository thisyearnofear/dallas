/**
 * Agent Results API for Dallas Buyers Club
 * 
 * Handles result submission from autonomous agents:
 * - Validation results
 * - Research findings
 * - Cross-reference reports
 * - Statistical analyses
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage
const results = new Map<string, any>();
const validations = new Map<string, any>();

/**
 * POST /api/results - Submit agent results
 * 
 * Body:
 * {
 *   taskId: string,
 *   agentId: string,
 *   resultType: 'validation' | 'research' | 'cross_reference' | 'statistical_analysis',
 *   targetId: string,         // optimization log ID
 *   findings: {
 *     score: number,
 *     confidence: number,
 *     verified: boolean,
 *     zkProof?: string,       // proof for ZK verification
 *     summary: string,
 *     details: any
 *   },
 *   metadata?: Record<string, any>
 * }
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { method } = request;

  /**
   * POST - Submit results
   */
  if (method === 'POST') {
    const {
      taskId,
      agentId,
      resultType,
      targetId,
      findings,
      metadata
    } = request.body;

    // Validation
    if (!taskId || !agentId || !resultType || !targetId || !findings) {
      return response.status(400).json({
        error: 'Missing required fields: taskId, agentId, resultType, targetId, findings'
      });
    }

    const id = `result_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const result = {
      id,
      taskId,
      agentId,
      resultType,
      targetId,
      findings: {
        ...findings,
        submittedAt: Date.now()
      },
      metadata: metadata || {},
      status: 'pending_review',
      createdAt: Date.now()
    };

    results.set(id, result);

    // For validation tasks, also store in validations map
    if (resultType === 'validation') {
      validations.set(id, {
        ...result,
        validationType: 'quality',
        approved: false,
        stakeAmount: 0
      });
    }

    return response.status(201).json({
      success: true,
      result,
      message: 'Result submitted successfully, pending validation'
    });
  }

  /**
   * GET - Retrieve results
   * Query params:
   *   - id: specific result
   *   - taskId: results for a task
   *   - agentId: results from an agent
   *   - targetId: results for an optimization log
   *   - status: filter by status
   */
  if (method === 'GET') {
    const { id, taskId, agentId, targetId, status } = request.query;

    if (id) {
      const result = results.get(id as string);
      if (!result) {
        return response.status(404).json({ error: 'Result not found' });
      }
      return response.status(200).json(result);
    }

    let resultList = Array.from(results.values());

    if (taskId) {
      resultList = resultList.filter(r => r.taskId === taskId);
    }
    if (agentId) {
      resultList = resultList.filter(r => r.agentId === agentId);
    }
    if (targetId) {
      resultList = resultList.filter(r => r.targetId === targetId);
    }
    if (status) {
      resultList = resultList.filter(r => r.status === status);
    }

    return response.status(200).json({
      results: resultList,
      count: resultList.length
    });
  }

  /**
   * PUT - Update result status (for validation/review)
   * Body: { resultId, status, approved, validatorId, stakeAmount }
   */
  if (method === 'PUT') {
    const { resultId, status, approved, validatorId, stakeAmount, feedback } = request.body;

    if (!resultId) {
      return response.status(400).json({ error: 'Missing resultId' });
    }

    const result = results.get(resultId);
    if (!result) {
      return response.status(404).json({ error: 'Result not found' });
    }

    // Update result
    if (status) {
      result.status = status;
    }
    if (approved !== undefined) {
      result.approved = approved;
    }
    if (validatorId) {
      result.validatorId = validatorId;
    }
    if (stakeAmount !== undefined) {
      result.stakeAmount = stakeAmount;
    }
    if (feedback) {
      result.feedback = feedback;
    }

    result.updatedAt = Date.now();
    results.set(resultId, result);

    // Update corresponding validation if exists
    if (validations.has(resultId)) {
      const validation = validations.get(resultId);
      if (approved !== undefined) {
        validation.approved = approved;
      }
      if (stakeAmount !== undefined) {
        validation.stakeAmount = stakeAmount;
      }
      validations.set(resultId, validation);
    }

    return response.status(200).json({
      success: true,
      result,
      message: 'Result updated'
    });
  }

  return response.status(405).json({ error: 'Method not allowed' });
}