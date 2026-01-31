/**
 * SolPG Client - Treasury Program
 *
 * Paste this in SolPG Client tab and click Run
 */

// Use the globals provided by SolPG
const { program, wallet, connection } = pg;

// Configuration
// NOTE: Using devnet token for testing. Change to mainnet token for production:
// const TREASURY_DBC_MINT = new web3.PublicKey("J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump");  // Mainnet pump.fun
const TREASURY_DBC_MINT = new web3.PublicKey("8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT");  // Devnet token
const TREASURY_TOKEN_ACCOUNT = new web3.PublicKey("Eh8r4ybgRsLZjtR2MhUfEtEtMb1eRPjQx7kfYw6U6L8C");

async function initializeTreasury() {
  console.log("🚀 Initializing Treasury Program");
  console.log("Program ID:", program.programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());

  // Get treasury PDA
  const [treasuryPDA] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), TREASURY_DBC_MINT.toBuffer()],
    program.programId
  );
  
  console.log("Treasury PDA:", treasuryPDA.toString());
  console.log("Token Account:", TREASURY_TOKEN_ACCOUNT.toString());

  // Treasury configuration
  const config = {
    baseSubmissionReward: new BN.BN(10_000_000),
    baseValidationReward: new BN.BN(5_000_000),
    qualityBonusPercent: new BN.BN(50),
    maxDailyCaseStudyRewards: new BN.BN(1_000_000_000),
    maxDailyValidationRewards: new BN.BN(500_000_000),
    stakeLockDays: 7,
    minValidatorStake: new BN.BN(100_000_000),
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
      dbcMint: TREASURY_DBC_MINT,
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
