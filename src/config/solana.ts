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

  // Smart contract program IDs (from solpgf deployment)
  // Update these after deploying to solpgf
  // See SOLPGF_DEPLOYMENT.md for instructions
  blockchain: {
    caseStudyProgramId: 'CaseStudyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    experienceTokenProgramId: 'ExperienceTokenXXXXXXXXXXXXXXXXXXXXXXXX',
    experienceMintAddress: 'ExperienceMintXXXXXXXXXXXXXXXXXXXXXXXXX',
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
