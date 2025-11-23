/**
 * Solana Configuration
 * Update these values with your actual wallet addresses and network
 */

export const SOLANA_CONFIG = {
  // Network: 'devnet', 'testnet', or 'mainnet-beta'
  network: 'devnet' as const,
  
  // RPC endpoints
  rpcEndpoint: {
    devnet: 'https://api.devnet.solana.com',
    testnet: 'https://api.testnet.solana.com',
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  },

  // Your wallet address where donations/payments go
  treasuryAddress: 'BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK',

  // Token mint address (if using SPL tokens instead of SOL)
  // Leave null if only using SOL
  tokenMint: null as string | null,

  // Default amounts for various operations
  defaults: {
    donationAmount: 0.5,
    membershipBronze: 0.1,
    membershipSilver: 0.5,
    membershipGold: 2.0,
  },
} as const;

export function getRpcEndpoint(): string {
  return SOLANA_CONFIG.rpcEndpoint[SOLANA_CONFIG.network];
}
