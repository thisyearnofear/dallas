export interface ChainConfig {
  id: string;
  name: string;
  enabled: boolean;
  explorerUrl: string;
  rpcUrl?: string;
  relayerUrl?: string;
}

export interface ChainsState {
  solana: ChainConfig;
  aleo: ChainConfig;
}

export const CHAINS_CONFIG: ChainsState = {
  solana: {
    id: 'solana',
    name: 'Solana',
    enabled: true,
    explorerUrl: 'https://explorer.solana.com/tx',
  },
  aleo: {
    id: 'aleo',
    name: 'Aleo',
    enabled: import.meta.env?.VITE_ALEO_ENABLED === 'true',
    explorerUrl: 'https://explorer.aleo.org/transaction',
    rpcUrl: import.meta.env?.VITE_ALEO_RPC_URL || 'https://testnet3.aleo.org/api',
    relayerUrl: import.meta.env?.VITE_ALEO_RELAYER_URL,
    programId: import.meta.env?.VITE_ALEO_PROGRAM_ID || 'dbc_verifier.aleo',
  },
};

export function isAleoEnabled(): boolean {
  return CHAINS_CONFIG.aleo.enabled && !!CHAINS_CONFIG.aleo.relayerUrl;
}

export function getChainConfig(chainId: string): ChainConfig | undefined {
  const config = CHAINS_CONFIG[chainId as keyof ChainsState];
  return config;
}

export function getEnabledChains(): ChainConfig[] {
  return Object.values(CHAINS_CONFIG).filter((chain) => chain.enabled);
}
