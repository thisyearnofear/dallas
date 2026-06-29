/**
 * Solana Configuration for Dallas Buyers Club: Agent Alliance
 * 
 * IMPORTANT: After deploying to solpgf, update the program IDs below
 * You'll get these from https://beta.solpg.io/ deployment output
 */

// Injected by Vite at build-time (see vite.config.ts). In Jest/Node it may be undefined.
declare const __DBC_SOLANA_NETWORK__: string | undefined;
declare const __DBC_SOLANA_RPC_ENDPOINT__: string | undefined;
declare const __DBC_SOLANA_OPTIMIZATION_LOG_PROGRAM_ID__: string | undefined;
declare const __DBC_DBC_MINT_ADDRESS__: string | undefined;
declare const __DBC_TREASURY_PROGRAM_ID__: string | undefined;
declare const __DBC_MEMBERSHIP_PROGRAM_ID__: string | undefined;
declare const __DBC_DBC_TOKEN_PROGRAM_ID_DEVNET__: string | undefined;

type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta';

function envStr(v: any): string {
  return typeof v === 'string' ? v : '';
}

function pick(...vals: Array<string | undefined>): string {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  return '';
}

const DEFAULTS_BY_NETWORK: Record<SolanaNetwork, {
  optimizationLogProgramId: string;
  dbcMintAddress: string;
  treasuryProgramId: string;
  membershipProgramId: string;
  dbcTokenProgramIdDevnet: string;
}> = {
  devnet: {
    optimizationLogProgramId: '8tma3jnv8ZazAKxawZsE5yh3NPt1ymsEoysS2B1w2Gxx',
    dbcMintAddress: '8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT',
    treasuryProgramId: 'C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk',
    membershipProgramId: 'CB6yknfo1cBWhVH2ifkMAS2tKaDa9c9mgRiZpCzHwjzu',
    dbcTokenProgramIdDevnet: '21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB',
  },
  // Until you deploy to testnet, require explicit env overrides.
  testnet: {
    optimizationLogProgramId: '',
    dbcMintAddress: '',
    treasuryProgramId: '',
    membershipProgramId: '',
    dbcTokenProgramIdDevnet: '',
  },
  // Mainnet values are intentionally not auto-filled for hackathon safety.
  'mainnet-beta': {
    optimizationLogProgramId: '',
    // DBC mint on mainnet may be pump or custom; require explicit override.
    dbcMintAddress: '',
    treasuryProgramId: '',
    membershipProgramId: '',
    dbcTokenProgramIdDevnet: '',
  },
};

export const SOLANA_CONFIG = {
  // Network: 'devnet', 'testnet', or 'mainnet-beta'
  // Controlled via env so we can do devnet/testnet pilots before mainnet.
  network: (
    // Injected at build-time by Vite define() (see vite.config.ts)
    (typeof __DBC_SOLANA_NETWORK__ !== 'undefined' && __DBC_SOLANA_NETWORK__) ||
    // Jest/Node runtime
    (typeof process !== 'undefined' ? (process as any).env?.VITE_SOLANA_NETWORK : undefined) ||
    'devnet'
  ) as SolanaNetwork,

  // RPC endpoints
  rpcEndpoint: {
    devnet: 'https://api.devnet.solana.com',
    testnet: 'https://api.testnet.solana.com',
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  },

  // Helius RPC endpoints (for enhanced indexing and webhooks)
  helius: {
    apiKey: process.env.VITE_HELIUS_API_KEY || '',
    rpcUrl: (network: string) => `https://${network}.helius-rpc.com/?api-key=${process.env.VITE_HELIUS_API_KEY || ''}`,
    webhookUrl: process.env.VITE_HELIUS_WEBHOOK_URL || '',
  },

  // Your wallet address where donations/payments go
  treasuryAddress: 'BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK',

  // Smart contract program IDs (from deployment)
  blockchain: {
    optimizationLogProgramId: '', // populated below
    // DBC Token - Platform Coordination Token
    // Mainnet: J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump (pump.fun)
    // Devnet:  8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT (custom program)
    dbcMintAddress: '', // populated below
    dbcTokenProgramId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Standard SPL Token Program
    // Treasury Program (deploy to SolPG, then update)
    treasuryProgramId: '', // populated below
    membershipProgramId: '', // populated below

    // DBC Token Program (devnet)
    dbcTokenProgramIdDevnet: '', // populated below
    dbcMintAddressDevnet: '8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT',
    attentionTokenFactoryProgramId: '', // optional (deploy later)
    governanceProgramId: 'DBCGoVFq5xGnD1WNCLauKoFG4Y4Rw3xPp3z3t8X6w3x',
  },

  // Bags API configuration for attention tokens
  bagsApi: {
    url: '/api/bags',
    key: 'proxied', // Handled server-side via API route
    partnerConfig: process.env.VITE_BAGS_PARTNER_CONFIG || '', // For referral fee sharing
    rateLimit: parseInt(process.env.VITE_BAGS_RATE_LIMIT || '1000'),
  },

  // Alliance token configuration
  attentionToken: {
    minReputationScore: 75,
    minValidators: 5,
    initialLiquidity: 1_000_000, // 1 SOL in lamports
    feePercentage: 2, // 2% trading fee
    distribution: {
      submitter: 50, // 50%
      bondingCurve: 30, // 30%
      validators: 10, // 10%
      platform: 10, // 10%
    },
    feeDistribution: {
      submitter: 50, // 50% of trading fees
      validators: 10, // 10% of trading fees
      platform: 10, // 10% of trading fees
      liquidity: 30, // 30% of trading fees
    },
    graduationThreshold: {
      marketCap: 100_000, // $100k
      dailyVolume: 10_000, // $10k/day
      consecutiveDays: 7, // 7 days
    },
  },

  // Default amounts for various operations (in DBC token base units)
  // DBC Token: 8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT
  defaults: {
    donationAmount: 0.5, // SOL
    membershipBronze: 0.1, // SOL
    membershipSilver: 0.5, // SOL
    membershipGold: 2.0, // SOL
    // DBC Token amounts (assuming 6 decimals - adjust if different)
    validatorStake: 100, // DBC tokens (minimum stake for validators)
    submitReward: 10, // DBC tokens (reward for optimization log submission)
    validationReward: 5, // DBC tokens (reward for validation)
    referralReward: 50, // DBC tokens (reward for successful referral)
  },
} as const;

