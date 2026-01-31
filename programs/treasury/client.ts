/**
 * SolPG Client - Treasury Program
 * 
 * Usage in Solana Playground:
 * 1. Deploy the treasury program
 * 2. Switch to "Client" tab
 * 3. Paste this code
 * 4. Click "Run"
 * 
 * Note: SolPG provides these globals: pg.program, pg.wallet, pg.connection
 */

/// <reference path="../solpg.d.ts" />

// ============================================================================
// CONFIGURATION - Update these values
// ============================================================================

// NOTE: For devnet testing, use a devnet token mint
// For mainnet, use the real DBC mint: J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump
// Create a devnet test token at: https://spl-token-ui.com or via CLI
const TREASURY_DBC_MINT = new web3.PublicKey("8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT"); // Devnet DBC

const TREASURY_GOVERNANCE_AUTHORITY = new web3.PublicKey("BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK");

// Standard SPL Token program (pump.fun uses this, not Token-2022)
const TREASURY_TOKEN_PROGRAM = new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TREASURY_ASSOC_TOKEN_PROGRAM = new web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function treasuryToLeBytes(num, len) {
  const arr = [];
  let n = BigInt(num);
  for (let i = 0; i < len; i++) {
    arr.push(Number(n & BigInt(0xff)));
    n >>= BigInt(8);
  }
  return arr;
}

function treasuryToBN(num) {
  return new BN.BN(num);
}

function getTreasuryPDA(programId, mint) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), mint.toBuffer()],
    programId
  );
}

function getStakePDA(validator, programId, timestamp) {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), validator.toBuffer(), Buffer.from(treasuryToLeBytes(ts, 8))],
    programId
  );
}

function getReputationPDA(validator, programId) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("reputation"), validator.toBuffer()],
    programId
  );
}

function getDailyDistPDA(treasury, day, category, programId) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("daily_dist"),
      treasury.toBuffer(),
      Buffer.from(treasuryToLeBytes(day, 8)),
      Buffer.from([category])
    ],
    programId
  );
}

function treasuryGetATA(mint, owner, allowOwnerOffCurve = false) {
  const seeds = [
    owner.toBuffer(),
    TREASURY_TOKEN_PROGRAM.toBuffer(),
    mint.toBuffer(),
  ];
  const [address] = web3.PublicKey.findProgramAddressSync(
    seeds,
    TREASURY_ASSOC_TOKEN_PROGRAM
  );
  return address;
}

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

// NOTE: DBC minting is now done via the dbc_token program (programs/dbc_token/client.ts)
// Use that client to create/mint DBC tokens for devnet testing

/**
 * Create the treasury token account (ATA) before initializing
 */
