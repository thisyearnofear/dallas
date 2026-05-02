/**
 * Validators API for Dallas Buyers Club
 * 
 * Handles validator operations:
 * - Registration & staking
 * - Validation review
 * - Reputation tracking
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/services/kv';

// Minimum stake to become validator
const MINIMUM_STAKE = 1000; // DBC

interface ValidatorRecord {
  id: string;
  address: string;
  name: string;
  stakeAmount: number;
  status: 'active' | 'inactive';
  specializations: string[];
  createdAt: number;
  validationsCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalStake: number;
  reputation?: ReputationRecord;
}

interface StakeRecord {
  validatorId: string;
  amount: number;
  locked: number;
  unlocked: number;
  stakedAt: number;
}

interface ReputationRecord {
  validatorId: string;
  score: number;
  trustLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalValidations: number;
  accurateValidations: number;
  lastValidationAt: number | null;
}

/**
 * POST /api/validators - Register and stake
 * 
 * Body:
 * {
 *   address: string,        // validator wallet address
 *   name: string,
 *   stakeAmount: number,  // DBC amount to stake
 *   specializations: string[]  // ['quality', 'accuracy', 'safety']
 * }
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { method } = request;

  /**
   * POST - Register validator
   */
  if (method === 'POST') {
    const { address, name, stakeAmount, specializations } = request.body;

    if (!address || !name) {
      return response.status(400).json({
        error: 'Missing required fields: address, name'
      });
    }

    // Check if already registered
    const existing = await db.get<ValidatorRecord>(`validator:${address}`);
    if (existing) {
      return response.status(400).json({
        error: 'Validator already registered'
      });
    }

    // Validate stake amount
    const actualStake = stakeAmount || 0;
    if (actualStake < MINIMUM_STAKE) {
      return response.status(400).json({
        error: `Minimum stake of ${MINIMUM_STAKE} DBC required`,
        minimumStake: MINIMUM_STAKE
      });
    }

    const validator = {
      id: `validator_${Date.now()}`,
      address,
      name,
      stakeAmount: actualStake,
      status: 'active',
      specializations: specializations || ['quality'],
      createdAt: Date.now(),
      validationsCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      totalStake: actualStake
    };

    // Store validator
    await db.set(`validator:${address}`, validator);
    
    // Add to index
    const index = await db.get<string[]>('validators:index') || [];
    if (!index.includes(address)) {
      index.push(address);
      await db.set('validators:index', index);
    }

    // Initialize stake record
    await db.set(`stake:${address}`, {
      validatorId: address,
      amount: actualStake,
      locked: actualStake,
      unlocked: 0,
      stakedAt: Date.now()
    });

    // Initialize reputation
    await db.set(`reputation:${address}`, {
      validatorId: address,
      score: 100, // Starting reputation
      trustLevel: 'bronze', // bronze | silver | gold | platinum
      totalValidations: 0,
      accurateValidations: 0,
      lastValidationAt: null
    });

    return response.status(201).json({
      success: true,
      validator,
      message: `Validator registered with ${actualStake} DBC stake`
    });
  }

  /**
   * GET - Get validator info
   * Query params:
   *   - address: specific validator
   *   - status: filter by status
   *   - includeReputation: include reputation data
   */
  if (method === 'GET') {
    const { address, status, includeReputation } = request.query;

    if (address) {
      const validator = await db.get<ValidatorRecord>(`validator:${address}`);
      if (!validator) {
        return response.status(404).json({ error: 'Validator not found' });
      }

      let data = { ...validator };

      // Include reputation if requested
      if (includeReputation === 'true') {
        const reputation = await db.get<ReputationRecord>(`reputation:${address}`);
        if (reputation) {
          data.reputation = reputation;
        }
      }

      return response.status(200).json(data);
    }

    // List all validators - fetch from index
    const index = await db.get<string[]>('validators:index') || [];
    let validatorList = await Promise.all(
      index.map(async (addr: string) => {
        const v = await db.get<ValidatorRecord>(`validator:${addr}`);
        return v ? { ...v } : null;
      })
    );
    validatorList = validatorList.filter((validator): validator is ValidatorRecord => Boolean(validator));

    if (status) {
      validatorList = validatorList.filter(v => v.status === status);
    }

    return response.status(200).json({
      validators: validatorList,
      count: validatorList.length
    });
  }

  /**
   * PUT - Update validator (stake more, update status)
   * Body: { address, action, stakeAmount }
   */
  if (method === 'PUT') {
    const { address, action, stakeAmount } = request.body;

    if (!address) {
      return response.status(400).json({ error: 'Missing address' });
    }

    // Fetch validator from KV
    const validator = await db.get<ValidatorRecord>(`validator:${address}`);
    if (!validator) {
      return response.status(404).json({ error: 'Validator not found' });
    }

    if (action === 'stake') {
      if (!stakeAmount || stakeAmount <= 0) {
        return response.status(400).json({ error: 'Invalid stake amount' });
      }

      validator.stakeAmount += stakeAmount;
      validator.totalStake += stakeAmount;
      await db.set(`validator:${address}`, validator);

      // Update stake record
      const stakeRecord = await db.get<StakeRecord>(`stake:${address}`);
      if (stakeRecord) {
        stakeRecord.amount += stakeAmount;
        stakeRecord.locked += stakeAmount;
        await db.set(`stake:${address}`, stakeRecord);
      }

      return response.status(200).json({
        success: true,
        validator,
        message: `Staked additional ${stakeAmount} DBC`
      });
    }

    if (action === 'unstake') {
      if (!stakeAmount || stakeAmount <= 0) {
        return response.status(400).json({ error: 'Invalid unstake amount' });
      }

      // Use KV for stake fetch
      const stakeRecord = await db.get<StakeRecord>(`stake:${address}`);
      const available = stakeRecord?.locked || 0;
      
      if (stakeAmount > available) {
        return response.status(400).json({ error: 'Insufficient staked amount' });
      }

      validator.stakeAmount -= stakeAmount;
      validator.totalStake -= stakeAmount;
      await db.set(`validator:${address}`, validator);

      if (stakeRecord) {
        stakeRecord.locked -= stakeAmount;
        stakeRecord.unlocked += stakeAmount;
        await db.set(`stake:${address}`, stakeRecord);
      }

      return response.status(200).json({
        success: true,
        validator,
        message: `Unstaked ${stakeAmount} DBC`
      });
    }

    if (action === 'deactivate') {
      validator.status = 'inactive';
      await db.set(`validator:${address}`, validator);

      return response.status(200).json({
        success: true,
        validator,
        message: 'Validator deactivated'
      });
    }

    return response.status(400).json({ error: 'Invalid action' });
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
