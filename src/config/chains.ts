/**
 * Multi-chain configuration for Dallas Agent Alliance.
 *
 * Solana remains the public coordination layer.
 * Aleo is an optional private verification layer.
 */

export type SupportedChain = 'solana' | 'aleo';

export type ChainRole = 'public_coordination' | 'private_verification';

export interface ChainConfig {
  chain: SupportedChain;
  enabled: boolean;
  role: ChainRole;
}

export const CHAIN_CONFIG: Record<SupportedChain, ChainConfig> = {
  solana: {
    chain: 'solana',
    enabled: true,
    role: 'public_coordination',
  },
  aleo: {
    chain: 'aleo',
    enabled: process.env.VITE_ENABLE_ALEO === 'true',
    role: 'private_verification',
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
  network: (process.env.VITE_ALEO_NETWORK as 'testnet' | 'mainnet') || 'testnet',
  programId: process.env.VITE_ALEO_PROGRAM_ID || '',
  relayerUrl: process.env.VITE_ALEO_RELAYER_URL || '',
};

export function isAleoEnabled(): boolean {
  return CHAIN_CONFIG.aleo.enabled;
}

export function getAleoReadiness(): AleoReadiness {
  if (!isAleoEnabled()) {
    return {
      enabled: false,
      readyForSubmission: false,
      missing: ['VITE_ENABLE_ALEO=true'],
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
    reason: warnings.length > 0
      ? 'Aleo verification is enabled in queue mode (no relayer URL).'
      : 'Aleo verification is fully configured.',
  };
}
