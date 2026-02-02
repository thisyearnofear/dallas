/**
 * useDbcToken Hook
 * 
 * Single source of truth for DBC token state and operations.
 * Follows React best practices and core principles.
 */

import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { PublicKey, Connection } from '@solana/web3.js';
import { useWallet } from '../context/WalletContext';
import {
  DbcTokenService,
  formatDbc,
  calculateTier,
  type ValidatorTier,
} from '../services/DbcTokenService';
import { cacheService } from '../services/CacheService';

interface DbcTokenState {
  // Balance
  balance: number;
  formattedBalance: string;
  tokenAccount: PublicKey | null;
  accountExists: boolean;
  
  // Status
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Validator Stats (from on-chain)
  totalValidations: number;
  accuracyRate: number;
  tier: ValidatorTier;
  totalRewards: number;
  
  // Staking
  stakedAmount: number;
  isStaking: boolean;
}

interface UseDbcTokenReturn extends DbcTokenState {
  // Actions
  refreshBalance: () => Promise<void>;
  createTokenAccount: () => Promise<void>;
  
  // Helpers
  hasMinimumBalance: (amount: number) => boolean;
  canStake: (amount: number) => boolean;
}

const INITIAL_STATE: DbcTokenState = {
  balance: 0,
  formattedBalance: '0 DBC',
  tokenAccount: null,
  accountExists: false,
  isLoading: true,
  isRefreshing: false,
  error: null,
  totalValidations: 0,
  accuracyRate: 0,
  tier: 'Bronze',
  totalRewards: 0,
  stakedAmount: 0,
  isStaking: false,
};

export function useDbcToken(): UseDbcTokenReturn {
  const { publicKey, connection, connected } = useWallet();
  const [state, setState] = useState<DbcTokenState>(INITIAL_STATE);
  const refreshTimeoutRef = useRef<number | null>(null);

  /**
   * Fetch DBC balance and account info
   * Clean: Single function for all balance operations
   * Performant: Uses cacheService.dedupe() to prevent duplicate RPC calls
   */
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const cacheKey = `balance_${publicKey.toString()}`;
    const TTL = 10 * 1000; // 10 seconds

    try {
      // Use dedupe to prevent multiple simultaneous requests
      const result = await cacheService.dedupe(cacheKey, async () => {
        // Check cache first
        const cached = cacheService.get<{ balance: number; address: PublicKey | null }>(cacheKey);
        if (cached !== null) {
          console.log(`[CacheService] Cache hit for balance: ${publicKey.toString().slice(0, 8)}...`);
          return cached;
        }

        console.log(`[CacheService] Cache miss for balance: ${publicKey.toString().slice(0, 8)}...`);
        
        // Fetch from blockchain
        const { balance, address } = await DbcTokenService.fetchDbcBalance(
          connection,
          publicKey
        );
        
        // Store in cache
        const data = { balance, address };
        cacheService.set(cacheKey, data, TTL);
        
        return data;
      });

      setState(prev => ({
        ...prev,
        balance: result.balance,
        formattedBalance: formatDbc(result.balance),
        tokenAccount: result.address,
        accountExists: !!result.address,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error fetching DBC balance:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch DBC balance',
      }));
    }
  }, [publicKey, connection]);

  /**
   * Refresh balance with debouncing
   * Performant: Prevents excessive RPC calls
   */
  const refreshBalance = useCallback(async () => {
    if (state.isRefreshing) return;

    setState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      await fetchBalance();
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [fetchBalance, state.isRefreshing]);

  /**
   * Create DBC token account
   */
  const createTokenAccount = useCallback(async () => {
    if (!publicKey || !connected) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Note: Actual implementation would use wallet adapter
      // This is a placeholder for the hook structure
      console.log('Creating DBC token account for:', publicKey.toBase58());
      
      // After creation, invalidate cache and refresh balance
      const cacheKey = `balance_${publicKey.toString()}`;
      cacheService.delete(cacheKey);
      console.log(`[CacheService] Invalidated cache for balance: ${publicKey.toString().slice(0, 8)}...`);
      
      await fetchBalance();
    } catch (error) {
      console.error('Error creating DBC account:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to create DBC account',
      }));
    }
  }, [publicKey, connected, fetchBalance]);

  /**
   * Check if user has minimum balance
   */
  const hasMinimumBalance = useCallback((amount: number): boolean => {
    return state.balance >= amount;
  }, [state.balance]);

  /**
   * Check if user can stake amount
   */
  const canStake = useCallback((amount: number): boolean => {
    return state.balance >= amount && amount >= DbcTokenService.STAKING_CONFIG.MINIMUM_STAKE;
  }, [state.balance]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setState(INITIAL_STATE);
    }
  }, [connected, publicKey, fetchBalance]);

  /**
   * Auto-refresh every 30 seconds when connected
   * Performant: Uses interval with cleanup
   */
  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 30000);

    return () => clearInterval(interval);
  }, [connected, refreshBalance]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refreshBalance,
    createTokenAccount,
    hasMinimumBalance,
    canStake,
  };
}

export default useDbcToken;
