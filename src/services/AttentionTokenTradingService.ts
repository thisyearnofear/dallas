/**
 * Attention Token Trading Service
 * Handles buy/sell operations and liquidity interactions via Bags API
 * 
 * NETWORK COMPATIBILITY:
 * - Bags API only works on mainnet (real tokens with real value)
 * - Our app currently runs on devnet for testing
 * - This service provides mock trading for devnet testing
 */

import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { SOLANA_CONFIG } from '../config/solana';
import {
  AttentionTokenTradeParams,
  BagsAnalyticsResponse,
} from '../types/attentionToken';

export interface BuyTokenParams {
  tokenMint: PublicKey;
  solAmount: number; // Amount of SOL to spend
  slippage: number; // Percentage (e.g., 1 = 1%)
  buyer: PublicKey;
}

export interface SellTokenParams {
  tokenMint: PublicKey;
  tokenAmount: number; // Amount of tokens to sell
  slippage: number;
  seller: PublicKey;
}

export interface TradeQuote {
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  minimumReceived: number;
  tradingFee: number;
  route: string[];
}

export interface PriceHistory {
  timestamp: number;
  price: number;
  volume: number;
}

export interface LiquidityPoolInfo {
  solReserve: number;
  tokenReserve: number;
  lpTokenSupply: number;
  apy: number;
}

export interface MockTrade {
  id: string;
  tokenMint: string;
  user: string;
  type: 'buy' | 'sell';
  inputAmount: number;
  outputAmount: number;
  price: number;
  timestamp: number;
  signature: string;
}

export class AttentionTokenTradingService {
  private readonly bagsApiUrl: string;
  private readonly bagsApiKey: string;
  private readonly isMainnet: boolean;
  private readonly mockTrades: Map<string, MockTrade[]> = new Map();
  private readonly mockBalances: Map<string, number> = new Map();
  private readonly mockPriceHistory: Map<string, PriceHistory[]> = new Map();

  constructor() {
    this.bagsApiUrl = SOLANA_CONFIG.bagsApi.url;
    this.bagsApiKey = SOLANA_CONFIG.bagsApi.key;
    this.isMainnet = SOLANA_CONFIG.network === 'mainnet-beta';

    if (!this.isMainnet) {
      console.log('📢 Attention Token Trading Service running in DEVNET MODE (mock trading)');
    }
  }

  /**
   * Check if we're on mainnet (real trading) or devnet (mock trading)
   */
  isRealTradingMode(): boolean {
    return this.isMainnet;
  }

  /**
   * Get quote for buying tokens
   */
  async getBuyQuote(params: BuyTokenParams): Promise<TradeQuote> {
    // Devnet: Generate mock quote
    if (!this.isMainnet) {
      return this.generateMockBuyQuote(params);
    }

    // Mainnet: Get real quote from Bags API
    try {
      const response = await this.callBagsApi<any>(
        `/token/${params.tokenMint.toString()}/quote/buy`,
        {
          method: 'POST',
          body: JSON.stringify({
            solAmount: params.solAmount,
            slippage: params.slippage,
            buyer: params.buyer.toString(),
          }),
        }
      );

      return {
        inputAmount: params.solAmount,
        outputAmount: response.response.tokensOut,
        priceImpact: response.response.priceImpact,
        minimumReceived: response.response.minimumTokensOut,
        tradingFee: response.response.fee,
        route: response.response.route || ['SOL', params.tokenMint.toString()],
      };
    } catch (error) {
      console.error('Error getting buy quote:', error);
      throw new Error('Failed to get buy quote');
    }
  }

  /**
   * Generate mock buy quote for devnet
   */
  private generateMockBuyQuote(params: BuyTokenParams): TradeQuote {
    // Simple bonding curve simulation: price increases with purchase size
    const basePrice = 0.0001; // Base price in SOL per token
    const priceImpact = Math.min(50, (params.solAmount / 10) * 5); // Max 50% impact
    const effectivePrice = basePrice * (1 + priceImpact / 100);
    
    const tokensOut = params.solAmount / effectivePrice;
    const tradingFee = params.solAmount * 0.02; // 2% fee
    const minimumReceived = tokensOut * (1 - params.slippage / 100);

    return {
      inputAmount: params.solAmount,
      outputAmount: tokensOut,
      priceImpact,
      minimumReceived,
      tradingFee,
      route: ['SOL', params.tokenMint.toString()],
    };
  }

