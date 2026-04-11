/**
 * ValidatorService - Handles validator operations
 * 
 * Integrates with /api/validators and /api/validations endpoints
 */

import { PublicKey } from '@solana/web3.js';

const API_BASE = '/api';

export interface ValidatorProfile {
    id: string;
    address: string;
    name: string;
    stakeAmount: number;
    status: 'active' | 'inactive';
    specializations: string[];
    validationsCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalStake: number;
}

export interface ValidationRecord {
    id: string;
    optimizationLogId: string;
    status: 'pending' | 'approved' | 'rejected';
    validatorType: string;
    submittedAt: number;
    validatedAt?: number;
    validationScore?: number;
    feedback?: string;
    stakeAmount: number;
}

export interface ValidatorReputation {
    validatorId: string;
    score: number;
    trustLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
    totalValidations: number;
    accurateValidations: number;
    lastValidationAt: number | null;
}

class ValidatorService {
    private useApi: boolean = true;

    /**
     * Register as a validator
     */
    async registerValidator(
        address: string,
        name: string,
        stakeAmount: number,
        specializations?: string[]
    ): Promise<ValidatorProfile | null> {
        if (this.useApi) {
            try {
                const res = await fetch(`${API_BASE}/validators`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address,
                        name,
                        stakeAmount,
                        specializations: specializations || ['quality']
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log(`✅ Validator registered via API`);
                    return data.validator;
                }
            } catch (error) {
                console.warn('⚠️ Validator registration failed:', error);
            }
        }
        return null;
    }

    /**
     * Get validator profile
     */
    async getValidator(address: string): Promise<ValidatorProfile | null> {
        if (this.useApi) {
            try {
                const res = await fetch(`${API_BASE}/validators?address=${encodeURIComponent(address)}`);
                if (res.ok) {
                    const data = await res.json();
                    return data;
                }
            } catch (error) {
                console.warn('⚠️ Failed to fetch validator:', error);
            }
        }
        return null;
    }

    /**
     * Get pending validations to review
     */
    async getPendingValidations(validatorType?: string): Promise<ValidationRecord[]> {
        if (this.useApi) {
            try {
                const url = validatorType 
                    ? `${API_BASE}/validations?status=pending&validatorType=${validatorType}`
                    : `${API_BASE}/validations?status=pending`;
                    
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    return data.validations || [];
                }
            } catch (error) {
                console.warn('⚠️ Failed to fetch pending validations:', error);
            }
        }
        return [];
    }

    /**
     * Submit validation review (approve/reject)
     */
    async submitValidation(
        validationId: string,
        validatorId: string,
        action: 'approve' | 'reject',
        validationScore?: number,
        feedback?: string
    ): Promise<ValidationRecord | null> {
        if (this.useApi) {
            try {
                const res = await fetch(`${API_BASE}/validations`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: validationId,
                        validatorId,
                        action,
                        validationScore,
                        feedback
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log(`✅ Validation ${action}ed via API`);
                    return data.validation;
                }
            } catch (error) {
                console.warn('⚠️ Validation submit failed:', error);
            }
        }
        return null;
    }

    /**
     * Get validation history for an address
     */
    async getValidationHistory(address: string): Promise<ValidationRecord[]> {
        // Filter all validations by submitter
        // In a real impl, would filter by validator address
        if (this.useApi) {
            try {
                const res = await fetch(`${API_BASE}/validations`);
                if (res.ok) {
                    const data = await res.json();
                    return data.validations || [];
                }
            } catch (error) {
                console.warn('⚠️ Failed to fetch validations:', error);
            }
        }
        return [];
    }

    /**
     * Stake more DBC
     */
    async stakeMore(address: string, amount: number): Promise<ValidatorProfile | null> {
        if (this.useApi) {
            try {
                const res = await fetch(`${API_BASE}/validators`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address,
                        action: 'stake',
                        stakeAmount: amount
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    return data.validator;
                }
            } catch (error) {
                console.warn('⚠️ Stake failed:', error);
            }
        }
        return null;
    }

    /**
     * Get reputation data
     */
    async getReputation(address: string): Promise<ValidatorReputation | null> {
        if (this.useApi) {
            try {
                const res = await fetch(`${API_BASE}/validators?address=${encodeURIComponent(address)}&includeReputation=true`);
                if (res.ok) {
                    const data = await res.json();
                    return data.reputation || null;
                }
            } catch (error) {
                console.warn('⚠️ Failed to fetch reputation:', error);
            }
        }
        return null;
    }
}

export const validatorService = new ValidatorService();
export default validatorService;