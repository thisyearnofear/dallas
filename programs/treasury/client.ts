/**
 * SolPG Client - Treasury Program
 * 
 * Usage in Solana Playground:
 * 1. Open your deployed treasury program in SolPG
 * 2. Switch to "Client" tab
 * 3. Paste this code
 * 4. Click "Run"
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const DBC_MINT = "J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump";
const TREASURY_TOKEN_ACCOUNT = "Eh8r4ybgRsLZjtR2MhUfEtEtMb1eRPjQx7kfYw6U6L8C";

// ============================================================================
// MAIN: Initialize Treasury
// ============================================================================

async function initializeTreasury() {
  console.log("🚀 Initializing Treasury Program");
  
  // SolPG provides these globals: pg.program, pg.wallet, pg.connection
  const dbcMint = new pg.web3.PublicKey(DBC_MINT);
  
  // Get treasury PDA
  const [treasuryPDA] = pg.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), dbcMint.toBuffer()],
    pg.program.programId
  );
  
  console.log("Program ID:", pg.program.programId.toString());
  console.log("Wallet:", pg.wallet.publicKey.toString());
  console.log("Treasury PDA:", treasuryPDA.toString());
  console.log("Token Account:", TREASURY_TOKEN_ACCOUNT);
  
  // Treasury configuration
  const config = {
    baseSubmissionReward: new pg.BN(10_000_000),      // 10 DBC
    baseValidationReward: new pg.BN(5_000_000),       // 5 DBC
    qualityBonusPercent: new pg.BN(50),               // 50%
    maxDailyCaseStudyRewards: new pg.BN(1_000_000_000), // 1000 DBC/day
    maxDailyValidationRewards: new pg.BN(500_000_000),  // 500 DBC/day
    stakeLockDays: 7,
    minValidatorStake: new pg.BN(100_000_000),        // 100 DBC
    paused: false,
  };
  
  console.log("\nConfiguration:");
  console.log("- Submission Reward:", config.baseSubmissionReward.toNumber() / 1_000_000, "DBC");
  console.log("- Validation Reward:", config.baseValidationReward.toNumber() / 1_000_000, "DBC");
  console.log("- Stake Lock:", config.stakeLockDays, "days");
  
  console.log("\nSending transaction...");
  
  try {
    const tx = await pg.program.methods
      .initializeTreasury(config)
      .accounts({
        treasury: treasuryPDA,
        dbcMint: dbcMint,
        treasuryTokenAccount: new pg.web3.PublicKey(TREASURY_TOKEN_ACCOUNT),
        governanceAuthority: pg.wallet.publicKey,
        payer: pg.wallet.publicKey,
        systemProgram: pg.web3.SystemProgram.programId,
      })
      .rpc();
    
    console.log("\n✅ Treasury initialized!");
    console.log("Transaction:", tx);
    console.log("Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");
    
    return { success: true, tx };
    
  } catch (error) {
    console.error("\n❌ Failed:", error);
    throw error;
  }
}

// Run it
initializeTreasury();
