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
    experienceTokenProgramId: 'E6Cc4TX3H2ikxmmztsvRTB8rrYaiTZdaNFd1PBPWCjE4',
    experienceMintAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // Temporary mock address - replace with actual after creation
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

  // Default amounts for various operations
  defaults: {
    donationAmount: 0.5,
    membershipBronze: 0.1,
    membershipSilver: 0.5,
    membershipGold: 2.0,
    validatorStake: 10, // EXPERIENCE tokens (minimum)
    submitReward: 1, // EXPERIENCE tokens
    validationReward: 0.1, // EXPERIENCE tokens
  },
} as const;

export function getRpcEndpoint(): string {
  return SOLANA_CONFIG.rpcEndpoint[SOLANA_CONFIG.network];
}

/**
 * Validate that smart contracts are deployed
 * Throws error if program IDs are not set
 */
export function validateBlockchainConfig(): void {
  const { blockchain } = SOLANA_CONFIG;

  const isPlaceholder = (addr: string) => addr.includes('XXXX') || addr.includes('XXX');

  if (isPlaceholder(blockchain.caseStudyProgramId)) {
    throw new Error(
      'Case Study Program ID not configured. Deploy to solpgf and update SOLANA_CONFIG.blockchain.caseStudyProgramId'
    );
  }

  if (isPlaceholder(blockchain.experienceTokenProgramId)) {
    throw new Error(
      'Experience Token Program ID not configured. Deploy to solpgf and update SOLANA_CONFIG.blockchain.experienceTokenProgramId'
    );
  }

  if (isPlaceholder(blockchain.experienceMintAddress)) {
    throw new Error(
      'Experience Mint Address not configured. Create mint on solpgf and update SOLANA_CONFIG.blockchain.experienceMintAddress'
    );
  }
}
