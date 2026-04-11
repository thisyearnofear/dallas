/**
 * Validators API for Dallas Buyers Club
 * 
 * Handles validator operations:
 * - Registration & staking
 * - Validation review
 * - Reputation tracking
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage
const validators = new Map<string, any>();
const stakes = new Map<string, any>();
const validations = new Map<string, any>();
const reputations = new Map<string, any>();

// Minimum stake to become validator
const MINIMUM_STAKE = 1000; // DBC

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
    if (validators.has(address)) {
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

    validators.set(address, validator);

    // Initialize stake record
    stakes.set(address, {
      validatorId: address,
      amount: actualStake,
      locked: actualStake,
      unlocked: 0,
      stakedAt: Date.now()
    });

    // Initialize reputation
    reputations.set(address, {
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
      const validator = validators.get(address as string);
      if (!validator) {
        return response.status(404).json({ error: 'Validator not found' });
      }

      let data = { ...validator };

      // Include reputation if requested
      if (includeReputation === 'true') {
        const reputation = reputations.get(address as string);
        if (reputation) {
          data.reputation = reputation;
        }
      }

      return response.status(200).json(data);
    }

    // List all validators
    let validatorList = Array.from(validators.values());

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

    const validator = validators.get(address);
    if (!validator) {
      return response.status(404).json({ error: 'Validator not found' });
    }

    if (action === 'stake') {
      if (!stakeAmount || stakeAmount <= 0) {
        return response.status(400).json({ error: 'Invalid stake amount' });
      }

      validator.stakeAmount += stakeAmount;
      validator.totalStake += stakeAmount;
      validators.set(address, validator);

      const stakeRecord = stakes.get(address);
      if (stakeRecord) {
        stakeRecord.amount += stakeAmount;
        stakeRecord.locked += stakeAmount;
        stakes.set(address, stakeRecord);
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

      const stakeRecord = stakes.get(address);
      const available = stakeRecord?.locked || 0;
      
      if (stakeAmount > available) {
        return response.status(400).json({ error: 'Insufficient staked amount' });
      }

      validator.stakeAmount -= stakeAmount;
      validator.totalStake -= stakeAmount;
      validators.set(address, validator);

      if (stakeRecord) {
        stakeRecord.locked -= stakeAmount;
        stakeRecord.unlocked += stakeAmount;
        stakes.set(address, stakeRecord);
      }

      return response.status(200).json({
        success: true,
        validator,
        message: `Unstaked ${stakeAmount} DBC`
      });
    }

    if (action === 'deactivate') {
      validator.status = 'inactive';
      validators.set(address, validator);

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