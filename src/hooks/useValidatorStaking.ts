/**
 * useValidatorStaking Hook - Complete Validator Staking Management
 * 
 * Provides comprehensive staking functionality for DBC validators:
 * - Stake/unstake DBC tokens
 * - Track validator reputation and tier
 * - Monitor staking rewards and penalties
 * - Manage validator eligibility
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: Enhances existing validator dashboard
 * - DRY: Single hook for all staking operations
 * - CLEAN: Clear separation between staking and validation logic
 * - MODULAR: Can be used across multiple components
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { DbcTokenService, ValidatorTier } from '../services/DbcTokenService';
import { SOLANA_CONFIG } from '../config/solana';
import { cacheService } from '../services/CacheService';

// Staking state interface
export interface ValidatorStakingState {
    // Staking info
    totalStaked: number;
    availableBalance: number;
    isValidValidator: boolean;
    minimumStakeRequired: number;

    // Active stakes
    activeStakes: Array<{
        account: PublicKey;
        amount: number;
        stakedAt: number;
        unlockAt: number;
        canUnstake: boolean;
        daysRemaining: number;
    }>;

    // Reputation & tier
    reputation: {
        totalValidations: number;
        accurateValidations: number;
        accuracyRate: number;
        tier: ValidatorTier;
        nextTierRequirements?: {
            validationsNeeded: number;
            accuracyNeeded: number;
        };
    };

    // Rewards
    rewards: {
        totalEarned: number;
        pendingRewards: number;
        lastRewardClaim: number;
        estimatedDailyRewards: number;
    };

    // Loading states
    isLoading: boolean;
    isStaking: boolean;
    isUnstaking: boolean;
    error: string | null;
}

// Staking transaction result
export interface StakingTransactionResult {
    success: boolean;
    signature?: string;
    error?: string;
}

// Hook return interface
export interface UseValidatorStakingReturn {
    // State
    stakingState: ValidatorStakingState;

    // Actions
    stakeTokens: (amount: number) => Promise<StakingTransactionResult>;
    unstakeTokens: (stakeAccount: PublicKey) => Promise<StakingTransactionResult>;
    claimRewards: () => Promise<StakingTransactionResult>;
    refreshStakingData: () => Promise<void>;

    // Utilities
    calculateStakingRewards: (validationCount: number, accuracyRate: number) => {
        baseReward: number;
        accuracyBonus: number;
        stakeBonus: number;
        totalReward: number;
    };
    getNextTierRequirements: () => { validationsNeeded: number; accuracyNeeded: number } | null;
    canStakeAmount: (amount: number) => { canStake: boolean; reason?: string };
    formatStakeAmount: (amount: number) => string;
}

/**
 * useValidatorStaking Hook
 * 
 * Comprehensive hook for managing validator staking operations
 */
