import { createContext, h } from 'preact';
import { useContext, useState, useEffect, useCallback } from 'preact/hooks';
import { PublicKey, Connection, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { getRpcEndpoint, validateBlockchainConfig, SOLANA_CONFIG } from '../config/solana';
import { transactionHistoryService, TransactionRecord } from '../services/transactionHistory';

export const WalletContext = createContext(null);

export type ReputationTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | null;

export const TIER_STYLES: Record<Exclude<ReputationTier, null>, string> = {
  Bronze: 'bg-amber-700 text-white',
  Silver: 'bg-gray-400 text-gray-900',
  Gold: 'bg-yellow-500 text-gray-900',
  Platinum: 'bg-gradient-to-r from-purple-400 to-blue-400 text-white',
};

export interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (destination: PublicKey, amount: number, type?: TransactionRecord['type']) => Promise<string>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  signTransaction: (transaction: any) => Promise<any>;
  connection: Connection;
  getTransactionHistory: () => TransactionRecord[];
  experienceBalance: number;
  reputationTier: ReputationTier;
  validationCount: number;
  accuracyRate: number;
  refreshExperienceData: () => Promise<void>;
}

const NETWORK = getRpcEndpoint();
const PHANTOM_DEEPLINK = 'https://phantom.app/';
const MIN_TRANSACTION_AMOUNT = 0.001; // Minimum SOL amount to prevent spam
const MAX_TRANSACTION_AMOUNT = 100; // Maximum SOL amount per transaction
const TRANSACTION_COOLDOWN_MS = 5000; // 5 seconds cooldown between transactions

function calculateReputationTier(validationCount: number, accuracyRate: number): ReputationTier {
  if (validationCount === 0) return null;
  
  if (validationCount >= 76 && accuracyRate >= 85) return 'Platinum';
  if (validationCount >= 51 && accuracyRate >= 75) return 'Gold';
  if (validationCount >= 26 && accuracyRate >= 60) return 'Silver';
  return 'Bronze';
}

