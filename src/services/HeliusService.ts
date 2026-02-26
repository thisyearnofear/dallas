/**
 * Helius Service - Enhanced Solana RPC & Webhook Integration
 * 
 * Provides:
 * - Enhanced RPC with priority fees and analytics
 * - Webhook management for real-time event indexing
 * - DAS (Digital Asset Standard) for token/NFT queries
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: Enhances default Solana RPC
 * - DRY: Single service for all Helius operations
 * - FALLBACK: Gracefully degrades when Helius unavailable
 */

import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { SOLANA_CONFIG } from '../config/solana';

export interface HeliusConfig {
  apiKey: string;
  network: 'devnet' | 'mainnet-beta';
}

export interface WebhookConfig {
  url: string;
  events: WebhookEventType[];
  address?: string;
}

export type WebhookEventType = 
  | 'accountCreated'
  | 'accountUpdated'
  | 'accountDeleted'
  | 'transaction'
  | 'transactionNotification'
  | 'tokenTransfer'
  | 'tokenMint'
  | 'tokenBurn';

export interface PriorityFeeConfig {
  priorityLevel: 'min' | 'low' | 'medium' | 'high' | 'veryHigh' | 'max';
  unitLimit?: number;
  unitPrice?: number;
}

export interface HeliusParsedTransaction {
  signature: string;
  slot: number;
  timestamp: number;
  fee: number;
  status: 'success' | 'failed';
  parsedInstructions: any[];
  tokenTransfers?: TokenTransfer[];
  nativeTransfers?: NativeTransfer[];
}

export interface TokenTransfer {
  from: string;
  to: string;
  mint: string;
  amount: number;
  decimals: number;
}

export interface NativeTransfer {
  from: string;
  to: string;
  amount: number;
}

class HeliusServiceClass {
  private heliusApiKey: string;
  private heliusRpcUrl: string;
  private initialized = false;
  private connection: Connection | null = null;

