/**
 * Privacy Integration Tests
 * 
 * Comprehensive tests for the complete privacy service integration:
 * - NoirService ZK proof generation
 * - LightProtocolService compression
 * - ArciumMPCService threshold decryption
 * - PrivacyServiceManager coordination
 * - Validator staking functionality
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PublicKey } from '@solana/web3.js';
import {
    noirService,
    lightProtocolService,
    arciumMPCService,
    privacyServiceManager
} from '../services/privacy';
import { DbcTokenService } from '../services/DbcTokenService';

// Mock data for testing
const mockOptimizationLogData = {
    baselineSeverity: 8,
    outcomeSeverity: 3,
    durationDays: 30,
    costUsd: 500,
    architectureProtocol: 'Test Protocol',
    hasBaseline: true,
    hasOutcome: true,
    hasDuration: true,
    hasProtocol: true,
    hasCost: true,
};

const mockValidator = new PublicKey('11111111111111111111111111111111');

describe('Privacy Service Integration', () => {
    beforeAll(async () => {
        // Initialize all privacy services
        await privacyServiceManager.initialize();
    });

    describe('NoirService', () => {
        it('should initialize successfully', async () => {
            expect(noirService.isInitialized()).toBe(true);
        });

        it('should load circuit metadata', () => {
            const circuits = noirService.getAvailableCircuits();
            expect(circuits).toHaveLength(4);
            expect(circuits.map(c => c.type)).toEqual([
                'benchmark_delta',
                'execution_duration',
                'data_completeness',
                'resource_range'
            ]);
        });

        it('should generate performance improvement proof', async () => {
            const proof = await noirService.proveSymptomImprovement({
                baseline_severity: mockOptimizationLogData.baselineSeverity,
                outcome_severity: mockOptimizationLogData.outcomeSeverity,
            });

            expect(proof.circuitType).toBe('benchmark_delta');
            expect(proof.proof).toBeInstanceOf(Uint8Array);
            expect(proof.verified).toBe(true);
            expect((proof.publicInputs as any).min_improvement_percent).toBe(20);
        });

        it('should generate duration verification proof', async () => {
            const proof = await noirService.proveDurationVerification({
                duration_days: mockOptimizationLogData.durationDays,
            });

            expect(proof.circuitType).toBe('execution_duration');
            expect(proof.proof).toBeInstanceOf(Uint8Array);
            expect(proof.verified).toBe(true);
        });

        it('should generate data completeness proof', async () => {
            const proof = await noirService.proveDataCompleteness({
                has_baseline: mockOptimizationLogData.hasBaseline,
                has_outcome: mockOptimizationLogData.hasOutcome,
                has_duration: mockOptimizationLogData.hasDuration,
                has_protocol: mockOptimizationLogData.hasProtocol,
                has_cost: mockOptimizationLogData.hasCost,
            });

            expect(proof.circuitType).toBe('data_completeness');
            expect(proof.proof).toBeInstanceOf(Uint8Array);
            expect(proof.verified).toBe(true);
        });

        it('should generate cost range proof', async () => {
            const proof = await noirService.proveCostRange({
                cost_usd_cents: mockOptimizationLogData.costUsd * 100,
            });

            expect(proof.circuitType).toBe('resource_range');
            expect(proof.proof).toBeInstanceOf(Uint8Array);
            expect(proof.verified).toBe(true);
        });

        it('should generate all validation proofs', async () => {
            const proofs = await noirService.generateValidationProofs(mockOptimizationLogData);

            expect(proofs).toHaveLength(4);
            expect(proofs.every(p => p.verified)).toBe(true);
            expect(proofs.map(p => p.circuitType)).toEqual([
                'benchmark_delta',
                'execution_duration',
                'data_completeness',
                'resource_range'
            ]);
        });

        it('should validate input constraints', async () => {
            // Test invalid severity range
            await expect(noirService.proveSymptomImprovement({
                baseline_severity: 11, // Invalid: > 10
                outcome_severity: 5,
            })).rejects.toThrow('Baseline severity must be 1-10');

            // Test invalid duration
            await expect(noirService.proveDurationVerification({
                duration_days: -1, // Invalid: negative
            })).rejects.toThrow('Duration must be positive');
        });
    });

    describe('LightProtocolService', () => {
        it('should initialize successfully', async () => {
            expect(lightProtocolService.isInitialized()).toBe(true);
        });

        it('should calculate compression ratios', () => {
            const dataSize = 1000;
            const compression = lightProtocolService.calculateCompression(dataSize, {
                compressionRatio: 10,
                storeFullData: false,
            });

            expect(compression.originalSize).toBe(1000);
            expect(compression.compressedSize).toBe(100);
            expect(compression.ratio).toBe(10);
            expect(compression.savings).toBe(900);
        });

        it('should compress optimization log data', async () => {
            const compressionData = {
                encryptedBaseline: new TextEncoder().encode(mockOptimizationLogData.baselineSeverity.toString()),
                encryptedOutcome: new TextEncoder().encode(mockOptimizationLogData.outcomeSeverity.toString()),
                architectureProtocol: mockOptimizationLogData.architectureProtocol,
                durationDays: mockOptimizationLogData.durationDays,
                costUSD: mockOptimizationLogData.costUsd,
                metadataHash: crypto.getRandomValues(new Uint8Array(32)),
            };

            const compressed = await lightProtocolService.compressOptimizationLog(compressionData);

            expect(compressed.compressedAccount).toBeInstanceOf(PublicKey);
            expect(compressed.originalSize).toBeGreaterThan(0);
            expect(compressed.compressedSize).toBeLessThan(compressed.originalSize);
            expect(compressed.achievedRatio).toBeGreaterThan(1);
            expect(compressed.merkleRoot).toBeInstanceOf(Uint8Array);
            expect(compressed.compressionProof).toBeInstanceOf(Uint8Array);
        });

        it('should verify compression proofs', async () => {
            const compressionData = {
                encryptedBaseline: new TextEncoder().encode('test'),
                encryptedOutcome: new TextEncoder().encode('test'),
                architectureProtocol: 'test',
                durationDays: 30,
                costUSD: 100,
                metadataHash: crypto.getRandomValues(new Uint8Array(32)),
            };

            const compressed = await lightProtocolService.compressOptimizationLog(compressionData);
            const isValid = await lightProtocolService.verifyCompression(compressed);

            expect(isValid).toBe(true);
        });

        it('should format bytes correctly', () => {
            expect(lightProtocolService.formatBytes(500)).toBe('500 B');
            expect(lightProtocolService.formatBytes(1500)).toBe('1.46 KB');
            expect(lightProtocolService.formatBytes(1500000)).toBe('1.43 MB');
        });
    });

    describe('ArciumMPCService', () => {
        it('should initialize successfully', async () => {
            expect(arciumMPCService.isInitialized()).toBe(true);
        });

        it('should create MPC access request', async () => {
            const request = await arciumMPCService.requestAccess(mockValidator, {
                optimizationLogId: 'test_optimization_log',
                justification: 'This is a test justification for accessing encrypted optimization log data for research purposes.',
                requesterType: 'researcher',
            });

            expect(request.id).toBeDefined();
            expect(request.optimizationLogId).toBe('test_optimization_log');
            expect(request.requester.equals(mockValidator)).toBe(true);
            expect(request.status).toBe('pending');
            expect(request.committee).toHaveLength(5);
            expect(request.threshold).toBe(3);
        });

        it('should approve access request', async () => {
            // Create request first
            const request = await arciumMPCService.requestAccess(mockValidator, {
                optimizationLogId: 'test_optimization_log_2',
                justification: 'Test justification for approval test case with sufficient detail.',
                requesterType: 'validator',
            });

            // Approve with committee members
            const shareCommitment = crypto.getRandomValues(new Uint8Array(32));
            const approvedRequest = await arciumMPCService.approveAccess(
                request.id,
                request.committee[0].validatorAddress,
                shareCommitment
            );

            expect(approvedRequest.status).toBe('active');
            expect(approvedRequest.committee[0].hasApproved).toBe(true);
            expect(approvedRequest.committee[0].shareCommitment).toEqual(shareCommitment);
        });

        it('should reach threshold and enable decryption', async () => {
            // Create request
            const request = await arciumMPCService.requestAccess(mockValidator, {
                optimizationLogId: 'test_threshold',
                justification: 'Test case for threshold approval with detailed research justification.',
                requesterType: 'researcher',
            });

            // Approve with enough committee members to reach threshold
            const shareCommitment = crypto.getRandomValues(new Uint8Array(32));

            for (let i = 0; i < request.threshold; i++) {
                await arciumMPCService.approveAccess(
                    request.id,
                    request.committee[i].validatorAddress,
                    shareCommitment
                );
            }

            const finalRequest = arciumMPCService.getSession(request.id);
            expect(finalRequest?.status).toBe('approved');

            // Test decryption
            const decryption = await arciumMPCService.decryptData(request.id, mockValidator);
            expect(decryption.success).toBe(true);
            expect(decryption.data).toBeInstanceOf(Uint8Array);
            expect(decryption.approvedBy).toHaveLength(request.threshold);
        });

        it('should track committee status', async () => {
            const request = await arciumMPCService.requestAccess(mockValidator, {
                optimizationLogId: 'test_committee_status',
                justification: 'Test case for committee status tracking with proper justification length.',
                requesterType: 'validator',
            });

            const status = arciumMPCService.getCommitteeStatus(request.id);
            expect(status).toBeDefined();
            expect(status!.total).toBe(5);
            expect(status!.approved).toBe(0);
            expect(status!.threshold).toBe(3);
            expect(status!.progress).toBe(0);

            // Approve one member
            await arciumMPCService.approveAccess(
                request.id,
                request.committee[0].validatorAddress,
                crypto.getRandomValues(new Uint8Array(32))
            );

            const updatedStatus = arciumMPCService.getCommitteeStatus(request.id);
            expect(updatedStatus!.approved).toBe(1);
            expect(updatedStatus!.progress).toBeCloseTo(1 / 3);
        });
    });

    describe('PrivacyServiceManager', () => {
        it('should initialize all services', async () => {
            const status = await privacyServiceManager.initialize();

            expect(status.noir.initialized).toBe(true);
            expect(status.lightProtocol.initialized).toBe(true);
            expect(status.arciumMPC.initialized).toBe(true);
            expect(status.allInitialized).toBe(true);
        });

        it('should process complete privacy optimization log', async () => {
            const result = await privacyServiceManager.processPrivacyOptimizationLog(mockOptimizationLogData, {
                generateProofs: true,
                compressData: true,
                createMPCSession: false,
            });

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.zkProofs).toHaveLength(4);
            expect(result.compression.compressionRatio).toBeGreaterThan(1);
            expect(result.processingTime).toBeGreaterThan(0);
        });

        it('should validate privacy configuration', () => {
            const validation = privacyServiceManager.validatePrivacyConfig();

            expect(validation.isValid).toBe(true);
            expect(validation.issues).toHaveLength(0);
        });

        it('should provide privacy statistics', () => {
            const stats = privacyServiceManager.getPrivacyStats();

            expect(stats.noir.circuitsLoaded).toBe(4);
            expect(stats.lightProtocol.totalCompressed).toBeGreaterThanOrEqual(0);
            expect(stats.arciumMPC.activeSessions).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Validator Staking Integration', () => {
        it('should calculate staking rewards correctly', () => {
            const rewards = DbcTokenService.calculateStakingRewards(100, 85, 5000);

            expect(rewards.baseReward).toBeGreaterThan(0);
            expect(rewards.accuracyBonus).toBeGreaterThan(0); // 85% accuracy should get bonus
            expect(rewards.stakeBonus).toBeGreaterThan(0); // 5000 DBC stake should get bonus
            expect(rewards.totalReward).toBe(
                rewards.baseReward + rewards.accuracyBonus + rewards.stakeBonus
            );
        });

        it('should calculate validator tiers correctly', () => {
            expect(DbcTokenService.calculateTier(0, 0)).toBe('Bronze');
            expect(DbcTokenService.calculateTier(25, 60)).toBe('Silver');
            expect(DbcTokenService.calculateTier(100, 70)).toBe('Gold');
            expect(DbcTokenService.calculateTier(500, 80)).toBe('Platinum');
        });

        it('should validate minimum staking requirements', () => {
            expect(DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE).toBe(100);
            expect(DbcTokenService.STAKING_CONFIG.LOCK_DAYS).toBe(7);
        });

        it('should format DBC amounts correctly', () => {
            expect(DbcTokenService.formatDbc(1000)).toBe('1,000 DBC');
            expect(DbcTokenService.formatDbc(1500000, { compact: true })).toBe('1.5M DBC');
            expect(DbcTokenService.formatDbc(2500, { compact: true })).toBe('2.5K DBC');
        });

        it('should convert between base units correctly', () => {
            const amount = 100.5;
            const baseUnits = DbcTokenService.toBaseUnits(amount);
            const converted = DbcTokenService.fromBaseUnits(baseUnits);

            expect(converted).toBeCloseTo(amount, 6);
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle complete optimization log submission flow', async () => {
            // 1. Generate ZK proofs
            const proofs = await noirService.generateValidationProofs(mockOptimizationLogData);
            expect(proofs).toHaveLength(4);
            expect(proofs.every(p => p.verified)).toBe(true);

            // 2. Compress data
            const compressionData = {
                encryptedBaseline: new TextEncoder().encode(mockOptimizationLogData.baselineSeverity.toString()),
                encryptedOutcome: new TextEncoder().encode(mockOptimizationLogData.outcomeSeverity.toString()),
                architectureProtocol: mockOptimizationLogData.architectureProtocol,
                durationDays: mockOptimizationLogData.durationDays,
                costUSD: mockOptimizationLogData.costUsd,
                metadataHash: crypto.getRandomValues(new Uint8Array(32)),
            };

            const compressed = await lightProtocolService.compressOptimizationLog(compressionData);
            expect(compressed.achievedRatio).toBeGreaterThan(1);

            // 3. Create MPC session for research access
            const mpcRequest = await arciumMPCService.requestAccess(mockValidator, {
                optimizationLogId: 'integration_test',
                justification: 'Integration test for complete optimization log submission flow with research access.',
                requesterType: 'researcher',
            });

            expect(mpcRequest.status).toBe('pending');
            expect(mpcRequest.committee).toHaveLength(5);

            console.log('✅ Complete optimization log submission flow tested successfully');
        });

        it('should handle validator staking and validation flow', async () => {
            // 1. Check validator requirements
            const minStake = DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE;
            expect(minStake).toBe(100);

            // 2. Calculate rewards for validation work
            const rewards = DbcTokenService.calculateStakingRewards(50, 90, 1000);
            expect(rewards.totalReward).toBeGreaterThan(rewards.baseReward);

            // 3. Check tier progression
            const tier = DbcTokenService.calculateTier(50, 90);
            expect(tier).toBe('Silver'); // Should be Silver with 50 validations at 90% accuracy

            console.log('✅ Validator staking and validation flow tested successfully');
        });
    });
});

describe('Error Handling', () => {
    it('should handle service initialization failures gracefully', async () => {
        // Test that services can handle initialization failures without crashing
        const status = privacyServiceManager.getStatus();
        expect(status).toBeDefined();
        expect(typeof status.allInitialized).toBe('boolean');
    });

    it('should handle invalid proof inputs', async () => {
        await expect(noirService.proveSymptomImprovement({
            baseline_severity: 0, // Invalid
            outcome_severity: 5,
        })).rejects.toThrow();
    });

    it('should handle insufficient MPC justification', async () => {
        await expect(arciumMPCService.requestAccess(mockValidator, {
            optimizationLogId: 'test',
            justification: 'Too short', // Less than 50 characters
            requesterType: 'researcher',
        })).rejects.toThrow('Justification must be at least 50 characters');
    });
});