/**
 * Validation Reviews API for Dallas Buyers Club
 * 
 * Handles validation review workflow:
 * - Submit for validation
 * - Get pending validations
 * - Approve/reject with stake
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/services/kv';

// Initialize mock data on module load
initializeMockData();

function initializeMockData() {
  const mockValidations = [
    {
      id: 'pending_001',
      optimizationLogId: 'opt_log_001',
      submitter: 'user_abc123',
      submittedAt: Date.now() - 86400000,
      status: 'pending',
      stakeAmount: 250,
      priority: 'medium'
    },
    {
      id: 'pending_002',
      optimizationLogId: 'opt_log_002',
      submitter: 'user_def456',
      submittedAt: Date.now() - 172800000,
      status: 'pending',
      stakeAmount: 150,
      priority: 'low'
    }
  ];

  for (const v of mockValidations) {
    db.set(`validation:${v.id}`, v);
  }
  db.set('validations:pending', mockValidations.map(v => v.id));
}

await initializeMockData();

/**
 * POST /api/validations - Submit for validation
 * Body: { optimizationLogId, submitter, validatorType, stakeAmount }
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { method } = request;

  if (method === 'POST') {
    const { optimizationLogId, submitter, validatorType, stakeAmount, priority } = request.body;

    if (!optimizationLogId || !submitter) {
      return response.status(400).json({
        error: 'Missing required fields: optimizationLogId, submitter'
      });
    }

    const id = `pending_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const validation = {
      id,
      optimizationLogId,
      submitter,
      validatorType: validatorType || 'quality',
      submittedAt: Date.now(),
      status: 'pending',
      stakeAmount: stakeAmount || 100,
      priority: priority || 'medium',
      zkProof: null,
      validationScore: null
    };

    pendingValidations.set(id, validation);

    return response.status(201).json({
      success: true,
      validation,
      message: 'Submitted for validation'
    });
  }

  /**
   * GET - Get validations
   * Query params:
   *   - id: specific validation
   *   - status: 'pending' | 'approved' | 'rejected'
   *   - optimizationLogId: filter by log
   *   - validatorType: filter by type
   */
  if (method === 'GET') {
    const { id, status, optimizationLogId, validatorType } = request.query;

    if (id) {
      const validation = pendingValidations.get(id as string) || completedValidations.get(id as string);
      if (!validation) {
        return response.status(404).json({ error: 'Validation not found' });
      }
      return response.status(200).json(validation);
    }

    // Check both maps
    const allValidations = [
      ...Array.from(pendingValidations.values()),
      ...Array.from(completedValidations.values())
    ];

    let filtered = allValidations;

    if (status) {
      filtered = filtered.filter(v => v.status === status);
    }
    if (optimizationLogId) {
      filtered = filtered.filter(v => v.optimizationLogId === optimizationLogId);
    }
    if (validatorType) {
      filtered = filtered.filter(v => v.validatorType === validatorType);
    }

    return response.status(200).json({
      validations: filtered,
      count: filtered.length
    });
  }

  /**
   * PUT - Approve or reject validation
   * Body: { id, validatorId, action, validationScore, feedback }
   */
  if (method === 'PUT') {
    const { id, validatorId, action, validationScore, feedback, stakeAmount } = request.body;

    if (!id || !validatorId || !action) {
      return response.status(400).json({
        error: 'Missing required fields: id, validatorId, action'
      });
    }

    const validation = pendingValidations.get(id);
    if (!validation) {
      return response.status(404).json({ error: 'Validation not found' });
    }

    if (action === 'approve') {
      validation.status = 'approved';
      validation.validatorId = validatorId;
      validation.validatedAt = Date.now();
      validation.validationScore = validationScore || 85;
      validation.feedback = feedback || 'Approved - meets quality standards';
      
      // Move to completed
      pendingValidations.delete(id);
      completedValidations.set(id, validation);

      return response.status(200).json({
        success: true,
        validation,
        message: 'Validation approved'
      });
    }

    if (action === 'reject') {
      validation.status = 'rejected';
      validation.validatorId = validatorId;
      validation.validatedAt = Date.now();
      validation.validationScore = validationScore || 0;
      validation.feedback = feedback || 'Rejected - does not meet standards';
      
      // Move to completed
      pendingValidations.delete(id);
      completedValidations.set(id, validation);

      return response.status(200).json({
        success: true,
        validation,
        message: 'Validation rejected'
      });
    }

    return response.status(400).json({ error: 'Invalid action - use approve or reject' });
  }

  return response.status(405).json({ error: 'Method not allowed' });
}