  /**
   * Get quote for selling tokens
   */
  async getSellQuote(params: SellTokenParams): Promise<TradeQuote> {
    // Devnet: Generate mock quote
    if (!this.isMainnet) {
      return this.generateMockSellQuote(params);
    }

    // Mainnet: Get real quote from Bags API
    try {
      const response = await this.callBagsApi<any>(
        `/token/${params.tokenMint.toString()}/quote/sell`,
        {
          method: 'POST',
          body: JSON.stringify({
            tokenAmount: params.tokenAmount,
            slippage: params.slippage,
            seller: params.seller.toString(),
          }),
        }
      );

      return {
        inputAmount: params.tokenAmount,
        outputAmount: response.response.solOut,
        priceImpact: response.response.priceImpact,
        minimumReceived: response.response.minimumSolOut,
        tradingFee: response.response.fee,
        route: response.response.route || [params.tokenMint.toString(), 'SOL'],
      };
    } catch (error) {
      console.error('Error getting sell quote:', error);
      throw new Error('Failed to get sell quote');
    }
  }

  /**
   * Generate mock sell quote for devnet
   */
  private generateMockSellQuote(params: SellTokenParams): TradeQuote {
    const basePrice = 0.0001; // Base price in SOL per token
    const priceImpact = Math.min(50, (params.tokenAmount / 10000) * 5); // Max 50% impact
    const effectivePrice = basePrice * (1 - priceImpact / 100);
    
    const solOut = params.tokenAmount * effectivePrice;
    const tradingFee = solOut * 0.02; // 2% fee
    const minimumReceived = solOut * (1 - params.slippage / 100);

    return {
      inputAmount: params.tokenAmount,
      outputAmount: solOut,
      priceImpact,
      minimumReceived,
      tradingFee,
      route: [params.tokenMint.toString(), 'SOL'],
    };
  }

