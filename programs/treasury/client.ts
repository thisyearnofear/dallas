/**
 * SolPG Client - Treasury Program
 * 
 * Usage in Solana Playground:
 * 1. Deploy the treasury program
 * 2. Switch to "Client" tab
 * 3. Paste this code
 * 4. Click "Run"
 */

import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";

// ============================================================================
// CONFIGURATION - Update these values
// ============================================================================

const DBC_MINT = "J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump";
const GOVERNANCE_AUTHORITY = "BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTreasuryPDA(programId: PublicKey, mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), mint.toBuffer()],
    programId
  );
}

function getStakePDA(validator: PublicKey, programId: PublicKey, timestamp?: number): [PublicKey, number] {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), validator.toBuffer(), Buffer.from(new BN(ts).toArray("le", 8))],
    programId
  );
}

function getReputationPDA(validator: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("reputation"), validator.toBuffer()],
    programId
  );
}

function getDailyDistPDA(treasury: PublicKey, day: number, category: number, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("daily_dist"),
      treasury.toBuffer(),
      Buffer.from(new BN(day).toArray("le", 8)),
      Buffer.from([category])
    ],
    programId
  );
}

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

/**
 * Create the treasury token account (ATA) before initializing
 * This holds the DBC tokens for rewards
 */
async function createTreasuryTokenAccount() {
  console.log("=== Creating Treasury Token Account ===");
  
  const dbcMint = new PublicKey(DBC_MINT);
  const [treasuryPDA] = getTreasuryPDA(program.programId, dbcMint);
  
  const treasuryTokenAccount = await getAssociatedTokenAddress(
    dbcMint,
    treasuryPDA,
    true // allowOwnerOffCurve - needed for PDAs
  );
  
  console.log("Treasury PDA:", treasuryPDA.toString());
  console.log("Token Account:", treasuryTokenAccount.toString());
  
  // Check if account exists
  const accountInfo = await connection.getAccountInfo(treasuryTokenAccount);
  
  if (!accountInfo) {
    console.log("Creating token account...");
    const tx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey, // payer
        treasuryTokenAccount, // ata
        treasuryPDA, // owner
        dbcMint // mint
      )
    );
    
    const sig = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction(sig);
    console.log("✅ Created! Transaction:", sig);
  } else {
    console.log("Token account already exists");
  }
  
  return { treasuryPDA, treasuryTokenAccount };
}

// ============================================================================
// INSTRUCTIONS
// ============================================================================

/**
 * Initialize the treasury program
 * Call this once after deployment and creating the token account
 */