async function createTreasuryTokenAccount() {
  console.log("=== Creating Treasury Token Account ===");
  
  const [treasuryPDA] = getTreasuryPDA(pg.program.programId, TREASURY_DBC_MINT);
  const treasuryTokenAccount = treasuryGetATA(TREASURY_DBC_MINT, treasuryPDA, true);
  
  console.log("Treasury PDA:", treasuryPDA.toString());
  console.log("Token Account:", treasuryTokenAccount.toString());
  
  const accountInfo = await pg.connection.getAccountInfo(treasuryTokenAccount);
  
  if (!accountInfo) {
    console.log("Creating token account...");
    
    const ix = new web3.TransactionInstruction({
      keys: [
        { pubkey: pg.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true },
        { pubkey: treasuryPDA, isSigner: false, isWritable: false },
        { pubkey: TREASURY_DBC_MINT, isSigner: false, isWritable: false },
        { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TREASURY_TOKEN_PROGRAM, isSigner: false, isWritable: false },
      ],
      programId: TREASURY_ASSOC_TOKEN_PROGRAM,
      data: Buffer.alloc(0),
    });
    
    const tx = new web3.Transaction().add(ix);
    tx.feePayer = pg.wallet.publicKey;
    tx.recentBlockhash = (await pg.connection.getLatestBlockhash()).blockhash;
    const signedTx = await pg.wallet.signTransaction(tx);
    const sig = await pg.connection.sendRawTransaction(signedTx.serialize());
    await pg.connection.confirmTransaction(sig);
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
 */
async function initializeTreasury() {
  console.log("=== Initializing Treasury ===");
  
  const [treasuryPDA] = getTreasuryPDA(pg.program.programId, TREASURY_DBC_MINT);
  const treasuryTokenAccount = treasuryGetATA(TREASURY_DBC_MINT, treasuryPDA, true);
  
  console.log("Treasury PDA:", treasuryPDA.toString());
  console.log("Token Account:", treasuryTokenAccount.toString());
  console.log("DBC Mint:", TREASURY_DBC_MINT.toString());
  console.log("Governance:", TREASURY_GOVERNANCE_AUTHORITY.toString());
  
  const config = {
    baseSubmissionReward: treasuryToBN(10_000_000),
    baseValidationReward: treasuryToBN(5_000_000),
    qualityBonusPercent: treasuryToBN(50),
    maxDailyCaseStudyRewards: treasuryToBN(1_000_000_000),
    maxDailyValidationRewards: treasuryToBN(500_000_000),
    stakeLockDays: 7,
    minValidatorStake: treasuryToBN(100_000_000),
    paused: false,
  };
  
  const tx = await pg.program.methods
    .initializeTreasury(config)
    .accounts({
      treasury: treasuryPDA,
      dbcMint: TREASURY_DBC_MINT,
      treasuryTokenAccount: treasuryTokenAccount,
      governanceAuthority: TREASURY_GOVERNANCE_AUTHORITY,
      payer: pg.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Treasury initialized! Transaction:", tx);
  return { tx, treasuryPDA, treasuryTokenAccount };
}

/**
 * Stake DBC tokens to become a validator
 */
async function stakeDbc(amount) {
  console.log("=== Staking DBC ===");
  console.log("Amount:", amount, "DBC");
  
  const [treasuryPDA] = getTreasuryPDA(pg.program.programId, TREASURY_DBC_MINT);
  
  const timestamp = Math.floor(Date.now() / 1000);
  const [stakePDA] = getStakePDA(pg.wallet.publicKey, pg.program.programId, timestamp);
  
  const validatorTokenAccount = treasuryGetATA(TREASURY_DBC_MINT, pg.wallet.publicKey);
  const stakeEscrow = treasuryGetATA(TREASURY_DBC_MINT, stakePDA, true);
  
  console.log("Stake PDA:", stakePDA.toString());
  console.log("Validator Token Account:", validatorTokenAccount.toString());
  console.log("Stake Escrow:", stakeEscrow.toString());
  
  const tx = await pg.program.methods
    .stakeDbc(treasuryToBN(amount * 1_000_000))
    .accounts({
      treasury: treasuryPDA,
      stakeAccount: stakePDA,
      validatorTokenAccount: validatorTokenAccount,
      stakeEscrow: stakeEscrow,
      dbcMint: TREASURY_DBC_MINT,
      validator: pg.wallet.publicKey,
      tokenProgram: TREASURY_TOKEN_PROGRAM,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Staked! Transaction:", tx);
  return { tx, stakePDA };
}

/**
 * Unstake DBC after lock period
 */
async function unstakeDbc(stakePDA) {
  console.log("=== Unstaking DBC ===");
  
  const [treasuryPDA] = getTreasuryPDA(pg.program.programId, TREASURY_DBC_MINT);
  
  const validatorTokenAccount = treasuryGetATA(TREASURY_DBC_MINT, pg.wallet.publicKey);
  const stakeEscrow = treasuryGetATA(TREASURY_DBC_MINT, stakePDA, true);
  
  const tx = await pg.program.methods
    .unstakeDbc()
    .accounts({
      stakeAccount: stakePDA,
      treasury: treasuryPDA,
      stakeEscrow: stakeEscrow,
      validatorTokenAccount: validatorTokenAccount,
      dbcMint: TREASURY_DBC_MINT,
      validator: pg.wallet.publicKey,
      tokenProgram: TREASURY_TOKEN_PROGRAM,
    })
    .rpc();
  
  console.log("✅ Unstaked! Transaction:", tx);
  return { tx };
}

/**
 * Reward a case study submitter (governance only)
 */
async function rewardCaseStudy(recipient, amount, qualityScore) {
  console.log("=== Rewarding Case Study ===");
  
  const [treasuryPDA] = getTreasuryPDA(pg.program.programId, TREASURY_DBC_MINT);
  
  const treasuryTokenAccount = treasuryGetATA(TREASURY_DBC_MINT, treasuryPDA, true);
  const recipientTokenAccount = treasuryGetATA(TREASURY_DBC_MINT, recipient);
  
  const now = Math.floor(Date.now() / 1000);
  const day = Math.floor(now / 86400);
  const [distTracker] = getDailyDistPDA(treasuryPDA, day, 0, pg.program.programId);
  
  const tx = await pg.program.methods
    .rewardCaseStudy(treasuryToBN(amount * 1_000_000), qualityScore)
    .accounts({
      treasury: treasuryPDA,
      treasuryTokenAccount: treasuryTokenAccount,
      recipientTokenAccount: recipientTokenAccount,
      recipient: recipient,
      caseStudyProgram: pg.wallet.publicKey,
      dbcMint: TREASURY_DBC_MINT,
      distributionTracker: distTracker,
      payer: pg.wallet.publicKey,
      tokenProgram: TREASURY_TOKEN_PROGRAM,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Rewarded! Transaction:", tx);
  return { tx };
}

/**
 * Reward a validator (governance only)
 */
async function rewardValidator(validator, validationCount, accuracyRate) {
  console.log("=== Rewarding Validator ===");
  
  const [treasuryPDA] = getTreasuryPDA(pg.program.programId, TREASURY_DBC_MINT);
  
  const treasuryTokenAccount = treasuryGetATA(TREASURY_DBC_MINT, treasuryPDA, true);
  const validatorTokenAccount = treasuryGetATA(TREASURY_DBC_MINT, validator);
  
  const [reputationPDA] = getReputationPDA(validator, pg.program.programId);
  
  const now = Math.floor(Date.now() / 1000);
  const day = Math.floor(now / 86400);
  const [distTracker] = getDailyDistPDA(treasuryPDA, day, 1, pg.program.programId);
  
  const tx = await pg.program.methods
    .rewardValidator(validationCount, accuracyRate)
    .accounts({
      treasury: treasuryPDA,
      treasuryTokenAccount: treasuryTokenAccount,
      validatorTokenAccount: validatorTokenAccount,
      validator: validator,
      dbcMint: TREASURY_DBC_MINT,
      validatorReputation: reputationPDA,
      distributionTracker: distTracker,
      payer: pg.wallet.publicKey,
      tokenProgram: TREASURY_TOKEN_PROGRAM,
      systemProgram: web3.SystemProgram.programId,
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
  
  const [treasuryPDA] = getTreasuryPDA(pg.program.programId, TREASURY_DBC_MINT);
  
  const tx = await pg.program.methods
    .emergencyPause()
    .accounts({
      treasury: treasuryPDA,
      governanceAuthority: pg.wallet.publicKey,
    })
    .rpc();
  
  console.log("✅ Paused! Transaction:", tx);
  return { tx };
}

/**
 * Fetch treasury data
 */
async function getTreasuryData() {
  const [treasuryPDA] = getTreasuryPDA(pg.program.programId, TREASURY_DBC_MINT);
  
  try {
    const data = await pg.program.account.treasury.fetch(treasuryPDA);
    console.log("=== Treasury Data ===");
    console.log("DBC Mint:", data.dbcMint.toString());
    console.log("Governance Authority:", data.governanceAuthority.toString());
    console.log("Total Distributed:", Number(data.totalDistributed) / 1_000_000, "DBC");
    console.log("Total Staked:", Number(data.totalStaked) / 1_000_000, "DBC");
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

console.log("🚀 Treasury Program Client");
console.log("Program ID:", pg.program.programId.toString());
console.log("Wallet:", pg.wallet.publicKey.toString());

// Uncomment ONE of these inside the run() function:

async function runTreasury() {
  // 1. Setup: Create treasury token account (run before initialize)
  await createTreasuryTokenAccount();

  // 2. Initialize treasury (run once after deployment)
  // await initializeTreasury();

  // 3. Stake DBC (amount in DBC tokens)
  // await stakeDbc(100);

  // 4. Unstake DBC (provide stake PDA)
  // await unstakeDbc(new web3.PublicKey("YOUR_STAKE_PDA"));

  // 5. Reward case study (governance only)
  // await rewardCaseStudy(new web3.PublicKey("RECIPIENT"), 10, 85);

  // 6. Reward validator (governance only)
  // await rewardValidator(new web3.PublicKey("VALIDATOR"), 5, 90);

  // 7. Emergency pause (governance only)
  // await emergencyPause();

  // 8. Fetch data
  // await getTreasuryData();
}

runTreasury().catch(console.error);
