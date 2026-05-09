/**
 * Multi-chain configuration for Dallas Agent Alliance.
 *
 * Solana remains the public coordination layer.
 * Aleo is an optional private verification layer.
 */

export type SupportedChain = 'solana' | 'aleo';

export type ChainRole = 'public_coordination' | 'private_verification';

export interface ChainConfig {
  id: SupportedChain;
  name: string;
  enabled: boolean;
  role: ChainRole;
  explorerUrl: string;
  rpcUrl?: string;
  relayerUrl?: string;
  programId?: string;
}

export interface ChainsState {
  solana: ChainConfig;
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

// Backwards-compatible alias for older import sites.
export const CHAIN_CONFIG = CHAINS_CONFIG;

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

export function getAleoReadiness(): AleoReadiness {
  if (!isAleoEnabled()) {
    return {
      enabled: false,
      readyForSubmission: false,
      missing: ['VITE_ALEO_ENABLED=true'],
      warnings: [],
      reason: 'Aleo verification is turned off.',
    };
  }

  const missing: string[] = [];
  const warnings: string[] = [];

  if (!ALEO_CONFIG.programId) {
    missing.push('VITE_ALEO_PROGRAM_ID');
  }

  if (!ALEO_CONFIG.relayerUrl) {
    warnings.push('VITE_ALEO_RELAYER_URL');
  }

  if (missing.length > 0) {
    return {
      enabled: true,
      readyForSubmission: false,
      missing,
      warnings,
      reason: 'Aleo verification is enabled but not fully configured.',
    };
  }

  return {
    enabled: true,
    readyForSubmission: true,
    missing: [],
    warnings,
    reason:
      warnings.length > 0
        ? 'Aleo verification is enabled in queue mode (no relayer URL).'
        : 'Aleo verification is fully configured.',
  };
}
