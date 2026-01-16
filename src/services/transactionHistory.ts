import { PublicKey } from '@solana/web3.js';
import { encryptionService } from './EncryptionService';

export interface TransactionRecord {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  signature: string;
  type: 'donation' | 'membership' | 'other';
  status?: string;
  agentData?: any;
}

class TransactionHistoryService {
  private storageKey = 'dallas-club-transactions';

  // Get all transactions for the current user (Encrypted)
  async getTransactions(): Promise<TransactionRecord[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      try {
        // Attempt to decrypt (New Secure Format)
        const decrypted = await encryptionService.decrypt(stored);
        return JSON.parse(decrypted);
      } catch (decryptError) {
        // Fallback to legacy plain text (Migration path)
        try {
          const legacy = JSON.parse(stored);
          // If valid legacy data, we'll return it. 
          // Next write will encrypt it automatically.
          if (Array.isArray(legacy)) return legacy;
          return [];
        } catch (jsonError) {
          console.error('Data corruption detected:', jsonError);
          return [];
        }
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
      return [];
    }
  }

  // Add a new transaction to history (Encrypted)
  async addTransaction(transaction: Omit<TransactionRecord, 'id' | 'timestamp'>): Promise<TransactionRecord> {
    const newTransaction: TransactionRecord = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    try {
      const transactions = await this.getTransactions();
      transactions.push(newTransaction);

      // Keep only last 50 transactions to avoid localStorage bloat
      if (transactions.length > 50) {
        transactions.splice(0, transactions.length - 50);
      }

      // Encrypt before saving
      const serialized = JSON.stringify(transactions);
      const encrypted = await encryptionService.encrypt(serialized);
      
      localStorage.setItem(this.storageKey, encrypted);
      return newTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      return newTransaction;
    }
  }

  // Get transactions by type
  async getTransactionsByType(type: TransactionRecord['type']): Promise<TransactionRecord[]> {
    const transactions = await this.getTransactions();
    return transactions.filter(tx => tx.type === type);
  }

  // Get transactions by date range
  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<TransactionRecord[]> {
    const start = startDate.getTime();
    const end = endDate.getTime();

    const transactions = await this.getTransactions();
    return transactions.filter(tx => tx.timestamp >= start && tx.timestamp <= end);
  }

  // Clear transaction history
  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing transaction history:', error);
    }
  }
}

export const transactionHistoryService = new TransactionHistoryService();