// Apply network-aware defaults + env overrides (single source of truth).
(() => {
  const net = SOLANA_CONFIG.network;
  const defaults = DEFAULTS_BY_NETWORK[net];

  const nodeEnv = typeof process !== 'undefined' ? (process as any).env || {} : {};

  // Prefer build-time injected constants, then Node env, then defaults.
  (SOLANA_CONFIG.blockchain as any).optimizationLogProgramId = pick(
    envStr(typeof __DBC_SOLANA_OPTIMIZATION_LOG_PROGRAM_ID__ !== 'undefined' ? __DBC_SOLANA_OPTIMIZATION_LOG_PROGRAM_ID__ : ''),
    nodeEnv.VITE_SOLANA_OPTIMIZATION_LOG_PROGRAM_ID,
    defaults.optimizationLogProgramId
  );

  (SOLANA_CONFIG.blockchain as any).dbcMintAddress = pick(
    envStr(typeof __DBC_DBC_MINT_ADDRESS__ !== 'undefined' ? __DBC_DBC_MINT_ADDRESS__ : ''),
    nodeEnv.VITE_DBC_MINT_ADDRESS,
    defaults.dbcMintAddress
  );

  (SOLANA_CONFIG.blockchain as any).treasuryProgramId = pick(
    envStr(typeof __DBC_TREASURY_PROGRAM_ID__ !== 'undefined' ? __DBC_TREASURY_PROGRAM_ID__ : ''),
    nodeEnv.VITE_TREASURY_PROGRAM_ID,
    defaults.treasuryProgramId
  );

  (SOLANA_CONFIG.blockchain as any).membershipProgramId = pick(
    envStr(typeof __DBC_MEMBERSHIP_PROGRAM_ID__ !== 'undefined' ? __DBC_MEMBERSHIP_PROGRAM_ID__ : ''),
    nodeEnv.VITE_MEMBERSHIP_PROGRAM_ID,
    defaults.membershipProgramId
  );

  (SOLANA_CONFIG.blockchain as any).dbcTokenProgramIdDevnet = pick(
    envStr(typeof __DBC_DBC_TOKEN_PROGRAM_ID_DEVNET__ !== 'undefined' ? __DBC_DBC_TOKEN_PROGRAM_ID_DEVNET__ : ''),
    nodeEnv.VITE_DBC_TOKEN_PROGRAM_ID_DEVNET,
    defaults.dbcTokenProgramIdDevnet
  );

  // RPC override (optional)
  const rpcOverride = pick(
    envStr(typeof __DBC_SOLANA_RPC_ENDPOINT__ !== 'undefined' ? __DBC_SOLANA_RPC_ENDPOINT__ : ''),
    nodeEnv.VITE_SOLANA_RPC_ENDPOINT
  );
  if (rpcOverride) (SOLANA_CONFIG.rpcEndpoint as any)[net] = rpcOverride;
})();

export function getRpcEndpoint(): string {
  return SOLANA_CONFIG.rpcEndpoint[SOLANA_CONFIG.network];
}

export function getBlockchainConfigErrors(): string[] {
  const { blockchain } = SOLANA_CONFIG;
  const errors: string[] = [];
  const isMissing = (addr: string) => !addr || addr.includes('XXXX') || addr.includes('XXX');

  if (isMissing(blockchain.dbcMintAddress)) {
    errors.push('Missing DBC mint address (VITE_DBC_MINT_ADDRESS).');
  }

  if (isMissing(blockchain.optimizationLogProgramId)) {
    errors.push('Missing optimization log program id (VITE_SOLANA_OPTIMIZATION_LOG_PROGRAM_ID).');
  }

  return errors;
}

/**
 * Validate that smart contracts are deployed
 * Throws error if critical program IDs are not set
 */
export function validateBlockchainConfig(): void {
  const errors = getBlockchainConfigErrors();
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }
}
