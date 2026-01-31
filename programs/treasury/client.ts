/**
 * SolPG Client - Treasury Program
 * 
 * Usage in Solana Playground:
 * 1. Open your deployed treasury program in SolPG
 * 2. Switch to "Client" tab
 * 3. Paste this code
 * 4. Click "Run"
 */

import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

// ============================================================================
// CONFIGURATION - These are already set for your deployment
// ============================================================================

const DBC_MINT = "J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump";

// The treasury token account that was just created
const TREASURY_TOKEN_ACCOUNT = "Eh8r4ybgRsLZjtR2MhUfEtEtMb1eRPjQx7kfYw6U6L8C";

// ============================================================================
// MAIN: Initialize Treasury
// ============================================================================

async function initializeTreasury() {
  console.log("🚀 Initializing Treasury Program");
  console.log("Program ID:", program.programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());
  
  const dbcMint = new PublicKey(DBC_MINT);
  
  // Get treasury PDA
  const [treasuryPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), dbcMint.toBuffer()],
    program.programId
  );
  
  console.log("\n=== Accounts ===");
  console.log("Treasury PDA:", treasuryPDA.toString());
  console.log("DBC Mint:", dbcMint.toString());
  console.log("Token Account:", TREASURY_TOKEN_ACCOUNT);
  console.log("Governance:", wallet.publicKey.toString());
  
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
  
  console.log("\n=== Configuration ===");
  console.log("Base Submission Reward:", config.baseSubmissionReward.toNumber() / 1_000_000, "DBC");
  console.log("Base Validation Reward:", config.baseValidationReward.toNumber() / 1_000_000, "DBC");
  console.log("Quality Bonus:", config.qualityBonusPercent.toString(), "%");
  console.log("Max Daily Case Study Rewards:", config.maxDailyCaseStudyRewards.toNumber() / 1_000_000, "DBC");
  console.log("Max Daily Validation Rewards:", config.maxDailyValidationRewards.toNumber() / 1_000_000, "DBC");
  console.log("Stake Lock Days:", config.stakeLockDays);
  console.log("Min Validator Stake:", config.minValidatorStake.toNumber() / 1_000_000, "DBC");
  console.log("Paused:", config.paused);
  
  console.log("\n=== Sending Transaction... ===");
  
  try {
    const tx = await program.methods
      .initializeTreasury(config)
      .accounts({
        treasury: treasuryPDA,
        dbcMint: dbcMint,
        treasuryTokenAccount: new PublicKey(TREASURY_TOKEN_ACCOUNT),
        governanceAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log("\n✅ Treasury initialized successfully!");
    console.log("Transaction:", tx);
    console.log("\nExplorer URL:");
    console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    
    return { success: true, tx, treasuryPDA };
    
  } catch (error) {
    console.error("\n❌ Failed to initialize:", error);
    throw error;
  }
}

// Run it
initializeTreasury().catch(console.error);