export function useValidatorStaking(): UseValidatorStakingReturn {
    const { publicKey, signTransaction } = useWallet();
    const [connection] = useState(() => new Connection(
        SOLANA_CONFIG.rpcEndpoint[SOLANA_CONFIG.network],
        'confirmed'
    ));

    // Initial state
    const [stakingState, setStakingState] = useState<ValidatorStakingState>({
        totalStaked: 0,
        availableBalance: 0,
        isValidValidator: false,
        minimumStakeRequired: DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE,
        activeStakes: [],
        reputation: {
            totalValidations: 0,
            accurateValidations: 0,
            accuracyRate: 0,
            tier: 'Bronze',
        },
        rewards: {
            totalEarned: 0,
            pendingRewards: 0,
            lastRewardClaim: 0,
            estimatedDailyRewards: 0,
        },
        isLoading: false,
        isStaking: false,
        isUnstaking: false,
        error: null,
    });

    /**
     * Refresh all staking data
     * Uses caching to reduce RPC calls
     */
    const refreshStakingData = useCallback(async () => {
        if (!publicKey) return;

        setStakingState(prev => ({ ...prev, isLoading: true, error: null }));

        const cacheKey = `validator_${publicKey.toString()}`;
        const TTL = 30 * 1000; // 30 seconds

        try {
            // Check cache first
            const cached = cacheService.get<{
                totalStaked: number;
                availableBalance: number;
                isValidValidator: boolean;
                activeStakes: ValidatorStakingState['activeStakes'];
                reputation: ValidatorStakingState['reputation'];
                estimatedDailyRewards: number;
            }>(cacheKey);

            if (cached !== null) {
                console.log(`[CacheService] Cache hit for validator: ${publicKey.toString().slice(0, 8)}...`);
                setStakingState(prev => ({
                    ...prev,
                    totalStaked: cached.totalStaked,
                    availableBalance: cached.availableBalance,
                    isValidValidator: cached.isValidValidator,
                    activeStakes: cached.activeStakes,
                    reputation: cached.reputation,
                    rewards: {
                        ...prev.rewards,
                        estimatedDailyRewards: cached.estimatedDailyRewards,
                    },
                    isLoading: false,
                }));
                return;
            }

            console.log(`[CacheService] Cache miss for validator: ${publicKey.toString().slice(0, 8)}...`);

            // Fetch DBC balance
            const { balance } = await DbcTokenService.fetchDbcBalance(connection, publicKey);

            // Fetch validator stake info
            const stakeInfo = await DbcTokenService.getValidatorStake(connection, publicKey);

            // Check validator eligibility
            const validatorCheck = await DbcTokenService.isValidValidator(connection, publicKey);

            // Calculate next tier requirements
            const nextTierRequirements = calculateNextTierRequirements(
                stakeInfo.reputation.totalValidations,
                stakeInfo.reputation.accuracyRate,
                stakeInfo.reputation.tier
            );

            // Calculate estimated daily rewards
            const estimatedDailyRewards = calculateEstimatedDailyRewards(
                stakeInfo.totalStaked,
                stakeInfo.reputation.accuracyRate
            );

            // Process active stakes with time calculations
            const processedStakes = stakeInfo.activeStakes.map(stake => ({
                ...stake,
                daysRemaining: Math.max(0, Math.ceil((stake.unlockAt - Date.now()) / (24 * 60 * 60 * 1000))),
            }));

            // Prepare data for cache
            const cacheData = {
                totalStaked: stakeInfo.totalStaked,
                availableBalance: balance,
                isValidValidator: validatorCheck.isValid,
                activeStakes: processedStakes,
                reputation: {
                    ...stakeInfo.reputation,
                    nextTierRequirements,
                },
                estimatedDailyRewards,
            };

            // Store in cache
            cacheService.set(cacheKey, cacheData, TTL);

            setStakingState(prev => ({
                ...prev,
                totalStaked: stakeInfo.totalStaked,
                availableBalance: balance,
                isValidValidator: validatorCheck.isValid,
                activeStakes: processedStakes,
                reputation: {
                    ...stakeInfo.reputation,
                    nextTierRequirements,
                },
                rewards: {
                    ...prev.rewards,
                    estimatedDailyRewards,
                },
                isLoading: false,
            }));

        } catch (error) {
            console.error('Failed to refresh staking data:', error);
            setStakingState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load staking data',
            }));
        }
    }, [publicKey, connection]);

    /**
     * Stake DBC tokens
     */
    const stakeTokens = useCallback(async (amount: number): Promise<StakingTransactionResult> => {
        if (!publicKey || !signTransaction) {
            return { success: false, error: 'Wallet not connected' };
        }

        if (amount < DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE) {
            return {
                success: false,
                error: `Minimum stake is ${DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE} DBC`
            };
        }

        if (amount > stakingState.availableBalance) {
            return { success: false, error: 'Insufficient balance' };
        }

        setStakingState(prev => ({ ...prev, isStaking: true, error: null }));

        try {
            // Create stake transaction
            const transaction = await DbcTokenService.stakeTokens(
                connection,
                publicKey,
                amount,
                publicKey
            );

            // Sign and send transaction
            const signedTransaction = await signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());

            // Confirm transaction
            await connection.confirmTransaction(signature, 'confirmed');

            // Invalidate cache and refresh data after successful stake
            if (publicKey) {
                const cacheKey = `validator_${publicKey.toString()}`;
                cacheService.delete(cacheKey);
                console.log(`[CacheService] Invalidated validator cache after stake: ${publicKey.toString().slice(0, 8)}...`);
            }
            await refreshStakingData();

            setStakingState(prev => ({ ...prev, isStaking: false }));

            return { success: true, signature };

        } catch (error) {
            console.error('Staking failed:', error);
            setStakingState(prev => ({
                ...prev,
                isStaking: false,
                error: error instanceof Error ? error.message : 'Staking failed',
            }));

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Staking failed'
            };
        }
    }, [publicKey, signTransaction, connection, stakingState.availableBalance, refreshStakingData]);

    /**
     * Unstake DBC tokens
     */
    const unstakeTokens = useCallback(async (stakeAccount: PublicKey): Promise<StakingTransactionResult> => {
        if (!publicKey || !signTransaction) {
            return { success: false, error: 'Wallet not connected' };
        }

        // Find the stake to check if it can be unstaked
        const stake = stakingState.activeStakes.find(s => s.account.equals(stakeAccount));
        if (!stake) {
            return { success: false, error: 'Stake account not found' };
        }

        if (!stake.canUnstake) {
            return {
                success: false,
                error: `Stake is locked for ${stake.daysRemaining} more days`
            };
        }

        setStakingState(prev => ({ ...prev, isUnstaking: true, error: null }));

        try {
            // Create unstake transaction
            const transaction = await DbcTokenService.unstakeTokens(
                connection,
                publicKey,
                stakeAccount
            );

            // Sign and send transaction
            const signedTransaction = await signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());

            // Confirm transaction
            await connection.confirmTransaction(signature, 'confirmed');

            // Invalidate cache and refresh data after successful unstake
            if (publicKey) {
                const cacheKey = `validator_${publicKey.toString()}`;
                cacheService.delete(cacheKey);
                console.log(`[CacheService] Invalidated validator cache after unstake: ${publicKey.toString().slice(0, 8)}...`);
            }
            await refreshStakingData();

            setStakingState(prev => ({ ...prev, isUnstaking: false }));

            return { success: true, signature };

        } catch (error) {
            console.error('Unstaking failed:', error);
            setStakingState(prev => ({
                ...prev,
                isUnstaking: false,
                error: error instanceof Error ? error.message : 'Unstaking failed',
            }));

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unstaking failed'
            };
        }
    }, [publicKey, signTransaction, connection, stakingState.activeStakes, refreshStakingData]);

    /**
     * Claim pending rewards
     */
    const claimRewards = useCallback(async (): Promise<StakingTransactionResult> => {
        if (!publicKey || !signTransaction) {
            return { success: false, error: 'Wallet not connected' };
        }

        if (stakingState.rewards.pendingRewards <= 0) {
            return { success: false, error: 'No rewards to claim' };
        }

        try {
            // In production, this would create a claim rewards transaction
            // For now, simulate the claim
            console.log(`Claiming ${stakingState.rewards.pendingRewards} DBC rewards`);

            // Simulate transaction delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update rewards state
            setStakingState(prev => ({
                ...prev,
                rewards: {
                    ...prev.rewards,
                    totalEarned: prev.rewards.totalEarned + prev.rewards.pendingRewards,
                    pendingRewards: 0,
                    lastRewardClaim: Date.now(),
                },
            }));

            return { success: true, signature: 'simulated_claim_signature' };

        } catch (error) {
            console.error('Reward claim failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Reward claim failed'
            };
        }
    }, [publicKey, signTransaction, stakingState.rewards.pendingRewards]);

    /**
     * Calculate staking rewards
     */
    const calculateStakingRewards = useCallback((validationCount: number, accuracyRate: number) => {
        return DbcTokenService.calculateStakingRewards(
            validationCount,
            accuracyRate,
            stakingState.totalStaked
        );
    }, [stakingState.totalStaked]);

    /**
     * Get next tier requirements
     */
    const getNextTierRequirements = useCallback(() => {
        return stakingState.reputation.nextTierRequirements || null;
    }, [stakingState.reputation.nextTierRequirements]);

    /**
     * Check if user can stake a specific amount
     */
    const canStakeAmount = useCallback((amount: number): { canStake: boolean; reason?: string } => {
        if (amount <= 0) {
            return { canStake: false, reason: 'Amount must be positive' };
        }

        if (amount < DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE) {
            return {
                canStake: false,
                reason: `Minimum stake is ${DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE} DBC`
            };
        }

        if (amount > stakingState.availableBalance) {
            return { canStake: false, reason: 'Insufficient balance' };
        }

        return { canStake: true };
    }, [stakingState.availableBalance]);

    /**
     * Format stake amount for display
     */
    const formatStakeAmount = useCallback((amount: number): string => {
        return DbcTokenService.formatDbc(amount, { maxDecimals: 2 });
    }, []);

    // Load initial data when wallet connects
    useEffect(() => {
        if (publicKey) {
            refreshStakingData();
        } else {
            // Reset state when wallet disconnects
            setStakingState(prev => ({
                ...prev,
                totalStaked: 0,
                availableBalance: 0,
                isValidValidator: false,
                activeStakes: [],
                reputation: {
                    totalValidations: 0,
                    accurateValidations: 0,
                    accuracyRate: 0,
                    tier: 'Bronze',
                },
                rewards: {
                    totalEarned: 0,
                    pendingRewards: 0,
                    lastRewardClaim: 0,
                    estimatedDailyRewards: 0,
                },
            }));
        }
    }, [publicKey, refreshStakingData]);

    return {
        stakingState,
        stakeTokens,
        unstakeTokens,
        claimRewards,
        refreshStakingData,
        calculateStakingRewards,
        getNextTierRequirements,
        canStakeAmount,
        formatStakeAmount,
    };
}