  /**
   * Execute buy transaction
   */
  async executeBuy(
    params: BuyTokenParams,
    connection: Connection,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<string> {
    // Devnet: Simulate buy
    if (!this.isMainnet) {
      return this.executeMockBuy(params);
    }

    // Mainnet: Execute real trade via Bags API
    try {
      // Get quote first
      const quote = await this.getBuyQuote(params);

      // Create transaction via Bags API
      const response = await this.callBagsApi<any>(
        `/token/${params.tokenMint.toString()}/buy`,
        {
          method: 'POST',
          body: JSON.stringify({
            buyer: params.buyer.toString(),
            solAmount: params.solAmount,
            slippage: params.slippage,
            minimumTokensOut: quote.minimumReceived,
          }),
        }
      );

      // Deserialize transaction
      const transaction = Transaction.from(
        Buffer.from(response.response.transaction, 'base64')
      );

      // Sign transaction
      const signedTx = await signTransaction(transaction);

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } catch (error) {
      console.error('Error executing buy:', error);
      throw error;
    }
  }

  /**
   * Execute mock buy for devnet testing
   */
  private async executeMockBuy(params: BuyTokenParams): Promise<string> {
    const quote = await this.getBuyQuote(params);
    const signature = `mock-buy-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Update mock balance
    const balanceKey = `${params.tokenMint.toString()}-${params.buyer.toString()}`;
    const currentBalance = this.mockBalances.get(balanceKey) || 0;
    this.mockBalances.set(balanceKey, currentBalance + quote.outputAmount);
    
    // Record trade
    const trade: MockTrade = {
      id: `trade-${Date.now()}`,
      tokenMint: params.tokenMint.toString(),
      user: params.buyer.toString(),
      type: 'buy',
      inputAmount: params.solAmount,
      outputAmount: quote.outputAmount,
      price: params.solAmount / quote.outputAmount,
      timestamp: Date.now(),
      signature,
    };
    
    const trades = this.mockTrades.get(params.tokenMint.toString()) || [];
    trades.push(trade);
    this.mockTrades.set(params.tokenMint.toString(), trades);
    
    // Update price history
    this.updateMockPriceHistory(params.tokenMint.toString(), trade.price, quote.outputAmount);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ Mock buy executed:', {
      signature,
      tokensReceived: quote.outputAmount,
      solSpent: params.solAmount,
    });
    
    return signature;
  }

  /**
   * Execute sell transaction
   */
  async executeSell(
    params: SellTokenParams,
    connection: Connection,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<string> {
    // Devnet: Simulate sell
    if (!this.isMainnet) {
      return this.executeMockSell(params);
    }

    // Mainnet: Execute real trade via Bags API
    try {
      // Get quote first
      const quote = await this.getSellQuote(params);

      // Create transaction via Bags API
      const response = await this.callBagsApi<any>(
        `/token/${params.tokenMint.toString()}/sell`,
        {
          method: 'POST',
          body: JSON.stringify({
            seller: params.seller.toString(),
            tokenAmount: params.tokenAmount,
            slippage: params.slippage,
            minimumSolOut: quote.minimumReceived,
          }),
        }
      );

      // Deserialize transaction
      const transaction = Transaction.from(
        Buffer.from(response.response.transaction, 'base64')
      );

      // Sign transaction
      const signedTx = await signTransaction(transaction);

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } catch (error) {
      console.error('Error executing sell:', error);
      throw error;
    }
  }

  /**
   * Execute mock sell for devnet testing
   */
  private async executeMockSell(params: SellTokenParams): Promise<string> {
    const quote = await this.getSellQuote(params);
    const signature = `mock-sell-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Update mock balance
    const balanceKey = `${params.tokenMint.toString()}-${params.seller.toString()}`;
    const currentBalance = this.mockBalances.get(balanceKey) || 0;
    
    if (currentBalance < params.tokenAmount) {
      throw new Error('Insufficient token balance');
    }
    
    this.mockBalances.set(balanceKey, currentBalance - params.tokenAmount);
    
    // Record trade
    const trade: MockTrade = {
      id: `trade-${Date.now()}`,
      tokenMint: params.tokenMint.toString(),
      user: params.seller.toString(),
      type: 'sell',
      inputAmount: params.tokenAmount,
      outputAmount: quote.outputAmount,
      price: quote.outputAmount / params.tokenAmount,
      timestamp: Date.now(),
      signature,
    };
    
    const trades = this.mockTrades.get(params.tokenMint.toString()) || [];
    trades.push(trade);
    this.mockTrades.set(params.tokenMint.toString(), trades);
    
    // Update price history
    this.updateMockPriceHistory(params.tokenMint.toString(), trade.price, params.tokenAmount);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ Mock sell executed:', {
      signature,
      tokensSold: params.tokenAmount,
      solReceived: quote.outputAmount,
    });
    
