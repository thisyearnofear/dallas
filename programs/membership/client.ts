/**
 * SolPG Client - Membership Program
 * 
 * Usage in Solana Playground:
 * 1. Deploy the membership program
 * 2. Switch to "Client" tab
 * 3. Paste this code
 * 4. Click "Run"
 */

import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

// ============================================================================
// CONFIGURATION - Update these values
// ============================================================================

const TREASURY_ADDRESS = "BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK";

const PRICES = {
  bronze: 0.1,  // SOL
  silver: 0.5,  // SOL
  gold: 2.0,    // SOL
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function lamports(sol: number): BN {
  return new BN(sol * 1_000_000_000);
}

function getConfigPDA(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId
  );
}

function getMembershipPDA(member: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("membership"), member.toBuffer()],
    programId
  );
}

function getMembershipMintPDA(tier: number, programId: PublicKey): [PublicKey, number] {
  const tierName = tier === 0 ? "Bronze" : tier === 1 ? "Silver" : "Gold";
  return PublicKey.findProgramAddressSync(
    [Buffer.from("membership_mint"), Buffer.from(tierName)],
    programId
  );
}

// ============================================================================
// INSTRUCTIONS
// ============================================================================

/**
 * Initialize the membership program
 * Call this once after deployment
 */
async function initialize() {
  console.log("=== Initializing Membership Program ===");
  
  const treasury = new PublicKey(TREASURY_ADDRESS);
  const [configPDA] = getConfigPDA(program.programId);
  
  console.log("Config PDA:", configPDA.toString());
  console.log("Treasury:", treasury.toString());
  console.log("Authority:", wallet.publicKey.toString());
  
  const tx = await program.methods
    .initialize(
      lamports(PRICES.bronze),
      lamports(PRICES.silver),
      lamports(PRICES.gold)
    )
    .accounts({
      config: configPDA,
      treasury: treasury,
      authority: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Initialized! Transaction:", tx);
  return { tx, configPDA };
}

/**
 * Purchase a membership NFT
 * @param tier 0 = Bronze, 1 = Silver, 2 = Gold
 * @param nickname User's nickname (3-32 chars)
 * @param healthFocus Optional health focus area
 */
async function purchaseMembership(
  tier: 0 | 1 | 2,
  nickname: string,
  healthFocus?: string
) {
  console.log("=== Purchasing Membership ===");
  console.log("Tier:", tier, "Nickname:", nickname);
  
  const [configPDA] = getConfigPDA(program.programId);
  const [membershipPDA] = getMembershipPDA(wallet.publicKey, program.programId);
  const [membershipMintPDA] = getMembershipMintPDA(tier, program.programId);
  
  // Get associated token account for member
  const { getAssociatedTokenAddress } = await import("@solana/spl-token");
  const memberTokenAccount = await getAssociatedTokenAddress(
    membershipMintPDA,
    wallet.publicKey
  );
  
  console.log("Membership PDA:", membershipPDA.toString());
  console.log("Mint PDA:", membershipMintPDA.toString());
  console.log("Token Account:", memberTokenAccount.toString());
  
  const tx = await program.methods
    .purchaseMembership(tier, nickname, healthFocus || null)
    .accounts({
      config: configPDA,
      membership: membershipPDA,
      membershipMint: membershipMintPDA,
      memberTokenAccount: memberTokenAccount,
      treasury: new PublicKey(TREASURY_ADDRESS),
      member: wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
      rent: new PublicKey("SysvarRent111111111111111111111111111111111"),
    })
    .rpc();
  
  console.log("✅ Membership purchased! Transaction:", tx);
  return { tx, membershipPDA, membershipMintPDA };
}

/**
 * Renew existing membership
 */
async function renewMembership() {
  console.log("=== Renewing Membership ===");
  
  const [configPDA] = getConfigPDA(program.programId);
  const [membershipPDA] = getMembershipPDA(wallet.publicKey, program.programId);
  
  const tx = await program.methods
    .renewMembership()
    .accounts({
      config: configPDA,
      membership: membershipPDA,
      treasury: new PublicKey(TREASURY_ADDRESS),
      member: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Membership renewed! Transaction:", tx);
  return { tx };
}

/**
 * Update profile (nickname and/or health focus)
 */
async function updateProfile(nickname?: string, healthFocus?: string) {
  console.log("=== Updating Profile ===");
  
  const [membershipPDA] = getMembershipPDA(wallet.publicKey, program.programId);
  
  const tx = await program.methods
    .updateProfile(nickname || null, healthFocus || null)
    .accounts({
      membership: membershipPDA,
      member: wallet.publicKey,
    })
    .rpc();
  
  console.log("✅ Profile updated! Transaction:", tx);
  return { tx };
}

/**
 * Fetch membership data for a user
 */
async function getMembership(member?: PublicKey) {
  const target = member || wallet.publicKey;
  const [membershipPDA] = getMembershipPDA(target, program.programId);
  
  try {
    const data = await program.account.membership.fetch(membershipPDA);
    console.log("=== Membership Data ===");
    console.log("Member:", data.member.toString());
    console.log("Tier:", data.tier);
    console.log("Nickname:", data.nickname);
    console.log("Health Focus:", data.healthFocus);
    console.log("Is Active:", data.isActive);
    console.log("Expires At:", new Date(data.expiresAt.toNumber() * 1000).toISOString());
    return data;
  } catch (e) {
    console.log("No membership found for:", target.toString());
    return null;
  }
}

/**
 * Fetch config data
 */
async function getConfig() {
  const [configPDA] = getConfigPDA(program.programId);
  
  try {
    const data = await program.account.config.fetch(configPDA);
    console.log("=== Config Data ===");
    console.log("Authority:", data.authority.toString());
    console.log("Treasury:", data.treasury.toString());
    console.log("Bronze Price:", data.bronzePrice.toNumber() / 1_000_000_000, "SOL");
    console.log("Silver Price:", data.silverPrice.toNumber() / 1_000_000_000, "SOL");
    console.log("Gold Price:", data.goldPrice.toNumber() / 1_000_000_000, "SOL");
    console.log("Initialized:", data.initialized);
    return data;
  } catch (e) {
    console.log("Config not initialized");
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
  
  // 1. Initialize (run once after deployment)
  // await initialize();
  
  // 2. Purchase membership (0=Bronze, 1=Silver, 2=Gold)
  // await purchaseMembership(0, "MyNickname", "chronic pain");
  
  // 3. Renew membership
  // await renewMembership();
  
  // 4. Update profile
  // await updateProfile("NewNickname", "immune support");
  
  // 5. Fetch data
  // await getConfig();
  // await getMembership();
}

main().catch(console.error);
