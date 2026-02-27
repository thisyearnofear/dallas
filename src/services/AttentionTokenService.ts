/**
 * Attention Token Service
 * Handles all interactions with Bags API for architecture-specific token creation
 * 
 * NETWORK COMPATIBILITY:
 * - Bags API only works on mainnet (creates real tokens with real value)
 * - Our app currently runs on devnet for testing
 * - This service detects network and provides appropriate behavior:
 *   * Mainnet: Full Bags API integration (real tokens)
 *   * Devnet: Mock implementation for testing (simulated tokens)
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
  OptimizationLogWithAttentionToken,
  CreateAttentionTokenParams,
  SymbolGenerationOptions,
  ValidatorInfo,
} from '../types/attentionToken';

export class AttentionTokenService {
  private readonly bagsApiUrl: string;
  private readonly bagsApiKey: string;
  private readonly bagsPartnerConfig: string;
  private readonly rateLimit: number;
  private requestCount: number = 0;
  private rateLimitResetTime: number = Date.now() + 3600000; // 1 hour from now
  private readonly isMainnet: boolean;
  private readonly mockTokens: Map<string, AttentionToken> = new Map();

  constructor() {
    this.bagsApiUrl = SOLANA_CONFIG.bagsApi.url;
    this.bagsApiKey = SOLANA_CONFIG.bagsApi.key;
    this.bagsPartnerConfig = SOLANA_CONFIG.bagsApi.partnerConfig;
    this.rateLimit = SOLANA_CONFIG.bagsApi.rateLimit;
    this.isMainnet = SOLANA_CONFIG.network === 'mainnet-beta';

    if (!this.bagsApiKey && this.isMainnet) {
      console.warn('Bags API key not configured. Attention token features will be disabled on mainnet.');
    }

    if (!this.isMainnet) {
      console.log('📢 Attention Token Service running in DEVNET MODE (mock tokens for testing)');
    }
  }

  /**
   * Check if we're on mainnet (real tokens) or devnet (mock tokens)
   */
  isRealTokenMode(): boolean {
    return this.isMainnet;
  }

  /**
   * Check if optimization log is eligible for attention token creation
   */
  async checkEligibility(
    optimizationLogPda: PublicKey,
    connection: Connection
  ): Promise<AttentionTokenEligibility> {
    try {
      const optimizationLog = await this.fetchOptimizationLog(optimizationLogPda, connection);

      const reputationMet = optimizationLog.reputationScore >= SOLANA_CONFIG.attentionToken.minReputationScore;
      const validatorsMet = optimizationLog.validatorCount >= SOLANA_CONFIG.attentionToken.minValidators;
      const hasExistingToken = !!optimizationLog.attentionTokenMint;

      return {
        isEligible: reputationMet && validatorsMet && !hasExistingToken,
        reasons: {
          reputationScore: {
            current: optimizationLog.reputationScore,
            required: SOLANA_CONFIG.attentionToken.minReputationScore,
            met: reputationMet,
          },
          validatorCount: {
            current: optimizationLog.validatorCount,
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
   * Create attention token via Bags API (mainnet) or mock (devnet)
   * ENHANCED: Support for both optimization log tokens and standalone community tokens
   */
  async createAttentionToken(
    params: CreateAttentionTokenParams
  ): Promise<{ tokenMint: PublicKey; bondingCurve: PublicKey; signature: string }> {
    // Devnet: Create mock token for testing
    if (!this.isMainnet) {
      console.log('🔧 Creating MOCK attention token for devnet testing');
      return this.createMockAttentionToken(params);
    }

    // Mainnet: Create real token via Bags API
    return this.createRealAttentionToken(params);
  }

  /**
   * Create a real attention token via Bags API (mainnet only)
   */
  private async createRealAttentionToken(
    params: CreateAttentionTokenParams
  ): Promise<{ tokenMint: PublicKey; bondingCurve: PublicKey; signature: string }> {
    this.checkRateLimit();

    const symbol = this.generateSymbol(params.techniqueName);
    
    // Determine token name based on mode
    const isCommunity = params.isCommunityToken || !params.optimizationLogPda;
    const tokenName = isCommunity 
      ? params.techniqueName  // Communities use name directly (e.g., "Collagen Community")
      : `${params.techniqueName} Attention`; // Case studies append "Attention"

    const request: BagsTokenLaunchRequest = {
      name: tokenName,
      symbol,
      description: params.description,
      imageUrl: params.imageUrl,
      partnerConfig: this.bagsPartnerConfig || undefined,
      metadata: {
        optimizationLogPda: params.optimizationLogPda?.toString(),
        submitter: params.submitter.toString(),
        validators: params.validators?.map((v) => v.publicKey.toString()) || [],
        reputationScore: params.reputationScore || 0,
        techniqueName: params.techniqueName,
        techniqueCategory: params.techniqueCategory,
        // ADDED: Community-specific metadata
        communityCategory: params.communityCategory,
        isCommunityToken: isCommunity,
        socialEnabled: params.socialEnabled || false,
        farcasterChannel: undefined, // Will be set after Farcaster channel creation
      },
      initialBuy: isCommunity ? undefined : { // Communities don't require initial buy
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
   * Create a mock attention token for devnet testing
   */
  private async createMockAttentionToken(
    params: CreateAttentionTokenParams
  ): Promise<{ tokenMint: PublicKey; bondingCurve: PublicKey; signature: string }> {
    // Generate deterministic mock addresses based on params
    const seed = `${params.techniqueName}-${params.submitter.toString()}-${Date.now()}`;
    const tokenMint = this.generateMockPublicKey(seed + '-mint');
    const bondingCurve = this.generateMockPublicKey(seed + '-curve');
    
    // Store mock token for later retrieval
    const mockToken: AttentionToken = {
      mint: tokenMint,
      bondingCurve: bondingCurve,
      optimizationLogPda: params.optimizationLogPda || new PublicKey('11111111111111111111111111111111'),
      name: params.isCommunityToken ? params.techniqueName : `${params.techniqueName} Attention`,
      symbol: this.generateSymbol(params.techniqueName),
      description: params.description,
      imageUrl: params.imageUrl,
      submitter: params.submitter,
      validators: params.validators || [],
      techniqueName: params.techniqueName,
      techniqueCategory: params.techniqueCategory,
      reputationScore: params.reputationScore || 0,
      createdAt: Date.now(),
      analytics: {
        marketCap: 0,
        volume24h: 0,
        volumeAll: 0,
        holders: 1,
        price: 0,
        priceChange24h: 0,
        lifetimeFees: 0,
        transactions: 0,
        createdAt: Date.now(),
        lastTradeAt: Date.now(),
      },
    };
    
    this.mockTokens.set(tokenMint.toString(), mockToken);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Mock attention token created:', {
      mint: tokenMint.toString(),
      name: mockToken.name,
      symbol: mockToken.symbol,
    });

    return {
      tokenMint,
      bondingCurve,
      signature: 'mock-signature-' + Date.now(),
    };
  }

  /**
   * Generate a deterministic mock PublicKey for testing
   */
  private generateMockPublicKey(seed: string): PublicKey {
    // Create a deterministic 32-byte array from seed
    const bytes = new Uint8Array(32);
    for (let i = 0; i < seed.length && i < 32; i++) {
      bytes[i] = seed.charCodeAt(i) % 256;
    }
    // Ensure first byte is non-zero for valid address
    if (bytes[0] === 0) bytes[0] = 1;
    return new PublicKey(bytes);
  }

  /**
   * Configure fee sharing for attention token
   */
  async configureFeeSharing(
    tokenMint: PublicKey,
    submitter: PublicKey,
    validators: ValidatorInfo[]
  ): Promise<void> {
    // Devnet: Skip fee sharing configuration (mock)
    if (!this.isMainnet) {
      console.log('🔧 Skipping fee sharing config for mock token (devnet)');
      return;
    }

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
      ...validatorShares,
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
      throw error;
    }
  }

  /**
   * Get token analytics
   */
  async getTokenAnalytics(tokenMint: PublicKey): Promise<AttentionTokenAnalytics> {
    // Devnet: Return mock analytics
    if (!this.isMainnet) {
      const mockToken = this.mockTokens.get(tokenMint.toString());
      if (mockToken?.analytics) {
        // Simulate some activity
        return {
          ...mockToken.analytics,
          price: Math.random() * 0.001,
          priceChange24h: (Math.random() - 0.5) * 20,
          volume24h: Math.random() * 1000,
        };
      }
      return this.getDefaultMockAnalytics();
    }

    // Mainnet: Get real analytics from Bags API
    try {
      const response = await this.callBagsApi<BagsAnalyticsResponse>(
        `/token/${tokenMint.toString()}/analytics`,
        { method: 'GET' }
      );

      if (!response.success || !response.response) {
        throw new Error(response.error || 'Failed to fetch analytics');
      }

      const data = response.response;
      return {
        marketCap: data.marketCap,
        volume24h: data.volume24h,
        volumeAll: data.volumeAll,
        holders: data.holders,
        price: data.price,
        priceChange24h: data.priceChange24h,
        lifetimeFees: data.lifetimeFees,
        transactions: data.transactions,
        createdAt: data.createdAt,
        lastTradeAt: data.lastTradeAt,
      };
    } catch (error) {
      console.error('Error fetching token analytics:', error);
      throw error;
    }
  }

  /**
   * Get default mock analytics for devnet
   */
  private getDefaultMockAnalytics(): AttentionTokenAnalytics {
    return {
      marketCap: Math.floor(Math.random() * 50000),
      volume24h: Math.floor(Math.random() * 5000),
      volumeAll: Math.floor(Math.random() * 50000),
      holders: Math.floor(Math.random() * 100) + 1,
      price: Math.random() * 0.001,
      priceChange24h: (Math.random() - 0.5) * 20,
      lifetimeFees: Math.floor(Math.random() * 1000),
      transactions: Math.floor(Math.random() * 500),
      createdAt: Date.now() - Math.floor(Math.random() * 86400000 * 30),
      lastTradeAt: Date.now(),
    };
  }

  /**
   * Get graduation status for attention token
   */
  async getGraduationStatus(
    tokenMint: PublicKey
  ): Promise<AttentionTokenGraduationStatus> {
    const analytics = await this.getTokenAnalytics(tokenMint);
    const threshold = SOLANA_CONFIG.attentionToken.graduationThreshold;

    return {
      isEligible:
        analytics.marketCap >= threshold.marketCap &&
        analytics.volume24h >= threshold.dailyVolume,
      progress: {
        marketCap: {
          current: analytics.marketCap,
          required: threshold.marketCap,
          percentage: Math.min(100, (analytics.marketCap / threshold.marketCap) * 100),
        },
        dailyVolume: {
          current: analytics.volume24h,
          required: threshold.dailyVolume,
          percentage: Math.min(100, (analytics.volume24h / threshold.dailyVolume) * 100),
        },
        consecutiveDays: {
          current: 0, // Would need historical data
          required: threshold.consecutiveDays,
          percentage: 0,
        },
      },
    };
  }

  /**
   * Fetch optimization log from blockchain
   */
  private async fetchOptimizationLog(
    optimizationLogPda: PublicKey,
    connection: Connection
  ): Promise<OptimizationLogWithAttentionToken> {
    try {
      const accountInfo = await connection.getAccountInfo(optimizationLogPda);
      if (!accountInfo) {
        throw new Error('Case study not found');
      }

      // Parse optimization log account data
      // This is a simplified parser - in production, use proper deserialization
      const data = accountInfo.data;
      
      // Mock parsing for now - in production, use Anchor IDL
      return {
        publicKey: optimizationLogPda,
        submitter: new PublicKey(data.slice(8, 40)),
        techniqueName: 'Sample Architecture',
        techniqueCategory: 'context_management',
        description: 'Sample description',
        imageUrl: 'https://example.com/image.png',
        reputationScore: 85,
        validatorCount: 5,
        validators: [],
        attentionTokenMint: undefined,
        createdAt: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching optimization log:', error);
      throw error;
    }
  }

  /**
   * Generate symbol from architecture name
   */
  generateSymbol(name: string, options: SymbolGenerationOptions = {}): string {
    const { maxLength = 6, prefix = '', suffix = '' } = options;
    
    // Remove special characters and spaces
    const cleaned = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    
    // Take first N characters
    const availableLength = maxLength - prefix.length - suffix.length;
    const base = cleaned.slice(0, availableLength);
    
    return `${prefix}${base}${suffix}`;
  }

  /**
   * Calculate validator shares based on reputation
   */
  private calculateValidatorShares(
    validators: ValidatorInfo[],
    totalShare: number
  ): BagsFeeRecipient[] {
    if (validators.length === 0) return [];

    const totalReputation = validators.reduce((sum, v) => sum + v.reputation, 0);
    
    return validators.map((validator) => ({
      publicKey: validator.publicKey.toString(),
      percentage:
        totalReputation > 0
          ? (validator.reputation / totalReputation) * totalShare
          : totalShare / validators.length,
    }));
  }

  /**
   * Call Bags API with rate limiting
   */
  private async callBagsApi<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    this.checkRateLimit();

    const response = await fetch(`${this.bagsApiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Bags API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Check and enforce rate limiting
   */
  private checkRateLimit(): void {
    const now = Date.now();
    
    // Reset counter if hour has passed
    if (now > this.rateLimitResetTime) {
      this.requestCount = 0;
      this.rateLimitResetTime = now + 3600000;
    }

    // Check limit
    if (this.requestCount >= this.rateLimit) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    this.requestCount++;
  }

  /**
   * Get remaining API calls before rate limit
   */
  getRemainingCalls(): number {
    const now = Date.now();
    
    // Reset counter if hour has passed
    if (now > this.rateLimitResetTime) {
      this.requestCount = 0;
      this.rateLimitResetTime = now + 3600000;
    }
    
    return Math.max(0, this.rateLimit - this.requestCount);
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    // On mainnet, we need an API key
    if (this.isMainnet) {
      return !!this.bagsApiKey;
    }
    // On devnet, mock mode is always "configured"
    return true;
  }
}

// Export singleton instance
export const attentionTokenService = new AttentionTokenService();

export default attentionTokenService;
