/**
 * Solana Configuration for Dallas Buyers Club
 * 
 * IMPORTANT: After deploying to solpgf, update the program IDs below
 * You'll get these from https://beta.solpg.io/ deployment output
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

  // Smart contract program IDs (from deployment)
  blockchain: {
    caseStudyProgramId: 'EqtUtzoDUq8fQSdQATey5wJgmZHm4bEpDsKb24vHmPd6',
    // DALLAS BUYERS CLUB Token - Main Community Token
    // Mint: J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump
    dbcMintAddress: 'J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump',
    dbcTokenProgramId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Standard SPL Token Program
    // Treasury Program (deploy to SolPG, then update)
    treasuryProgramId: 'C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk', // Deployed on devnet
    
    // Legacy - to be deprecated
    experienceTokenProgramId: 'E6Cc4TX3H2ikxmmztsvRTB8rrYaiTZdaNFd1PBPWCjE4',
    experienceMintAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    attentionTokenFactoryProgramId: 'XXXX', // To be deployed
  },

  // Bags API configuration for attention tokens
  bagsApi: {
    url: '/api/bags',
    key: 'proxied', // Handled server-side via API route
    partnerConfig: import.meta.env.VITE_BAGS_PARTNER_CONFIG || '', // For referral fee sharing
    rateLimit: parseInt(import.meta.env.VITE_BAGS_RATE_LIMIT || '1000'),
  },

  // Attention token configuration
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
  // DBC Token: J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump
  defaults: {
    donationAmount: 0.5, // SOL
    membershipBronze: 0.1, // SOL
    membershipSilver: 0.5, // SOL
    membershipGold: 2.0, // SOL
    // DBC Token amounts (assuming 6 decimals - adjust if different)
    validatorStake: 100, // DBC tokens (minimum stake for validators)
    submitReward: 10, // DBC tokens (reward for case study submission)
    validationReward: 5, // DBC tokens (reward for validation)
    referralReward: 50, // DBC tokens (reward for successful referral)
  },
} as const;

export function getRpcEndpoint(): string {
  return SOLANA_CONFIG.rpcEndpoint[SOLANA_CONFIG.network];
}

/**
 * Validate that smart contracts are deployed
 * Throws error if critical program IDs are not set
 */
export function validateBlockchainConfig(): void {
  const { blockchain } = SOLANA_CONFIG;

  const isPlaceholder = (addr: string) => addr.includes('XXXX') || addr.includes('XXX');

  // Validate DBC Token is configured (primary token)
  if (isPlaceholder(blockchain.dbcMintAddress)) {
    throw new Error(
      'DBC Token Mint Address not configured. Set SOLANA_CONFIG.blockchain.dbcMintAddress to your DALLAS BUYERS CLUB token mint'
    );
  }

  // Case study program is optional for basic functionality
  if (isPlaceholder(blockchain.caseStudyProgramId)) {
    console.warn(
      'Case Study Program ID not configured. Deploy to solpgf and update SOLANA_CONFIG.blockchain.caseStudyProgramId for validation features'
    );
  }
}
