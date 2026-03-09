/**
 * Solana Configuration — Mobile
 * Mirrors src/config/solana.ts (single source of truth for program IDs & endpoints).
 * Keep in sync with the web config when program IDs change.
 */

export const SOLANA_CONFIG = {
  network: 'devnet' as const,

  rpcEndpoint: {
    devnet: 'https://api.devnet.solana.com',
    testnet: 'https://api.testnet.solana.com',
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  },

  treasuryAddress: 'BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK',

  blockchain: {
    optimizationLogProgramId: 'B68o3Pnre8XgwGBKN4aQeP8gPmPARUVfb7EufFgnVUyj',
    dbcMintAddress: '8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT',
    dbcTokenProgramId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    treasuryProgramId: 'C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk',
    membershipProgramId: 'CB6yknfo1cBWhVH2ifkMAS2tKaDa9c9mgRiZpCzHwjzu',
  },

  fees: {
    allianceLaunch: 0.5,       // SOL
    optimizationLogSubmit: 0.10, // USDC
    tradingVolumeBps: 50,       // 0.5%
  },
} as const;

export const getRpcEndpoint = () =>
  SOLANA_CONFIG.rpcEndpoint[SOLANA_CONFIG.network];

/** App identity for Mobile Wallet Adapter authorization */
export const APP_IDENTITY = {
  name: 'DBC Agent Alliance',
  uri: 'https://dbc.alliance',
  icon: '/assets/icon.png',
} as const;
