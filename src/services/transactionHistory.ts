import { PublicKey } from '@solana/web3.js';

export interface TransactionRecord {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  signature: string;
  type: 'donation' | 'membership' | 'other';
}

class TransactionHistoryService {
  private storageKey = 'dallas-club-transactions';
  
  // Get all transactions for the current user
  getTransactions(): TransactionRecord[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const transactions: TransactionRecord[] = JSON.parse(stored);
      return transactions;
    } catch (error) {
      console.error('Error loading transaction history:', error);
      return [];
    }
  }
  
  // Add a new transaction to history
  addTransaction(transaction: Omit<TransactionRecord, 'id' | 'timestamp'>): TransactionRecord {
    const newTransaction: TransactionRecord = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    try {
      const transactions = this.getTransactions();
      transactions.push(newTransaction);
      
      // Keep only last 50 transactions to avoid localStorage bloat
      if (transactions.length > 50) {
        transactions.splice(0, transactions.length - 50);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(transactions));
      return newTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      return newTransaction;
    }
  }
  
  // Get transactions by type
  getTransactionsByType(type: TransactionRecord['type']): TransactionRecord[] {
    const transactions = this.getTransactions();
    return transactions.filter(tx => tx.type === type);
  }
  
  // Get transactions by date range
  getTransactionsByDateRange(startDate: Date, endDate: Date): TransactionRecord[] {
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    const transactions = this.getTransactions();
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