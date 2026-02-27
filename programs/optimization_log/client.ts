/**
 * SolPG Client - Optimization Log Program
 * 
 * Usage in Solana Playground:
 * 1. Deploy the case study program
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

// NOTE: Using devnet token for testing. Change to mainnet token for production:
// const CASE_STUDY_DBC_MINT = new web3.PublicKey("J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump"); // Mainnet pump.fun
const CASE_STUDY_DBC_MINT = new web3.PublicKey("8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT"); // Devnet token
const CASE_STUDY_TREASURY_PROGRAM = new web3.PublicKey("C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk");

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function optimizationLogToLeBytes(num, len) {
  const arr = [];
  let n = BigInt(num);
  for (let i = 0; i < len; i++) {
    arr.push(Number(n & BigInt(0xff)));
    n >>= BigInt(8);
  }
  return arr;
}

function getOptimizationLogPDA(submitter, timestamp, programId) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("optimization_log"),
      submitter.toBuffer(),
      Buffer.from(optimizationLogToLeBytes(timestamp, 8))
    ],
    programId
  );
}

function getValidationPDA(optimizationLog, validator, programId) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("validation"),
      optimizationLog.toBuffer(),
      validator.toBuffer()
    ],
    programId
  );
}

// ============================================================================
// INSTRUCTIONS
// ============================================================================

/**
 * Submit an encrypted case study
 */
async function submitOptimizationLog(
  ipfsCid,
  metadataHash, // 32 bytes
  optimizationCategory, // 0=experimental, 1=approved, 2=alternative
  executionDuration,
  proofOfEncryption,
  lightProtocolProof,
  compressionRatio
) {
  console.log("=== Submitting Optimization Log ===");
  
  const timestamp = Math.floor(Date.now() / 1000);
  const [optimizationLogPDA] = getOptimizationLogPDA(pg.wallet.publicKey, timestamp, pg.program.programId);
  
  console.log("Optimization Log PDA:", optimizationLogPDA.toString());
  console.log("IPFS CID:", ipfsCid);
  console.log("Optimization Category:", optimizationCategory);
  console.log("Execution Duration:", executionDuration, "days");
  
  const tx = await pg.program.methods
    .submitEncryptedOptimizationLog(
      ipfsCid,
      metadataHash,
      optimizationCategory,
      executionDuration,
      proofOfEncryption,
      lightProtocolProof,
      compressionRatio
    )
    .accounts({
      optimizationLog: optimizationLogPDA,
      submitter: pg.wallet.publicKey,
      dbcMint: CASE_STUDY_DBC_MINT,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Case study submitted! Transaction:", tx);
  return { tx, optimizationLogPDA };
}

/**
 * Validate a case study
 */
async function validateOptimizationLog(
  optimizationLogPDA,
  isApproved,
  qualityScore, // 0-100
  commentsHash // 32 bytes (optional)
) {
  console.log("=== Validating Optimization Log ===");
  
  const [validationPDA] = getValidationPDA(optimizationLogPDA, pg.wallet.publicKey, pg.program.programId);
  
  console.log("Optimization Log:", optimizationLogPDA.toString());
  console.log("Validation PDA:", validationPDA.toString());
  console.log("Approved:", isApproved);
  console.log("Quality Score:", qualityScore);
  
  const tx = await pg.program.methods
    .validateOptimizationLog(isApproved, qualityScore, commentsHash || new Array(32).fill(0))
    .accounts({
      optimizationLog: optimizationLogPDA,
      validation: validationPDA,
      validator: pg.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Validation submitted! Transaction:", tx);
  return { tx, validationPDA };
}

/**
 * Fetch case study data
 */
async function getOptimizationLog(optimizationLogPDA) {
  try {
    const data = await pg.program.account.optimizationLog.fetch(optimizationLogPDA);
    console.log("=== Optimization Log Data ===");
    console.log("Submitter:", data.submitter.toString());
    console.log("IPFS CID:", data.ipfsCid);
    console.log("Optimization Category:", data.optimizationCategory);
    console.log("Execution Duration:", data.executionDuration);
    console.log("Validation Count:", data.validationCount);
    console.log("Status:", data.status);
    console.log("Quality Score:", data.qualityScore);
    return data;
  } catch (e) {
    console.log("Case study not found");
    return null;
  }
}

/**
 * Fetch validation data
 */
async function getValidation(validationPDA) {
  try {
    const data = await pg.program.account.validation.fetch(validationPDA);
    console.log("=== Validation Data ===");
    console.log("Optimization Log:", data.optimizationLog.toString());
    console.log("Validator:", data.validator.toString());
    console.log("Approved:", data.isApproved);
    console.log("Quality Score:", data.qualityScore);
    console.log("Timestamp:", new Date(Number(data.timestamp) * 1000).toISOString());
    return data;
  } catch (e) {
    console.log("Validation not found");
    return null;
  }
}

// ============================================================================
// MAIN - Uncomment the function you want to run
// ============================================================================

console.log("🚀 Optimization Log Program Client");
console.log("Program ID:", pg.program.programId.toString());
console.log("Wallet:", pg.wallet.publicKey.toString());

// Uncomment ONE of these inside the run() function:

async function runOptimizationLog() {
  // 1. Submit case study
  // await submitOptimizationLog(
  //   "QmExample123456789", // IPFS CID
  //   new Array(32).fill(1), // metadata hash (32 bytes)
  //   0, // treatment category (0=experimental)
  //   30, // duration days
  //   new Array(64).fill(2), // proof of encryption
  //   new Array(128).fill(3), // light protocol proof
  //   10 // compression ratio
  // );

  // 2. Validate case study
  // await validateOptimizationLog(
  //   new web3.PublicKey("CASE_STUDY_PDA"),
  //   true, // approved
  //   85 // quality score
  // );

  // 3. Fetch case study
  // await getOptimizationLog(new web3.PublicKey("CASE_STUDY_PDA"));

  // 4. Fetch validation
  // await getValidation(new web3.PublicKey("VALIDATION_PDA"));
}

runOptimizationLog().catch(console.error);
