/**
 * Attention Token Service
 * Handles all interactions with Bags API for treatment-specific token creation
 */

import { PublicKey, Connection } from '@solana/web3.js';
import { SOLANA_CONFIG } from '../config/solana';
import {
  AttentionToken,
  AttentionTokenAnalytics,
  AttentionTokenEligibility,
  AttentionTokenGraduationStatus,
  BagsAnalyticsResponse,
  BagsFeeRecipient,
  BagsFeeShareConfig,
  BagsTokenLaunchRequest,
  BagsTokenLaunchResponse,
  CreateAttentionTokenParams,
  SymbolGenerationOptions,
  ValidatorInfo,
} from '../types/attentionToken';

export class AttentionTokenService {
  private readonly bagsApiUrl: string;
  private readonly bagsApiKey: string;
  private readonly rateLimit: number;
  private requestCount: number = 0;
  private rateLimitResetTime: number = Date.now() + 3600000; // 1 hour from now

  constructor() {
    this.bagsApiUrl = SOLANA_CONFIG.bagsApi.url;
    this.bagsApiKey = SOLANA_CONFIG.bagsApi.key;
    this.rateLimit = SOLANA_CONFIG.bagsApi.rateLimit;

    if (!this.bagsApiKey) {
      console.warn('Bags API key not configured. Attention token features will be disabled.');
    }
  }

  /**
   * Check if case study is eligible for attention token creation
   */
  async checkEligibility(
    caseStudyPda: PublicKey,
    connection: Connection
  ): Promise<AttentionTokenEligibility> {
    try {
      const caseStudy = await this.fetchCaseStudy(caseStudyPda, connection);

      const reputationMet = caseStudy.reputationScore >= SOLANA_CONFIG.attentionToken.minReputationScore;
      const validatorsMet = caseStudy.validatorCount >= SOLANA_CONFIG.attentionToken.minValidators;
      const hasExistingToken = !!caseStudy.attentionTokenMint;

      return {
        isEligible: reputationMet && validatorsMet && !hasExistingToken,
        reasons: {
          reputationScore: {
            current: caseStudy.reputationScore,
            required: SOLANA_CONFIG.attentionToken.minReputationScore,
            met: reputationMet,
          },
          validatorCount: {
            current: caseStudy.validatorCount,
            required: SOLANA_CONFIG.attentionToken.minValidators,
            met: validatorsMet,
          },
          hasExistingToken,
        },
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      throw new Error('Failed to check attention token eligibility');
    }
  }

  /**
   * Create attention token via Bags API
   */
  async createAttentionToken(
    params: CreateAttentionTokenParams
  ): Promise<{ tokenMint: PublicKey; bondingCurve: PublicKey; signature: string }> {
    this.checkRateLimit();

    const symbol = this.generateSymbol(params.treatmentName);

    const request: BagsTokenLaunchRequest = {
      name: `${params.treatmentName} Attention`,
      symbol,
      description: params.description,
      imageUrl: params.imageUrl,
      metadata: {
        caseStudyPda: params.caseStudyPda.toString(),
        submitter: params.submitter.toString(),
        validators: params.validators.map((v) => v.publicKey.toString()),
        reputationScore: params.reputationScore,
        treatmentName: params.treatmentName,
        treatmentCategory: params.treatmentCategory,
      },
      initialBuy: {
        amount: SOLANA_CONFIG.attentionToken.initialLiquidity,
        buyerPublicKey: params.submitter.toString(),
      },
    };

    try {
      const response = await this.callBagsApi<BagsTokenLaunchResponse>('/token/launch', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.success || !response.response) {
        throw new Error(response.error || 'Failed to create attention token');
      }

      return {
        tokenMint: new PublicKey(response.response.mint),
        bondingCurve: new PublicKey(response.response.bondingCurve),
        signature: response.response.signature,
      };
    } catch (error) {
      console.error('Error creating attention token:', error);
      throw error;
    }
  }

  /**
   * Configure fee sharing for attention token
   */
  async configureFeeSharing(
    tokenMint: PublicKey,
    submitter: PublicKey,
    validators: ValidatorInfo[]
  ): Promise<void> {
    this.checkRateLimit();

    const totalValidatorShare = SOLANA_CONFIG.attentionToken.feeDistribution.validators;
    const validatorShares = this.calculateValidatorShares(validators, totalValidatorShare);

    const recipients: BagsFeeRecipient[] = [
      {
        publicKey: submitter.toString(),
        percentage: SOLANA_CONFIG.attentionToken.feeDistribution.submitter,
      },
      {
        publicKey: SOLANA_CONFIG.treasuryAddress,
        percentage: SOLANA_CONFIG.attentionToken.feeDistribution.platform,
      },
      ...validatorShares.map((share) => ({
        publicKey: share.publicKey.toString(),
        percentage: share.percentage,
      })),
    ];

    const config: BagsFeeShareConfig = {
      tokenMint: tokenMint.toString(),
      recipients,
    };

    try {
      await this.callBagsApi('/token/fee-sharing', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.error('Error configuring fee sharing:', error);
      throw new Error('Failed to configure fee sharing');
    }
  }

  /**
   * Get attention token analytics from Bags API
   */
  async getTokenAnalytics(tokenMint: PublicKey): Promise<AttentionTokenAnalytics> {
    this.checkRateLimit();

    try {
      const response = await this.callBagsApi<BagsAnalyticsResponse>(
        `/token/${tokenMint.toString()}/analytics`
      );

      if (!response.success || !response.response) {
        throw new Error(response.error || 'Failed to fetch analytics');
      }

      return response.response;
    } catch (error) {
      console.error('Error fetching token analytics:', error);
      throw error;
    }
  }

  /**
   * Check graduation status for attention token
   */
  async checkGraduationStatus(tokenMint: PublicKey): Promise<AttentionTokenGraduationStatus> {
    const analytics = await this.getTokenAnalytics(tokenMint);
    const { graduationThreshold } = SOLANA_CONFIG.attentionToken;

    const marketCapProgress = (analytics.marketCap / graduationThreshold.marketCap) * 100;
    const volumeProgress = (analytics.volume24h / graduationThreshold.dailyVolume) * 100;

    // Note: consecutiveDays would need to be tracked separately or via Bags API
    const consecutiveDaysProgress = 0; // Placeholder

    return {
      isEligible:
        analytics.marketCap >= graduationThreshold.marketCap &&
        analytics.volume24h >= graduationThreshold.dailyVolume,
      progress: {
        marketCap: {
          current: analytics.marketCap,
          required: graduationThreshold.marketCap,
          percentage: Math.min(marketCapProgress, 100),
        },
        dailyVolume: {
          current: analytics.volume24h,
          required: graduationThreshold.dailyVolume,
          percentage: Math.min(volumeProgress, 100),
        },
        consecutiveDays: {
          current: consecutiveDaysProgress,
          required: graduationThreshold.consecutiveDays,
          percentage: (consecutiveDaysProgress / graduationThreshold.consecutiveDays) * 100,
        },
      },
    };
  }

  /**
   * Generate token symbol from treatment name
   */
  generateSymbol(treatmentName: string, options?: SymbolGenerationOptions): string {
    const maxLength = options?.maxLength || 6;
    const prefix = options?.prefix || '';
    const suffix = options?.suffix || '';

    // Remove special characters and spaces
    let symbol = treatmentName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, maxLength);

    // If too short, pad with treatment category or generic
    if (symbol.length < 3) {
      symbol = symbol + 'ATT'; // Attention token
    }

    return prefix + symbol + suffix;
  }

  /**
   * Calculate validator fee shares based on reputation
   */
  private calculateValidatorShares(
    validators: ValidatorInfo[],
    totalPercentage: number
  ): { publicKey: PublicKey; percentage: number }[] {
    const totalReputation = validators.reduce((sum, v) => sum + v.reputation, 0);

    if (totalReputation === 0) {
      // Equal split if no reputation data
      const equalShare = totalPercentage / validators.length;
      return validators.map((v) => ({
        publicKey: v.publicKey,
        percentage: equalShare,
      }));
    }

    // Proportional to reputation
    return validators.map((v) => ({
      publicKey: v.publicKey,
      percentage: (v.reputation / totalReputation) * totalPercentage,
    }));
  }

  /**
   * Fetch case study data from blockchain
   */
  private async fetchCaseStudy(
    caseStudyPda: PublicKey,
    connection: Connection
  ): Promise<{
    reputationScore: number;
    validatorCount: number;
    attentionTokenMint?: PublicKey;
  }> {
    try {
      const { parseCaseStudyAccount } = await import('../utils/solanaUtils');
      
      const accountInfo = await connection.getAccountInfo(caseStudyPda);
      
      if (!accountInfo) {
        throw new Error('Case study not found on blockchain');
      }

      const parsed = parseCaseStudyAccount(accountInfo.data);

      return {
        reputationScore: parsed.reputationScore,
        validatorCount: parsed.approvalCount,
        attentionTokenMint: parsed.attentionTokenMint,
      };
    } catch (error) {
      console.error('Error fetching case study:', error);
      throw new Error('Failed to fetch case study from blockchain');
    }
  }

  /**
   * Make API call to Bags API with proper headers
   */
  private async callBagsApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.bagsApiKey) {
      throw new Error('Bags API key not configured');
    }

