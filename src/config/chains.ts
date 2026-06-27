/**
 * Multi-chain configuration for Dallas Agent Alliance.
 *
 * - Solana: public coordination layer (log storage, rewards, governance)
 * - Stellar: canonical ZK verification via Soroban (BN254 UltraHonk verifier)
 * - Aleo: optional private verification layer
 */

export type SupportedChain = 'solana' | 'stellar' | 'aleo';

export type ChainRole = 'public_coordination' | 'zk_verification' | 'private_verification';

export interface ChainConfig {
  id: SupportedChain;
  name: string;
  enabled: boolean;
  role: ChainRole;
  explorerUrl: string;
  rpcUrl?: string;
  relayerUrl?: string;
  programId?: string;
  contractId?: string;
}

export interface ChainsState {
  solana: ChainConfig;
  stellar: ChainConfig;
  aleo: ChainConfig;
}

const env = (() => {
  try {
    return (import.meta as any)?.env ?? {};
  } catch {
    return (typeof process !== 'undefined' ? (process as any).env ?? {} : {});
  }
})();

export const CHAINS_CONFIG: ChainsState = {
  solana: {
    id: 'solana',
    name: 'Solana',
    enabled: true,
    role: 'public_coordination',
    explorerUrl: 'https://explorer.solana.com/tx',
  },
  stellar: {
    id: 'stellar',
    name: 'Stellar',
    enabled: env.VITE_STELLAR_ENABLED !== 'false',
    role: 'zk_verification',
    explorerUrl: 'https://stellar.expert/explorer/testnet/tx',
    contractId: env.VITE_STELLAR_CONTRACT_ID || 'CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3',
    rpcUrl: env.VITE_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
  },
  aleo: {
    id: 'aleo',
    name: 'Aleo',
    enabled: env.VITE_ALEO_ENABLED === 'true',
    role: 'private_verification',
    explorerUrl: 'https://explorer.aleo.org/transaction',
    rpcUrl: env.VITE_ALEO_RPC_URL || 'https://testnet3.aleo.org/api',
    relayerUrl: env.VITE_ALEO_RELAYER_URL || '',
    programId: env.VITE_ALEO_PROGRAM_ID || 'dbc_verifier.aleo',
  },
};

export interface AleoClientConfig {
  network: 'testnet' | 'mainnet';
  programId: string;
  relayerUrl: string;
}

export interface AleoReadiness {
  enabled: boolean;
  readyForSubmission: boolean;
  missing: string[];
  warnings: string[];
  reason: string;
}

export const ALEO_CONFIG: AleoClientConfig = {
  network: (env.VITE_ALEO_NETWORK as 'testnet' | 'mainnet') || 'testnet',
  programId: CHAINS_CONFIG.aleo.programId || '',
  relayerUrl: CHAINS_CONFIG.aleo.relayerUrl || '',
};

export function isAleoEnabled(): boolean {
  return CHAINS_CONFIG.aleo.enabled;
}

export function getChainConfig(chainId: string): ChainConfig | undefined {
  return CHAINS_CONFIG[chainId as keyof ChainsState];
}

export function getEnabledChains(): ChainConfig[] {
  return Object.values(CHAINS_CONFIG).filter((chain) => chain.enabled);
}

export function isStellarEnabled(): boolean {
  return CHAINS_CONFIG.stellar.enabled;
}

/** Generic readiness check for any chain */
export function getChainReadiness(chainId: SupportedChain): ChainReadiness {
  const config = CHAINS_CONFIG[chainId];
  if (!config.enabled) {
    return {
      enabled: false,
      ready: false,
      reason: `${config.name} is turned off.`,
    };
  }

  const missing: string[] = [];
  if (!config.contractId && chainId === 'stellar') {
    missing.push('VITE_STELLAR_CONTRACT_ID');
  }
  if (!config.programId && chainId === 'aleo') {
    missing.push('VITE_ALEO_PROGRAM_ID');
  }

  if (missing.length > 0) {
    return {
      enabled: true,
      ready: false,
      missing,
      reason: `${config.name} enabled but not fully configured: missing ${missing.join(', ')}.`,
    };
  }

  return {
    enabled: true,
    ready: true,
    missing: [],
    reason: `${config.name} is fully configured.`,
  };
}

/** @deprecated Use getChainReadiness('aleo') instead */
export function getAleoReadiness(): AleoReadiness {
  const r = getChainReadiness('aleo');
  return {
    enabled: r.enabled,
    readyForSubmission: r.ready,
    missing: r.missing ?? [],
    warnings: [],
    reason: r.reason,
  };
}

export interface ChainReadiness {
  enabled: boolean;
  ready: boolean;
  missing?: string[];
  reason: string;
}