  constructor() {
    const network = SOLANA_CONFIG.network;
    this.heliusApiKey = SOLANA_CONFIG.helius.apiKey;
    this.heliusRpcUrl = SOLANA_CONFIG.helius.rpcUrl(network);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (!this.heliusApiKey) {
        console.warn('⚠️ Helius API key not configured. Using default RPC.');
        this.connection = new Connection(
          SOLANA_CONFIG.rpcEndpoint[SOLANA_CONFIG.network],
          'confirmed'
        );
        this.initialized = true;
        return;
      }

      console.log('🔗 Initializing Helius enhanced RPC...');
      
      this.connection = new Connection(this.heliusRpcUrl,      const version = 'confirmed');
      
 await this.connection.getVersion();
      console.log(`✅ Helius RPC connected (Solana ${version.solanaCore})`);
      
      this.initialized = true;
    } catch (error) {
      console.warn('⚠️ Helius RPC unavailable, using default:', error);
      this.connection = new Connection(
        SOLANA_CONFIG.rpcEndpoint[SOLANA_CONFIG.network],
        'confirmed'
      );
      this.initialized = true;
    }
  }

  isAvailable(): boolean {
    return !!this.heliusApiKey && this.initialized;
  }

  getConnection(): Connection {
    if (!this.connection) {
      throw new Error('HeliusService not initialized');
    }
    return this.connection;
  }

  async getParsedTransactions(
    addresses: string[],
    options?: { limit?: number; before?: string }
  ): Promise<HeliusParsedTransaction[]> {
    if (!this.heliusApiKey) {
      console.warn('Helius API key required for getParsedTransactions');
      return [];
    }

    try {
      const response = await fetch(this.heliusRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getParsedTransactions',
          params: [
            addresses,
            { maxSupportedTransactionVersion: 0, ...options }
          ]
        })
      });

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Failed to get parsed transactions:', error);
      return [];
    }
  }

  async getTokenAccountsByOwner(
    owner: PublicKey,
    mint?: string
  ): Promise<{ pubkey: string; mint: string; amount: number; decimals: number }[]> {
    if (!this.heliusApiKey) {
      console.warn('Helius API key required for getTokenAccountsByOwner');
      return [];
    }

    try {
      const params: any = {
        owner: owner.toString(),
        encoding: 'jsonParsed'
      };
      
      if (mint) {
        params.mint = mint;
      }

      const response = await fetch(this.heliusRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [params]
        })
      });

      const data = await response.json();
      if (!data.result?.value) return [];

      return data.result.value.map((account: any) => ({
        pubkey: account.pubkey,
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.amount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals
      }));
    } catch (error) {
      console.error('Failed to get token accounts:', error);
      return [];
    }
  }

  async getAssetsByOwner(owner: PublicKey): Promise<any[]> {
    if (!this.heliusApiKey) {
      console.warn('Helius API key required for getAssetsByOwner');
      return [];
    }

    try {
      const response = await fetch(this.heliusRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAssetsByOwner',
          params: {
            owner: owner.toString(),
            page: 1,
            limit: 100
          }
        })
      });

      const data = await response.json();
      return data.result?.items || [];
    } catch (error) {
      console.error('Failed to get assets:', error);
      return [];
    }
  }

  async createWebhook(config: WebhookConfig): Promise<{ webhookId: string } | null> {
    if (!this.heliusApiKey) {
      console.warn('Helius API key required for webhooks');
      return null;
    }

    try {
      const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${this.heliusApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: config.url,
          eventTypes: config.events,
          walletAddresses: config.address ? [config.address] : undefined
        })
      });

      const data = await response.json();
      return { webhookId: data.webhookId };
    } catch (error) {
      console.error('Failed to create webhook:', error);
      return null;
    }
  }

  async deleteWebhook(webhookId: string): Promise<boolean> {
    if (!this.heliusApiKey) {
      console.warn('Helius API key required for webhooks');
      return false;
    }

    try {
      await fetch(`https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${this.heliusApiKey}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Failed to delete webhook:', error);
      return false;
    }
  }

  async getWebhooks(): Promise<any[]> {
    if (!this.heliusApiKey) {
      console.warn('Helius API key required for webhooks');
      return [];
    }

    try {
      const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${this.heliusApiKey}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Failed to get webhooks:', error);
      return [];
    }
  }

  addPriorityFeeInstruction(
    transaction: Transaction,
    config: PriorityFeeConfig
  ): Transaction {
    const { priorityLevel } = config;
    
    const feeLevels = {
      min: 1000,
      low: 5000,
      medium: 10000,
      high: 25000,
      veryHigh: 50000,
      max: 100000
    };

    const microLamports = feeLevels[priorityLevel] || 10000;
    
    transaction.add(
      new TransactionInstruction({
        keys: [],
        programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
        data: Buffer.from([
          3, // SetPriorityFeeComputeUnits
          ...microLamports.toString(16).padStart(16, '0').match(/.{2}/g)!.map(byte => parseInt(byte, 16))
        ])
      })
    );

    return transaction;
  }

  async getRecentPerformanceSamples(): Promise<any[]> {
    if (!this.connection) return [];

    try {
      return await this.connection.getRecentPerformanceSamples(10);
    } catch (error) {
      console.error('Failed to get performance samples:', error);
      return [];
    }
  }

  async estimatePriorityFee(priorityLevel: PriorityFeeConfig['priorityLevel'] = 'medium'): Promise<number> {
    const samples = await this.getRecentPerformanceSamples();
    if (samples.length === 0) return 10000;

    const avgCU = samples.reduce((sum, s) => sum + s.numTransaction, 0) / samples.length;
    
    const feeMap = {
      min: 1000,
      low: 2500,
      medium: 5000,
      high: 10000,
      veryHigh: 25000,
      max: 50000
    };

    return Math.floor(feeMap[priorityLevel] * (1000 / avgCU));
  }
}

export const heliusService = new HeliusServiceClass();
export default heliusService;
