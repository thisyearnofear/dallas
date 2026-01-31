/**
 * SolPG Client - Case Study Program
 * 
 * Usage in Solana Playground:
 * 1. Deploy the case study program
 * 2. Switch to "Client" tab
 * 3. Paste this code
 * 4. Click "Run"
 */

import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

// ============================================================================
// CONFIGURATION - Update these values
// ============================================================================

const DBC_MINT = "J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump";
const TREASURY_PROGRAM_ID = "C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCaseStudyPDA(
  submitter: PublicKey, 
  timestamp: number, 
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("case_study"),
      submitter.toBuffer(),
      Buffer.from(new BN(timestamp).toArray("le", 8))
    ],
    programId
  );
}

function getValidationPDA(
  caseStudy: PublicKey,
  validator: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("validation"),
      caseStudy.toBuffer(),
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
async function submitCaseStudy(
  ipfsCid: string,
  metadataHash: number[], // 32 bytes
  treatmentCategory: number, // 0=experimental, 1=approved, 2=alternative
  durationDays: number,
  proofOfEncryption: number[],
  lightProtocolProof: number[],
  compressionRatio: number
) {
  console.log("=== Submitting Case Study ===");
  
  const dbcMint = new PublicKey(DBC_MINT);
  const timestamp = Math.floor(Date.now() / 1000);
  
  const [caseStudyPDA] = getCaseStudyPDA(wallet.publicKey, timestamp, program.programId);
  
  console.log("Case Study PDA:", caseStudyPDA.toString());
  console.log("IPFS CID:", ipfsCid);
  console.log("Treatment Category:", treatmentCategory);
  console.log("Duration:", durationDays, "days");
  
  const tx = await program.methods
    .submitEncryptedCaseStudy(
      ipfsCid,
      metadataHash,
      treatmentCategory,
      durationDays,
      proofOfEncryption,
      lightProtocolProof,
      compressionRatio
    )
    .accounts({
      caseStudy: caseStudyPDA,
      submitter: wallet.publicKey,
      dbcMint: dbcMint,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Case study submitted! Transaction:", tx);
  return { tx, caseStudyPDA };
}

/**
 * Validate a case study
 */
async function validateCaseStudy(
  caseStudyPDA: PublicKey,
  isApproved: boolean,
  qualityScore: number, // 0-100
  commentsHash?: number[] // 32 bytes
) {
  console.log("=== Validating Case Study ===");
  
  const [validationPDA] = getValidationPDA(caseStudyPDA, wallet.publicKey, program.programId);
  
  console.log("Case Study:", caseStudyPDA.toString());
  console.log("Validation PDA:", validationPDA.toString());
  console.log("Approved:", isApproved);
  console.log("Quality Score:", qualityScore);
  
  const tx = await program.methods
    .validateCaseStudy(isApproved, qualityScore, commentsHash || new Array(32).fill(0))
    .accounts({
      caseStudy: caseStudyPDA,
      validation: validationPDA,
      validator: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Validation submitted! Transaction:", tx);
  return { tx, validationPDA };
}

/**
 * Fetch case study data
 */
async function getCaseStudy(caseStudyPDA: PublicKey) {
  try {
    const data = await program.account.caseStudy.fetch(caseStudyPDA);
    console.log("=== Case Study Data ===");
    console.log("Submitter:", data.submitter.toString());
    console.log("IPFS CID:", data.ipfsCid);
    console.log("Treatment Category:", data.treatmentCategory);
    console.log("Duration:", data.durationDays);
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
async function getValidation(validationPDA: PublicKey) {
  try {
    const data = await program.account.validation.fetch(validationPDA);
    console.log("=== Validation Data ===");
    console.log("Case Study:", data.caseStudy.toString());
    console.log("Validator:", data.validator.toString());
    console.log("Approved:", data.isApproved);
    console.log("Quality Score:", data.qualityScore);
    console.log("Timestamp:", new Date(data.timestamp.toNumber() * 1000).toISOString());
    return data;
  } catch (e) {
    console.log("Validation not found");
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
  
  // 1. Submit case study
  // await submitCaseStudy(
  //   "QmExample123456789", // IPFS CID
  //   new Array(32).fill(1), // metadata hash (32 bytes)
  //   0, // treatment category (0=experimental)
  //   30, // duration days
  //   new Array(64).fill(2), // proof of encryption
  //   new Array(128).fill(3), // light protocol proof
  //   10 // compression ratio
  // );
  
  // 2. Validate case study
  // await validateCaseStudy(
  //   new PublicKey("CASE_STUDY_PDA"),
  //   true, // approved
  //   85 // quality score
  // );
  
  // 3. Fetch case study
  // await getCaseStudy(new PublicKey("CASE_STUDY_PDA"));
  
  // 4. Fetch validation
  // await getValidation(new PublicKey("VALIDATION_PDA"));
}

main().catch(console.error);
