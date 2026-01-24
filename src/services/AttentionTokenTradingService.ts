/**
 * Attention Token Trading Service
 * Handles buy/sell operations and liquidity interactions via Bags API
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

export class AttentionTokenTradingService {
  private readonly bagsApiUrl: string;
  private readonly bagsApiKey: string;

  constructor() {
    this.bagsApiUrl = SOLANA_CONFIG.bagsApi.url;
    this.bagsApiKey = SOLANA_CONFIG.bagsApi.key;
  }

  /**
   * Get quote for buying tokens
   */
  async getBuyQuote(params: BuyTokenParams): Promise<TradeQuote> {
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
   * Get quote for selling tokens
   */
  async getSellQuote(params: SellTokenParams): Promise<TradeQuote> {
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
   * Execute buy transaction
   */
  async executeBuy(
    params: BuyTokenParams,
    connection: Connection,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<string> {
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
   * Execute sell transaction
   */
  async executeSell(
    params: SellTokenParams,
    connection: Connection,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<string> {
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
   * Get price history for token
   */
  async getPriceHistory(
    tokenMint: PublicKey,
    timeframe: '1h' | '24h' | '7d' | '30d' | 'all' = '24h'
  ): Promise<PriceHistory[]> {
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
   * Get liquidity pool information
   */
  async getLiquidityPoolInfo(tokenMint: PublicKey): Promise<LiquidityPoolInfo> {
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
