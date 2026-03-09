/**
 * Mobile Wallet Adapter hook — replaces @solana/wallet-adapter-react for mobile.
 * Uses @solana-mobile/mobile-wallet-adapter-protocol-web3js to authorize and sign
 * transactions via any MWA-compatible wallet (Phantom, Solflare, etc.).
 */

import { useState, useCallback } from 'react';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey, Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import { APP_IDENTITY, getRpcEndpoint } from '../config/solana';

export interface WalletState {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  balance: number | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    connected: false,
    connecting: false,
    balance: null,
  });

  const connection = new Connection(getRpcEndpoint(), 'confirmed');

  const connect = useCallback(async () => {
    setState(s => ({ ...s, connecting: true }));
    try {
      await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: APP_IDENTITY,
        });
        const pubkey = new PublicKey(authResult.accounts[0].address);
        const lamports = await connection.getBalance(pubkey);
        setState({
          publicKey: pubkey,
          connected: true,
          connecting: false,
          balance: lamports / 1e9,
        });
      });
    } catch (e) {
      setState(s => ({ ...s, connecting: false }));
      throw e;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ publicKey: null, connected: false, connecting: false, balance: null });
  }, []);

  const signAndSendTransaction = useCallback(
    async (transaction: Transaction): Promise<string> => {
      if (!state.publicKey) throw new Error('Wallet not connected');
      return transact(async (wallet: Web3MobileWallet) => {
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = state.publicKey!;
        const [signed] = await wallet.signTransactions({ transactions: [transaction] });
        const sig = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
        return sig;
      });
    },
    [state.publicKey],
  );

  const refreshBalance = useCallback(async () => {
    if (!state.publicKey) return;
    const lamports = await connection.getBalance(state.publicKey);
    setState(s => ({ ...s, balance: lamports / 1e9 }));
  }, [state.publicKey]);

  return { ...state, connect, disconnect, signAndSendTransaction, refreshBalance };
}