    const url = `${this.bagsApiUrl}${endpoint}`;
    const headers = {
      'x-api-key': this.bagsApiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Bags API configuration.');
      } else if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bad request');
      }
      throw new Error(`Bags API error: ${response.status} ${response.statusText}`);
    }

    this.requestCount++;
    return response.json();
  }

  /**
   * Check rate limit before making API calls
   */
  private checkRateLimit(): void {
    const now = Date.now();

    // Reset counter if hour has passed
    if (now >= this.rateLimitResetTime) {
      this.requestCount = 0;
      this.rateLimitResetTime = now + 3600000; // 1 hour
    }

    if (this.requestCount >= this.rateLimit) {
      const minutesUntilReset = Math.ceil((this.rateLimitResetTime - now) / 60000);
      throw new Error(
        `Rate limit exceeded. ${this.requestCount}/${this.rateLimit} requests used. Resets in ${minutesUntilReset} minutes.`
      );
    }
  }

  /**
   * Get remaining API calls before rate limit
   */
  getRemainingCalls(): number {
    const now = Date.now();
    if (now >= this.rateLimitResetTime) {
      return this.rateLimit;
    }
    return Math.max(0, this.rateLimit - this.requestCount);
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.bagsApiKey && !!this.bagsApiUrl;
  }
}

// Export singleton instance
export const attentionTokenService = new AttentionTokenService();
