/**
 * Initialize Treasury Program
 * 
 * Usage:
 * npx ts-node scripts/initialize_treasury.ts
 */

import { Connection, PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, BN, Wallet } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const TREASURY_PROGRAM_ID = new PublicKey('C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk');
// NOTE: Using devnet token for testing. Change to mainnet token for production:
// const DBC_MINT = new PublicKey('J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump');  // Mainnet pump.fun
const DBC_MINT = new PublicKey('8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT');  // Devnet token

// Load wallet from Solana CLI config
function loadWallet(): Keypair {
  const keypairPath = path.join(process.env.HOME || '', '.config', 'solana', 'id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

// Treasury IDL (simplified)
const TREASURY_IDL = {
  version: '0.1.0',
  name: 'dbc_treasury',
  instructions: [
    {
      name: 'initializeTreasury',
      accounts: [
        { name: 'treasury', isMut: true, isSigner: false },
        { name: 'dbcMint', isMut: false, isSigner: false },
        { name: 'treasuryTokenAccount', isMut: false, isSigner: false },
        { name: 'governanceAuthority', isMut: false, isSigner: false },
        { name: 'payer', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        {
          name: 'config',
          type: {
            defined: 'TreasuryConfig',
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'treasury',
      type: {
        kind: 'struct',
        fields: [
          { name: 'dbcMint', type: 'publicKey' },
          { name: 'governanceAuthority', type: 'publicKey' },
          { name: 'treasuryTokenAccount', type: 'publicKey' },
          { name: 'config', type: { defined: 'TreasuryConfig' } },
          { name: 'totalDistributed', type: 'u64' },
          { name: 'totalStaked', type: 'u64' },
          { name: 'initialized', type: 'bool' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
  types: [
    {
      name: 'TreasuryConfig',
      type: {
        kind: 'struct',
        fields: [
          { name: 'baseSubmissionReward', type: 'u64' },
          { name: 'baseValidationReward', type: 'u64' },
          { name: 'qualityBonusPercent', type: 'u64' },
          { name: 'maxDailyCaseStudyRewards', type: 'u64' },
          { name: 'maxDailyValidationRewards', type: 'u64' },
          { name: 'stakeLockDays', type: 'u16' },
          { name: 'minValidatorStake', type: 'u64' },
          { name: 'paused', type: 'bool' },
        ],
      },
    },
  ],
};

async function main() {
  console.log('🚀 Initializing Treasury Program\n');

  // Setup connection and wallet
  const connection = new Connection(RPC_URL, 'confirmed');
  const wallet = loadWallet();
  const provider = new AnchorProvider(connection, new Wallet(wallet), { commitment: 'confirmed' });

  console.log('Wallet:', wallet.publicKey.toString());
  console.log('Program ID:', TREASURY_PROGRAM_ID.toString());
  console.log('DBC Mint:', DBC_MINT.toString());

  // Create program
  const program = new Program(TREASURY_IDL as any, TREASURY_PROGRAM_ID, provider);

  // Get PDAs
  const [treasuryPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury'), DBC_MINT.toBuffer()],
    TREASURY_PROGRAM_ID
  );

  const treasuryTokenAccount = await getAssociatedTokenAddress(
    DBC_MINT,
    treasuryPDA,
    true // allowOwnerOffCurve
  );

  console.log('\n=== Accounts ===');
  console.log('Treasury PDA:', treasuryPDA.toString());
  console.log('Token Account:', treasuryTokenAccount.toString());

  // Check if already initialized
  try {
    const existing = await program.account.treasury.fetch(treasuryPDA);
    console.log('\n⚠️  Treasury already initialized!');
    console.log('Governance Authority:', existing.governanceAuthority.toString());
    console.log('Total Distributed:', existing.totalDistributed.toString());
    console.log('Paused:', existing.config.paused);
    return;
  } catch (e) {
    console.log('\n✅ Treasury not initialized yet, proceeding...');
  }

  // Treasury configuration
  const config = {
    baseSubmissionReward: new BN(10_000_000),      // 10 DBC
    baseValidationReward: new BN(5_000_000),       // 5 DBC
    qualityBonusPercent: new BN(50),               // 50%
    maxDailyCaseStudyRewards: new BN(1_000_000_000), // 1000 DBC/day
    maxDailyValidationRewards: new BN(500_000_000),  // 500 DBC/day
    stakeLockDays: 7,
    minValidatorStake: new BN(100_000_000),        // 100 DBC
    paused: false,
  };

  console.log('\n=== Configuration ===');
  console.log('Base Submission Reward:', config.baseSubmissionReward.toNumber() / 1_000_000, 'DBC');
  console.log('Base Validation Reward:', config.baseValidationReward.toNumber() / 1_000_000, 'DBC');
  console.log('Quality Bonus:', config.qualityBonusPercent.toString(), '%');
  console.log('Stake Lock Days:', config.stakeLockDays);
  console.log('Min Validator Stake:', config.minValidatorStake.toNumber() / 1_000_000, 'DBC');

  // Initialize
  console.log('\n=== Initializing... ===');
  try {
    const tx = await program.methods
      .initializeTreasury(config)
      .accounts({
        treasury: treasuryPDA,
        dbcMint: DBC_MINT,
        treasuryTokenAccount: treasuryTokenAccount,
        governanceAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('\n✅ Treasury initialized successfully!');
    console.log('Transaction:', tx);
    console.log('\nExplorer URL:');
    console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);

  } catch (error: any) {
    console.error('\n❌ Failed to initialize:', error.message);
    if (error.logs) {
      console.error('Logs:', error.logs);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
