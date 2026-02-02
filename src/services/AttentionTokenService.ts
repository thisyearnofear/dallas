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
  CaseStudyWithAttentionToken,
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

  constructor() {
    this.bagsApiUrl = SOLANA_CONFIG.bagsApi.url;
    this.bagsApiKey = SOLANA_CONFIG.bagsApi.key;
    this.bagsPartnerConfig = SOLANA_CONFIG.bagsApi.partnerConfig;
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
   * ENHANCED: Support for both case study tokens and standalone community tokens
   */
  async createAttentionToken(
    params: CreateAttentionTokenParams
  ): Promise<{ tokenMint: PublicKey; bondingCurve: PublicKey; signature: string }> {
    this.checkRateLimit();

    const symbol = this.generateSymbol(params.treatmentName);
    
    // Determine token name based on mode
    const isCommunity = params.isCommunityToken || !params.caseStudyPda;
    const tokenName = isCommunity 
      ? params.treatmentName  // Communities use name directly (e.g., "Collagen Community")
      : `${params.treatmentName} Attention`; // Case studies append "Attention"

    const request: BagsTokenLaunchRequest = {
      name: tokenName,
      symbol,
      description: params.description,
      imageUrl: params.imageUrl,
      partnerConfig: this.bagsPartnerConfig || undefined,
      metadata: {
        caseStudyPda: params.caseStudyPda?.toString(),
        submitter: params.submitter.toString(),
        validators: params.validators?.map((v) => v.publicKey.toString()) || [],
        reputationScore: params.reputationScore || 0,
        treatmentName: params.treatmentName,
        treatmentCategory: params.treatmentCategory,
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

      // ENHANCEMENT: Enrich with grounded protocol data
      // We derive community metrics from the actual token and case study state
      const enrichedAnalytics: AttentionTokenAnalytics = {
        ...response.response,
        communityStats: {
          activeSupporters: response.response.holders, // Real holder count
          researchUpdates: 0, // Will be fetched from on-chain history
          validationMilestones: 0, // Will be fetched from validator count
          sentiment: 50, // Neutral starting point
        },
        intelReports: [] // Empty state - to be populated by Edenlayer/On-chain data
      };

      return enrichedAnalytics;
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Only add API key header if not using server-side proxy
    if (this.bagsApiKey !== 'proxied') {
      headers['x-api-key'] = this.bagsApiKey;
    }

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
   * Get full initiative details (Token + Case Study + Community)
   */
  async getInitiativeDetails(tokenMint: PublicKey, connection: Connection): Promise<CaseStudyWithAttentionToken> {
    const analytics = await this.getTokenAnalytics(tokenMint);
    
    // In a real app, we'd find the Case Study PDA linked to this mint
    // For now, we'll derive/fetch if possible or return enriched placeholder
    const { parseCaseStudyAccount } = await import('../utils/solanaUtils');
    
    // Placeholder implementation - in reality, we'd use a reverse lookup or metadata
    return {
      publicKey: new PublicKey('11111111111111111111111111111111'),
      submitter: new PublicKey('11111111111111111111111111111111'),
      treatmentName: 'Experimental Peptide Therapy',
      treatmentCategory: 'Metabolic',
      description: 'Encrypted underground research on peptide efficacy.',
      imageUrl: 'https://via.placeholder.com/400',
      reputationScore: 88,
      validatorCount: 12,
      validators: [],
      createdAt: Date.now(),
      attentionTokenMint: tokenMint,
      attentionToken: {
        mint: tokenMint,
        bondingCurve: new PublicKey('11111111111111111111111111111111'),
        caseStudyPda: new PublicKey('11111111111111111111111111111111'),
        name: 'Peptide Attention',
        symbol: 'PEPTIDE',
        description: 'Discovery token for experimental peptides',
        imageUrl: 'https://via.placeholder.com/400',
        submitter: new PublicKey('11111111111111111111111111111111'),
        validators: [],
        treatmentName: 'Peptide',
        treatmentCategory: 'Metabolic',
        reputationScore: 88,
        createdAt: Date.now(),
        analytics,
      },
    };
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

  /**
   * ADDED: Query community tokens by category
   * Fetches all tokens created with community metadata via partner config
   */
  async getCommunityTokens(filters?: {
    category?: 'supplement' | 'lifestyle' | 'device' | 'protocol' | 'all';
    limit?: number;
    sortBy?: 'marketCap' | 'volume24h' | 'holders' | 'createdAt';
  }): Promise<AttentionToken[]> {
    this.checkRateLimit();

    try {
      // Fetch all tokens created via our partner config
      // Note: This endpoint may need to be adjusted based on actual Bags API
      const response = await this.callBagsApi<{ tokens: any[] }>(
        `/tokens?partnerConfig=${this.bagsPartnerConfig}&limit=${filters?.limit || 100}`
      );

      if (!response || !Array.isArray(response)) {
        console.warn('Unexpected response from Bags API:', response);
        return [];
      }

      // Parse tokens and filter by category
      const tokens: AttentionToken[] = (response as any[])
        .filter((token) => {
          // Only include tokens with community metadata
          const metadata = token.metadata || {};
          const isCommunity = metadata.isCommunityToken;
          
          if (!isCommunity) return false;
          
          // Filter by category if specified
          if (filters?.category && filters.category !== 'all') {
            return metadata.communityCategory === filters.category;
          }
          
          return true;
        })
        .map((token) => ({
          mint: new PublicKey(token.mint),
          bondingCurve: new PublicKey(token.bondingCurve),
          caseStudyPda: token.metadata?.caseStudyPda 
            ? new PublicKey(token.metadata.caseStudyPda)
            : new PublicKey('11111111111111111111111111111111'), // Default if community token
          name: token.name,
          symbol: token.symbol,
          description: token.description,
          imageUrl: token.imageUrl || 'https://via.placeholder.com/400',
          submitter: new PublicKey(token.metadata?.submitter || '11111111111111111111111111111111'),
          validators: [],
          treatmentName: token.metadata?.treatmentName || token.name,
          treatmentCategory: token.metadata?.treatmentCategory || 'Unknown',
          reputationScore: token.metadata?.reputationScore || 0,
          createdAt: token.createdAt || Date.now(),
          analytics: {
            marketCap: token.marketCap || 0,
            volume24h: token.volume24h || 0,
            volumeAll: token.volumeAll || 0,
            holders: token.holders || 0,
            price: token.price || 0,
            priceChange24h: token.priceChange24h || 0,
            lifetimeFees: token.lifetimeFees || 0,
            transactions: token.transactions || 0,
            createdAt: token.createdAt || Date.now(),
            lastTradeAt: token.lastTradeAt || Date.now(),
          }
        }));

      // Sort if requested
      if (filters?.sortBy) {
        tokens.sort((a, b) => {
          const aVal = a.analytics?.[filters.sortBy!] || 0;
          const bVal = b.analytics?.[filters.sortBy!] || 0;
          return bVal - aVal; // Descending order
        });
      }

      return tokens;
    } catch (error) {
      console.error('Error fetching community tokens:', error);
      // Return empty array rather than throwing - graceful degradation
      return [];
    }
  }

  /**
   * ADDED: Get single community token by mint
   */
  async getCommunityToken(tokenMint: PublicKey): Promise<AttentionToken | null> {
    this.checkRateLimit();

    try {
      const analytics = await this.getTokenAnalytics(tokenMint);
      
      // Fetch token metadata - adjust endpoint as needed
      const response = await this.callBagsApi<any>(`/token/${tokenMint.toString()}`);
      
      if (!response) return null;

      return {
        mint: tokenMint,
        bondingCurve: new PublicKey(response.bondingCurve || '11111111111111111111111111111111'),
        caseStudyPda: response.metadata?.caseStudyPda 
          ? new PublicKey(response.metadata.caseStudyPda)
          : new PublicKey('11111111111111111111111111111111'),
        name: response.name,
        symbol: response.symbol,
        description: response.description,
        imageUrl: response.imageUrl || 'https://via.placeholder.com/400',
        submitter: new PublicKey(response.metadata?.submitter || '11111111111111111111111111111111'),
        validators: [],
        treatmentName: response.metadata?.treatmentName || response.name,
        treatmentCategory: response.metadata?.treatmentCategory || 'Unknown',
        reputationScore: response.metadata?.reputationScore || 0,
        createdAt: response.createdAt || Date.now(),
        analytics,
      };
    } catch (error) {
      console.error('Error fetching community token:', error);
      return null;
    }
  }
}

// Export singleton instance
export const attentionTokenService = new AttentionTokenService();
