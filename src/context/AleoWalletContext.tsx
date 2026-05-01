import { h, createContext } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import { isAleoEnabled } from '../config/chains';

export const AleoWalletContext = createContext(null);

export interface AleoWalletContextType {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getBalance: () => Promise<number>;
}

async function checkShieldWallet(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const anyWindow = window as any;
  return !!(anyWindow.shield || anyWindow.aleo);
}

export function AleoWalletProvider({ children }: { children: any }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (!isAleoEnabled()) return;
      const hasShield = await checkShieldWallet();
      if (hasShield) {
        const anyWindow = window as any;
        const wallet = anyWindow.shield || anyWindow.aleo;
        if (wallet?.address) {
          setAddress(wallet.address);
          setConnected(true);
        }
      }
    };
    setTimeout(checkConnection, 500);
  }, []);

  const connectFn = async () => {
    if (!isAleoEnabled()) {
      throw new Error('Aleo is not enabled. Set VITE_ALEO_ENABLED=true');
    }
    setConnecting(true);
    try {
      const anyWindow = window as any;
      const wallet = anyWindow.shield || anyWindow.aleo;
      if (wallet) {
        try {
          await wallet.connect();
          if (wallet.address) {
            setAddress(wallet.address);
            setConnected(true);
          }
        } catch (e) {
          window.open('https://aleo.org/shield', '_blank');
        }
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnectFn = async () => {
    const anyWindow = window as any;
    const wallet = anyWindow.shield || anyWindow.aleo;
    if (wallet?.disconnect) {
      await wallet.disconnect();
    }
    setAddress(null);
    setConnected(false);
  };

  const getBalanceFn = async () => {
    return 0;
  };

  const value = {
    address,
    connected,
    connecting,
    connect: connectFn,
    disconnect: disconnectFn,
    getBalance: getBalanceFn,
  };

  return h(AleoWalletContext.Provider, { value }, children);
}

export function useAleoWallet(): AleoWalletContextType {
  const context = useContext(AleoWalletContext);
  if (!context) {
    throw new Error('useAleoWallet must be used within AleoWalletProvider');
  }
  return context;
}

