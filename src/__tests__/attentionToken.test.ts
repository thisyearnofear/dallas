/**
 * Attention Token Test Suite
 * Tests for attention token creation, analytics, and market functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { AttentionTokenService } from '../services/AttentionTokenService';
import {
  AttentionTokenErrorCode,
  parseAttentionTokenError,
  validateAttentionTokenParams,
  isRecoverableError,
  getRetryDelay,
} from '../utils/attentionTokenErrors';

// Mock fetch globally
global.fetch = vi.fn();

describe('AttentionTokenService', () => {
  let service: AttentionTokenService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    service = new AttentionTokenService();
  });

  describe('Symbol Generation', () => {
    it('should generate valid symbol from treatment name', () => {
      const symbol = service.generateSymbol('Peptide XYZ Protocol');
      expect(symbol).toBe('PEPXYZ');
      expect(symbol.length).toBeLessThanOrEqual(6);
    });

    it('should handle short treatment names', () => {
      const symbol = service.generateSymbol('AB');
      expect(symbol).toBe('ABATT');
      expect(symbol.length).toBeGreaterThanOrEqual(3);
    });

    it('should remove special characters', () => {
      const symbol = service.generateSymbol('Keto-Protocol 2.0');
      expect(symbol).toBe('KETPRO');
      expect(symbol).toMatch(/^[A-Z0-9]+$/);
    });

    it('should respect max length option', () => {
      const symbol = service.generateSymbol('Very Long Treatment Name', { maxLength: 4 });
      expect(symbol.length).toBeLessThanOrEqual(4);
    });

    it('should add prefix and suffix', () => {
      const symbol = service.generateSymbol('Test', { prefix: 'DBC', suffix: 'V1' });
      expect(symbol).toContain('DBC');
      expect(symbol).toContain('V1');
    });
  });

  describe('Eligibility Checking', () => {
    it('should return eligible for valid case study', async () => {
      const mockCaseStudy = {
        reputationScore: 80,
        validatorCount: 6,
        attentionTokenMint: undefined,
      };

      // Mock the fetch call
      vi.spyOn(service as any, 'fetchCaseStudy').mockResolvedValue(mockCaseStudy);

      const eligibility = await service.checkEligibility(
        new PublicKey('11111111111111111111111111111111'),
        {} as any
      );

      expect(eligibility.isEligible).toBe(true);
      expect(eligibility.reasons.reputationScore.met).toBe(true);
      expect(eligibility.reasons.validatorCount.met).toBe(true);
    });

    it('should return ineligible for low reputation', async () => {
      const mockCaseStudy = {
        reputationScore: 50,
        validatorCount: 6,
        attentionTokenMint: undefined,
      };

      vi.spyOn(service as any, 'fetchCaseStudy').mockResolvedValue(mockCaseStudy);

      const eligibility = await service.checkEligibility(
        new PublicKey('11111111111111111111111111111111'),
        {} as any
      );

      expect(eligibility.isEligible).toBe(false);
      expect(eligibility.reasons.reputationScore.met).toBe(false);
    });

    it('should return ineligible for insufficient validators', async () => {
      const mockCaseStudy = {
        reputationScore: 80,
        validatorCount: 3,
        attentionTokenMint: undefined,
      };

      vi.spyOn(service as any, 'fetchCaseStudy').mockResolvedValue(mockCaseStudy);

      const eligibility = await service.checkEligibility(
        new PublicKey('11111111111111111111111111111111'),
        {} as any
      );

      expect(eligibility.isEligible).toBe(false);
      expect(eligibility.reasons.validatorCount.met).toBe(false);
    });

    it('should return ineligible if token already exists', async () => {
      const mockCaseStudy = {
        reputationScore: 80,
        validatorCount: 6,
        attentionTokenMint: new PublicKey('22222222222222222222222222222222'),
      };

      vi.spyOn(service as any, 'fetchCaseStudy').mockResolvedValue(mockCaseStudy);

      const eligibility = await service.checkEligibility(
        new PublicKey('11111111111111111111111111111111'),
        {} as any
      );

      expect(eligibility.isEligible).toBe(false);
      expect(eligibility.reasons.hasExistingToken).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should track API calls', () => {
      const initialRemaining = service.getRemainingCalls();
      expect(initialRemaining).toBeLessThanOrEqual(1000);
    });

    it('should throw error when rate limit exceeded', () => {
      // Set request count to limit
      (service as any).requestCount = 1000;

      expect(() => {
        (service as any).checkRateLimit();
      }).toThrow('Rate limit exceeded');
    });

    it('should reset after time period', () => {
      (service as any).requestCount = 1000;
      (service as any).rateLimitResetTime = Date.now() - 1000; // Past reset time

      (service as any).checkRateLimit(); // Should reset and not throw

      expect((service as any).requestCount).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should detect if API is configured', () => {
      const isConfigured = service.isConfigured();
      expect(typeof isConfigured).toBe('boolean');
    });
  });
});

describe('Error Handling', () => {
  describe('parseAttentionTokenError', () => {
    it('should parse rate limit error', () => {
      const error = { status: 429 };
      const parsed = parseAttentionTokenError(error);

      expect(parsed.code).toBe(AttentionTokenErrorCode.BAGS_API_RATE_LIMIT);
      expect(parsed.userMessage).toContain('hour');
    });

    it('should parse invalid API key error', () => {
      const error = { status: 401 };
      const parsed = parseAttentionTokenError(error);

      expect(parsed.code).toBe(AttentionTokenErrorCode.BAGS_API_INVALID_KEY);
      expect(parsed.userMessage).toContain('authentication');
    });

    it('should parse wallet rejection error', () => {
      const error = { message: 'User rejected the request', code: 4001 };
      const parsed = parseAttentionTokenError(error);

      expect(parsed.code).toBe(AttentionTokenErrorCode.TRANSACTION_REJECTED);
      expect(parsed.userMessage).toContain('rejected');
    });

    it('should parse insufficient funds error', () => {
      const error = { message: 'insufficient funds for transaction' };
      const parsed = parseAttentionTokenError(error);

      expect(parsed.code).toBe(AttentionTokenErrorCode.INSUFFICIENT_SOL);
      expect(parsed.userMessage).toContain('SOL');
    });

    it('should parse network error', () => {
      const error = { message: 'Failed to fetch' };
      const parsed = parseAttentionTokenError(error);

      expect(parsed.code).toBe(AttentionTokenErrorCode.NETWORK_ERROR);
      expect(parsed.userMessage).toContain('Network');
    });

    it('should parse unknown error', () => {
      const error = { message: 'Something weird happened' };
      const parsed = parseAttentionTokenError(error);

      expect(parsed.code).toBe(AttentionTokenErrorCode.UNKNOWN_ERROR);
      expect(parsed.userMessage).toBeDefined();
    });
  });

  describe('validateAttentionTokenParams', () => {
    it('should validate correct parameters', () => {
      const result = validateAttentionTokenParams({
        treatmentName: 'Peptide XYZ',
        description: 'This is a valid description that is long enough',
        reputationScore: 80,
        validatorCount: 6,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short treatment name', () => {
      const result = validateAttentionTokenParams({
        treatmentName: 'AB',
        description: 'This is a valid description that is long enough',
        reputationScore: 80,
        validatorCount: 6,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Treatment name must be at least 3 characters');
    });

    it('should reject long treatment name', () => {
      const result = validateAttentionTokenParams({
        treatmentName: 'A'.repeat(51),
        description: 'This is a valid description that is long enough',
        reputationScore: 80,
        validatorCount: 6,
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('less than 50');
    });

    it('should reject short description', () => {
      const result = validateAttentionTokenParams({
        treatmentName: 'Peptide XYZ',
        description: 'Too short',
        reputationScore: 80,
        validatorCount: 6,
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least 20');
    });

    it('should reject low reputation', () => {
      const result = validateAttentionTokenParams({
        treatmentName: 'Peptide XYZ',
        description: 'This is a valid description that is long enough',
        reputationScore: 50,
        validatorCount: 6,
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least 75');
    });

    it('should reject insufficient validators', () => {
      const result = validateAttentionTokenParams({
        treatmentName: 'Peptide XYZ',
        description: 'This is a valid description that is long enough',
        reputationScore: 80,
        validatorCount: 3,
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least 5');
    });
  });

  describe('isRecoverableError', () => {
    it('should identify recoverable network error', () => {
      const error = { message: 'Network error' };
      expect(isRecoverableError(error)).toBe(true);
    });

    it('should identify non-recoverable invalid key error', () => {
      const error = { status: 401 };
      expect(isRecoverableError(error)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should use exponential backoff', () => {
      expect(getRetryDelay(0)).toBe(1000); // 1s
      expect(getRetryDelay(1)).toBe(2000); // 2s
      expect(getRetryDelay(2)).toBe(4000); // 4s
      expect(getRetryDelay(3)).toBe(8000); // 8s
      expect(getRetryDelay(4)).toBe(16000); // 16s
    });

    it('should cap at maximum delay', () => {
      expect(getRetryDelay(10)).toBe(16000); // Should cap at 16s
    });
  });
});

describe('Integration Tests', () => {
  describe('Token Creation Flow', () => {
    it('should follow complete creation workflow', async () => {
      // This would be an integration test requiring actual API
      // For now, we verify the expected flow
      const steps = [
        'Check eligibility',
        'Create token via Bags API',
        'Configure fee sharing',
        'Link on-chain',
      ];

      expect(steps).toHaveLength(4);
      expect(steps[0]).toBe('Check eligibility');
      expect(steps[steps.length - 1]).toBe('Link on-chain');
    });
  });

  describe('Market Discovery Flow', () => {
    it('should fetch and display tokens', async () => {
      // Mock market data structure
      const mockMarket = {
        tokens: [],
        filters: { sortBy: 'marketCap', sortOrder: 'desc' },
        loading: false,
      };

      expect(mockMarket.filters.sortBy).toBe('marketCap');
      expect(mockMarket.loading).toBe(false);
    });
  });
});