export function WalletProvider({ children }: { children: any }) {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<number>(0);
  const [blockchainConfigError, setBlockchainConfigError] = useState<string | null>(null);
  const [experienceBalance, setExperienceBalance] = useState<number>(0);
  const [validationCount, setValidationCount] = useState<number>(0);
  const [accuracyRate, setAccuracyRate] = useState<number>(0);
  const connection = new Connection(NETWORK);

  const reputationTier = calculateReputationTier(validationCount, accuracyRate);

  const fetchExperienceData = useCallback(async (walletPublicKey: PublicKey) => {
    try {
      const mintAddress = SOLANA_CONFIG.blockchain.experienceMintAddress;
      const isPlaceholder = mintAddress.includes('XXXX') || mintAddress.includes('XXX');

      if (isPlaceholder) {
        console.warn('EXPERIENCE token mint not configured, using mock data');
        setExperienceBalance(150);
        setValidationCount(35);
        setAccuracyRate(72);
        return;
      }

      const { getAssociatedTokenAddress } = await import('@solana/spl-token');
      const mintPubkey = new PublicKey(mintAddress);
      const tokenAccount = await getAssociatedTokenAddress(mintPubkey, walletPublicKey);

      try {
        const accountInfo = await connection.getTokenAccountBalance(tokenAccount);
        setExperienceBalance(Number(accountInfo.value.uiAmount) || 0);
      } catch (error) {
        console.warn('No EXPERIENCE token account found, balance is 0');
        setExperienceBalance(0);
      }

      setValidationCount(0);
      setAccuracyRate(0);
    } catch (error) {
      console.error('Error fetching EXPERIENCE data:', error);
      setExperienceBalance(0);
      setValidationCount(0);
      setAccuracyRate(0);
    }
  }, [connection]);

  const refreshExperienceData = useCallback(async () => {
    if (publicKey && connected) {
      await fetchExperienceData(publicKey);
    }
  }, [publicKey, connected, fetchExperienceData]);

  // Validate blockchain configuration on startup
  useEffect(() => {
    try {
      validateBlockchainConfig();
      setBlockchainConfigError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown blockchain config error';
      setBlockchainConfigError(message);
      console.warn('⚠️ Blockchain config incomplete:', message);
    }
  }, []);

  // Check if Phantom is installed
  const getProvider = () => {
    if ('solana' in window) {
      const provider = (window as any).solana;
      if (provider.isPhantom) {
        return provider;
      }
    }
    return null;
  };

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const provider = getProvider();
      if (provider) {
        try {
          const response = await provider.connect({ onlyIfTrusted: true });
          setPublicKey(response.publicKey);
          setConnected(true);
        } catch (err) {
          console.error('Auto connection failed:', err);
        }
      }
    };
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const onAccountChanged = (newPublicKey: PublicKey | null) => {
      if (newPublicKey) {
        setPublicKey(newPublicKey);
        setConnected(true);
      } else {
        setPublicKey(null);
        setConnected(false);
      }
    };

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setPublicKey(null);
      setConnected(false);
      setExperienceBalance(0);
      setValidationCount(0);
      setAccuracyRate(0);
    };

    provider.on('accountChanged', onAccountChanged);
    provider.on('connect', onConnect);
    provider.on('disconnect', onDisconnect);

    return () => {
      provider.removeAllListeners();
    };
  }, []);

  // Fetch EXPERIENCE data when wallet connects
  useEffect(() => {
    if (publicKey && connected) {
      fetchExperienceData(publicKey);
    }
  }, [publicKey, connected, fetchExperienceData]);

  const connect = async () => {
    setConnecting(true);
    try {
      const provider = getProvider();
      if (!provider) {
        // Phantom not installed, redirect to download
        window.open(PHANTOM_DEEPLINK, '_blank');
        setConnecting(false);
        throw new Error('Phantom wallet not found. Please install Phantom browser extension.');
      }

      // Check if wallet is already connected
      if (provider.connect) {
        const response = await provider.connect();
        setPublicKey(response.publicKey);
        setConnected(true);
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      let errorMessage = 'Connection failed';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'UserRejectedRequestError') {
        errorMessage = 'Connection was rejected by user';
      }
      throw new Error(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      const provider = getProvider();
      if (provider) {
        await provider.disconnect();
      }
      setPublicKey(null);
      setConnected(false);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  // Calculate network fees
  const getNetworkFees = async (): Promise<number> => {
    try {
      const { blockhash, feeCalculator } = await connection.getLatestBlockhashAndContext('confirmed');
      // This is a simplified fee calculation - in real apps, fees are more complex
      // For transfers, the fee is typically ~0.000005 SOL per signature
      return 0.000005;
    } catch (error) {
      console.error('Error getting network fees:', error);
      return 0.000005; // Default fee if we can't get it
    }
  };

  const sendTransaction = async (
    destination: PublicKey,
    amount: number,
    type: TransactionRecord['type'] = 'other'
  ): Promise<string> => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }

    // Check transaction cooldown
    const now = Date.now();
    if (now - lastTransaction < TRANSACTION_COOLDOWN_MS) {
      const remaining = TRANSACTION_COOLDOWN_MS - (now - lastTransaction);
      throw new Error(`Please wait ${Math.ceil(remaining / 1000)} seconds before making another transaction`);
    }

    const provider = getProvider();
    if (!provider) {
      throw new Error('Phantom not found');
    }

    // Validate amount
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (amount < MIN_TRANSACTION_AMOUNT) {
      throw new Error(`Amount must be at least ${MIN_TRANSACTION_AMOUNT} SOL`);
    }

    if (amount > MAX_TRANSACTION_AMOUNT) {
      throw new Error(`Amount cannot exceed ${MAX_TRANSACTION_AMOUNT} SOL per transaction`);
    }

    // Validate destination address
    if (!destination) {
      throw new Error('Invalid destination address');
    }

    // Verify destination is not a system program address
    if (destination.equals(SystemProgram.programId)) {
      throw new Error('Invalid destination address');
    }

    try {
      // Get user balance to ensure they have sufficient funds
      const balance = await connection.getBalance(publicKey);
      const balanceInSol = balance / LAMPORTS_PER_SOL;

      // Calculate estimated network fees
      const networkFees = await getNetworkFees();

      // Check if user has enough SOL for transaction + fees
      if (balanceInSol < (amount + networkFees)) {
        throw new Error(`Insufficient funds. Required: ${amount + networkFees} SOL, Available: ${balanceInSol} SOL`);
      }

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Create transaction
      const { Transaction } = await import('@solana/web3.js');
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: destination,
          lamports: Math.floor(amount * LAMPORTS_PER_SOL), // Convert SOL to lamports
        })
      );

      // Sign and send
      const signedTransaction = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Update last transaction time
      setLastTransaction(now);

      // Record the transaction in history
      await transactionHistoryService.addTransaction({
        from: publicKey.toString(),
        to: destination.toString(),
        amount,
        signature,
        type,
      });

      return signature;
    } catch (error: any) {
      console.error('Transaction error:', error);
      // Provide more user-friendly error messages
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds for this transaction');
      } else if (error.message.includes('blockhash not found')) {
        throw new Error('Network error, please try again');
      } else {
        throw error;
      }
    }
  };

  const signTransaction = async (transaction: any): Promise<any> => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }

    const provider = getProvider();
    if (!provider || !provider.signTransaction) {
      throw new Error('Wallet does not support transaction signing');
    }

    try {
      return await provider.signTransaction(transaction);
    } catch (error: any) {
      console.error('Transaction signing error:', error);
      if (error.message?.includes('User rejected')) {
        throw new Error('Transaction was rejected by user');
      }
      throw new Error(error.message || 'Failed to sign transaction');
    }
  };

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }

    const provider = getProvider();
    if (!provider || !provider.signMessage) {
      throw new Error('Wallet does not support message signing');
    }

    try {
      const { signature } = await provider.signMessage(message, 'utf8');
      return signature;
    } catch (error: any) {
      console.error('Signing error:', error);
      throw new Error(error.message || 'Failed to sign message');
    }
  };

  const value: WalletContextType = {
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    sendTransaction,
    signMessage,
    signTransaction,
    connection,
    getTransactionHistory,
    experienceBalance,
    reputationTier,
    validationCount,
    accuracyRate,
    refreshExperienceData,
  };

  return h(WalletContext.Provider, { value }, children);
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
