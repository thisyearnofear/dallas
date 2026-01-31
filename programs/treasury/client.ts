/**
 * SolPG Client - Treasury Program
 * 
 * Paste this in SolPG Client tab and click Run
 */

// Use the globals provided by SolPG
const { program, wallet, connection, BN } = pg;

// Configuration
const DBC_MINT = new web3.PublicKey("J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump");
const TREASURY_TOKEN_ACCOUNT = new web3.PublicKey("Eh8r4ybgRsLZjtR2MhUfEtEtMb1eRPjQx7kfYw6U6L8C");

async function initializeTreasury() {
  console.log("🚀 Initializing Treasury Program");
  console.log("Program ID:", program.programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());
  
  // Get treasury PDA
  const [treasuryPDA] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), DBC_MINT.toBuffer()],
    program.programId
  );
  
  console.log("Treasury PDA:", treasuryPDA.toString());
  console.log("Token Account:", TREASURY_TOKEN_ACCOUNT.toString());
  
  // Treasury configuration
  const config = {
    baseSubmissionReward: new BN(10_000_000),
    baseValidationReward: new BN(5_000_000),
    qualityBonusPercent: new BN(50),
    maxDailyCaseStudyRewards: new BN(1_000_000_000),
    maxDailyValidationRewards: new BN(500_000_000),
    stakeLockDays: 7,
    minValidatorStake: new BN(100_000_000),
    paused: false,
  };
  
  console.log("\nConfiguration:");
  console.log("- Submission Reward:", config.baseSubmissionReward.toNumber() / 1_000_000, "DBC");
  console.log("- Validation Reward:", config.baseValidationReward.toNumber() / 1_000_000, "DBC");
  
  console.log("\nSending transaction...");
  
  const tx = await program.methods
    .initializeTreasury(config)
    .accounts({
      treasury: treasuryPDA,
      dbcMint: DBC_MINT,
      treasuryTokenAccount: TREASURY_TOKEN_ACCOUNT,
      governanceAuthority: wallet.publicKey,
      payer: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("\n✅ Treasury initialized!");
  console.log("Transaction:", tx);
  console.log("Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");
}

initializeTreasury().catch(console.error);