    return signature;
  }

  /**
   * Update mock price history
   */
  private updateMockPriceHistory(tokenMint: string, price: number, volume: number): void {
    const history = this.mockPriceHistory.get(tokenMint) || [];
    history.push({
      timestamp: Date.now(),
      price,
      volume,
    });
    // Keep last 1000 data points
    if (history.length > 1000) {
      history.shift();
    }
    this.mockPriceHistory.set(tokenMint, history);
  }

  /**
   * Get price history for token
   */
  async getPriceHistory(
    tokenMint: PublicKey,
    timeframe: '1h' | '24h' | '7d' | '30d' | 'all' = '24h'
  ): Promise<PriceHistory[]> {
    // Devnet: Return mock price history
    if (!this.isMainnet) {
      return this.getMockPriceHistory(tokenMint.toString(), timeframe);
    }

    // Mainnet: Get real price history from Bags API
    try {
      const response = await this.callBagsApi<any>(
        `/token/${tokenMint.toString()}/price-history?timeframe=${timeframe}`
      );

      return response.response.history.map((item: any) => ({
        timestamp: item.timestamp,
        price: item.price,
        volume: item.volume,
      }));
    } catch (error) {
      console.error('Error getting price history:', error);
      throw new Error('Failed to fetch price history from Bags API');
    }
  }

  /**
   * Get mock price history for devnet
   */
  private getMockPriceHistory(tokenMint: string, timeframe: string): PriceHistory[] {
    const history = this.mockPriceHistory.get(tokenMint) || [];
    
    // If no history, generate some mock data
    if (history.length === 0) {
      return this.generateMockPriceHistory(tokenMint);
    }
    
    // Filter by timeframe
    const now = Date.now();
    const timeframeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity,
    }[timeframe] || 24 * 60 * 60 * 1000;
    
    return history.filter(h => now - h.timestamp <= timeframeMs);
  }

  /**
   * Generate mock price history
   */
  private generateMockPriceHistory(tokenMint: string): PriceHistory[] {
    const history: PriceHistory[] = [];
    const basePrice = 0.0001;
    let currentPrice = basePrice;
    
    // Generate 30 days of hourly data
    for (let i = 30 * 24; i >= 0; i--) {
      const timestamp = Date.now() - i * 60 * 60 * 1000;
      // Random walk with slight upward trend
      const change = (Math.random() - 0.48) * 0.1; // Slight upward bias
      currentPrice = Math.max(0.00001, currentPrice * (1 + change));
      
      history.push({
        timestamp,
        price: currentPrice,
        volume: Math.random() * 1000,
      });
    }
    
    this.mockPriceHistory.set(tokenMint, history);
    return history;
  }

  /**
   * Get liquidity pool information
   */
  async getLiquidityPoolInfo(tokenMint: PublicKey): Promise<LiquidityPoolInfo> {
    // Devnet: Return mock liquidity info
    if (!this.isMainnet) {
      return {
        solReserve: Math.random() * 100 + 10,
        tokenReserve: Math.random() * 1000000 + 100000,
        lpTokenSupply: Math.random() * 50000 + 10000,
        apy: Math.random() * 50 + 10,
      };
    }

    // Mainnet: Get real liquidity info from Bags API
    try {
      const response = await this.callBagsApi<any>(
        `/token/${tokenMint.toString()}/liquidity`
      );

      return {
        solReserve: response.response.solReserve,
        tokenReserve: response.response.tokenReserve,
        lpTokenSupply: response.response.lpTokenSupply,
        apy: response.response.apy,
      };
    } catch (error) {
      console.error('Error getting liquidity info:', error);
      throw new Error('Failed to get liquidity information');
    }
  }

  /**
   * Get user's token balance
   */
  async getTokenBalance(tokenMint: PublicKey, owner: PublicKey): Promise<number> {
    // Devnet: Return mock balance
    if (!this.isMainnet) {
      const balanceKey = `${tokenMint.toString()}-${owner.toString()}`;
      return this.mockBalances.get(balanceKey) || 0;
    }

    // Mainnet: Get real balance from Bags API
    try {
      const response = await this.callBagsApi<any>(
        `/token/${tokenMint.toString()}/balance/${owner.toString()}`
      );

      return response.response.balance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }

  /**
   * Get user's trade history
   */
  async getTradeHistory(
    tokenMint: PublicKey,
    user: PublicKey,
    limit: number = 50
  ): Promise<any[]> {
    // Devnet: Return mock trade history
    if (!this.isMainnet) {
      const trades = this.mockTrades.get(tokenMint.toString()) || [];
      return trades
        .filter(t => t.user === user.toString())
        .slice(-limit)
        .reverse();
    }

    // Mainnet: Get real trade history from Bags API
    try {
      const response = await this.callBagsApi<any>(
        `/token/${tokenMint.toString()}/trades?user=${user.toString()}&limit=${limit}`
      );

      return response.response.trades;
    } catch (error) {
      console.error('Error getting trade history:', error);
      return [];
    }
  }

  /**
   * Calculate expected output for given input
   */
  calculateExpectedOutput(
    inputAmount: number,
    inputReserve: number,
    outputReserve: number,
    fee: number = 2
  ): number {
    const inputWithFee = inputAmount * (100 - fee);
    const numerator = inputWithFee * outputReserve;
    const denominator = inputReserve * 100 + inputWithFee;
    return numerator / denominator;
  }

  /**
   * Calculate price impact
   */
  calculatePriceImpact(
    inputAmount: number,
    inputReserve: number,
    outputReserve: number
  ): number {
    const spotPrice = outputReserve / inputReserve;
    const outputAmount = this.calculateExpectedOutput(
      inputAmount,
      inputReserve,
      outputReserve
    );
    const executionPrice = outputAmount / inputAmount;
    return ((spotPrice - executionPrice) / spotPrice) * 100;
  }

  /**
   * API call wrapper
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
      throw new Error(`Bags API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const attentionTokenTradingService = new AttentionTokenTradingService();

export default attentionTokenTradingService;