/**
 * Calculate next tier requirements
 */
function calculateNextTierRequirements(
    totalValidations: number,
    accuracyRate: number,
    currentTier: ValidatorTier
): { validationsNeeded: number; accuracyNeeded: number } | undefined {
    const tiers = DbcTokenService.TIER_THRESHOLDS;

    switch (currentTier) {
        case 'Bronze':
            return {
                validationsNeeded: Math.max(0, tiers.Silver.minValidations - totalValidations),
                accuracyNeeded: Math.max(0, tiers.Silver.minAccuracy - accuracyRate),
            };
        case 'Silver':
            return {
                validationsNeeded: Math.max(0, tiers.Gold.minValidations - totalValidations),
                accuracyNeeded: Math.max(0, tiers.Gold.minAccuracy - accuracyRate),
            };
        case 'Gold':
            return {
                validationsNeeded: Math.max(0, tiers.Platinum.minValidations - totalValidations),
                accuracyNeeded: Math.max(0, tiers.Platinum.minAccuracy - accuracyRate),
            };
        case 'Platinum':
            return undefined; // Already at max tier
        default:
            return undefined;
    }
}

/**
 * Calculate estimated daily rewards based on stake and accuracy
 */
function calculateEstimatedDailyRewards(stakeAmount: number, accuracyRate: number): number {
    if (stakeAmount < DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE) {
        return 0;
    }

    // Base daily reward rate (simplified calculation)
    const baseRate = 0.001; // 0.1% daily base rate
    const accuracyMultiplier = 1 + (accuracyRate / 100); // Up to 2x for 100% accuracy
    const stakeMultiplier = Math.min(1.5, 1 + (stakeAmount / 10000) * 0.1); // Up to 1.5x for large stakes

    return stakeAmount * baseRate * accuracyMultiplier * stakeMultiplier;
}

export default useValidatorStaking;