async function initializeTreasury() {
  console.log("=== Initializing Treasury ===");
  
  const dbcMint = new PublicKey(DBC_MINT);
  const governanceAuthority = new PublicKey(GOVERNANCE_AUTHORITY);
  
  const [treasuryPDA] = getTreasuryPDA(program.programId, dbcMint);
  
  // Get or create treasury token account
  const treasuryTokenAccount = await getAssociatedTokenAddress(
    dbcMint,
    treasuryPDA,
    true
  );
  
  console.log("Treasury PDA:", treasuryPDA.toString());
  console.log("Token Account:", treasuryTokenAccount.toString());
  console.log("DBC Mint:", dbcMint.toString());
  console.log("Governance:", governanceAuthority.toString());
  
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
  
  const tx = await program.methods
    .initializeTreasury(config)
    .accounts({
      treasury: treasuryPDA,
      dbcMint: dbcMint,
      treasuryTokenAccount: treasuryTokenAccount,
      governanceAuthority: governanceAuthority,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Treasury initialized! Transaction:", tx);
  return { tx, treasuryPDA, treasuryTokenAccount };
}

/**
 * Stake DBC tokens to become a validator
 */
async function stakeDbc(amount: number) {
  console.log("=== Staking DBC ===");
  console.log("Amount:", amount, "DBC");
  
  const dbcMint = new PublicKey(DBC_MINT);
  const [treasuryPDA] = getTreasuryPDA(program.programId, dbcMint);
  
  // Get stake PDA with current timestamp
  const timestamp = Math.floor(Date.now() / 1000);
  const [stakePDA] = getStakePDA(wallet.publicKey, program.programId, timestamp);
  
  // Get token accounts
  const validatorTokenAccount = await getAssociatedTokenAddress(dbcMint, wallet.publicKey);
  const stakeEscrow = await getAssociatedTokenAddress(dbcMint, stakePDA, true);
  
  console.log("Stake PDA:", stakePDA.toString());
  console.log("Validator Token Account:", validatorTokenAccount.toString());
  console.log("Stake Escrow:", stakeEscrow.toString());
  
  const tx = await program.methods
    .stakeDbc(new BN(amount * 1_000_000)) // Convert to base units
    .accounts({
      treasury: treasuryPDA,
      stakeAccount: stakePDA,
      validatorTokenAccount: validatorTokenAccount,
      stakeEscrow: stakeEscrow,
      dbcMint: dbcMint,
      validator: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Staked! Transaction:", tx);
  return { tx, stakePDA };
}

/**
 * Unstake DBC after lock period
 */
async function unstakeDbc(stakePDA: PublicKey) {
  console.log("=== Unstaking DBC ===");
  
  const dbcMint = new PublicKey(DBC_MINT);
  const [treasuryPDA] = getTreasuryPDA(program.programId, dbcMint);
  
  const validatorTokenAccount = await getAssociatedTokenAddress(dbcMint, wallet.publicKey);
  const stakeEscrow = await getAssociatedTokenAddress(dbcMint, stakePDA, true);
  
  const tx = await program.methods
    .unstakeDbc()
    .accounts({
      stakeAccount: stakePDA,
      treasury: treasuryPDA,
      stakeEscrow: stakeEscrow,
      validatorTokenAccount: validatorTokenAccount,
      dbcMint: dbcMint,
      validator: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  
  console.log("✅ Unstaked! Transaction:", tx);
  return { tx };
}

/**
 * Reward a case study submitter (governance only)
 */
async function rewardCaseStudy(
  recipient: PublicKey,
  amount: number,
  qualityScore: number
) {
  console.log("=== Rewarding Case Study ===");
  
  const dbcMint = new PublicKey(DBC_MINT);
  const [treasuryPDA] = getTreasuryPDA(program.programId, dbcMint);
  
  const treasuryTokenAccount = await getAssociatedTokenAddress(dbcMint, treasuryPDA, true);
  const recipientTokenAccount = await getAssociatedTokenAddress(dbcMint, recipient);
  
  // Get day for distribution tracker
  const now = Math.floor(Date.now() / 1000);
  const day = Math.floor(now / 86400);
  const [distTracker] = getDailyDistPDA(treasuryPDA, day, 0, program.programId); // 0 = CaseStudy
  
  const tx = await program.methods
    .rewardCaseStudy(new BN(amount * 1_000_000), qualityScore)
    .accounts({
      treasury: treasuryPDA,
      treasuryTokenAccount: treasuryTokenAccount,
      recipientTokenAccount: recipientTokenAccount,
      recipient: recipient,
      caseStudyProgram: wallet.publicKey, // Or actual case study program
      dbcMint: dbcMint,
      distributionTracker: distTracker,
      payer: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Rewarded! Transaction:", tx);
  return { tx };
}

/**
 * Reward a validator (governance only)
 */
async function rewardValidator(
  validator: PublicKey,
  validationCount: number,
  accuracyRate: number
) {
  console.log("=== Rewarding Validator ===");
  
  const dbcMint = new PublicKey(DBC_MINT);
  const [treasuryPDA] = getTreasuryPDA(program.programId, dbcMint);
  
  const treasuryTokenAccount = await getAssociatedTokenAddress(dbcMint, treasuryPDA, true);
  const validatorTokenAccount = await getAssociatedTokenAddress(dbcMint, validator);
  
  const [reputationPDA] = getReputationPDA(validator, program.programId);
  
  const now = Math.floor(Date.now() / 1000);
  const day = Math.floor(now / 86400);
  const [distTracker] = getDailyDistPDA(treasuryPDA, day, 1, program.programId); // 1 = Validation
  
  const tx = await program.methods
    .rewardValidator(validationCount, accuracyRate)
    .accounts({
      treasury: treasuryPDA,
      treasuryTokenAccount: treasuryTokenAccount,
      validatorTokenAccount: validatorTokenAccount,
      validator: validator,
      dbcMint: dbcMint,
      validatorReputation: reputationPDA,
      distributionTracker: distTracker,
      payer: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Validator rewarded! Transaction:", tx);
  return { tx };
}

/**
 * Emergency pause (governance only)
 */
async function emergencyPause() {
  console.log("=== Emergency Pause ===");
  
  const dbcMint = new PublicKey(DBC_MINT);
  const [treasuryPDA] = getTreasuryPDA(program.programId, dbcMint);
  
  const tx = await program.methods
    .emergencyPause()
    .accounts({
      treasury: treasuryPDA,
      governanceAuthority: wallet.publicKey,
    })
    .rpc();
  
  console.log("✅ Paused! Transaction:", tx);
  return { tx };
}

/**
 * Fetch treasury data
 */
async function getTreasuryData() {
  const dbcMint = new PublicKey(DBC_MINT);
  const [treasuryPDA] = getTreasuryPDA(program.programId, dbcMint);
  
  try {
    const data = await program.account.treasury.fetch(treasuryPDA);
    console.log("=== Treasury Data ===");
    console.log("DBC Mint:", data.dbcMint.toString());
    console.log("Governance Authority:", data.governanceAuthority.toString());
    console.log("Total Distributed:", data.totalDistributed.toNumber() / 1_000_000, "DBC");
    console.log("Total Staked:", data.totalStaked.toNumber() / 1_000_000, "DBC");
    console.log("Initialized:", data.initialized);
    console.log("Paused:", data.config.paused);
    return data;
  } catch (e) {
    console.log("Treasury not initialized");
    return null;
  }
}

// ============================================================================
// MAIN - Uncomment the function you want to run
// ============================================================================

async function main() {
  console.log("Program ID:", program.programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());
  
  // Uncomment ONE of these:
  
  // 1. Setup: Create treasury token account (run before initialize)
  // await createTreasuryTokenAccount();
  
  // 2. Initialize treasury (run once after deployment)
  // await initializeTreasury();
  
  // 3. Stake DBC (amount in DBC tokens)
  // await stakeDbc(100);
  
  // 4. Unstake DBC (provide stake PDA)
  // await unstakeDbc(new PublicKey("YOUR_STAKE_PDA"));
  
  // 5. Reward case study (governance only)
  // await rewardCaseStudy(new PublicKey("RECIPIENT"), 10, 85);
  
  // 6. Reward validator (governance only)
  // await rewardValidator(new PublicKey("VALIDATOR"), 5, 90);
  
  // 7. Emergency pause (governance only)
  // await emergencyPause();
  
  // 8. Fetch data
  // await getTreasuryData();
}

main().catch(console.error);
