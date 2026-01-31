/**
 * SolPG Client - Membership Program
 * 
 * Usage in Solana Playground:
 * 1. Deploy the membership program
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

const MEMBERSHIP_TREASURY = new web3.PublicKey("BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK");

const MEMBERSHIP_PRICES = {
  bronze: 0.1,  // SOL
  silver: 0.5,  // SOL
  gold: 2.0,    // SOL
};

const MEMBERSHIP_TOKEN_PROGRAM = new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const MEMBERSHIP_ASSOC_TOKEN_PROGRAM = new web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const MEMBERSHIP_RENT_SYSVAR = new web3.PublicKey("SysvarRent111111111111111111111111111111111");

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function membershipToBN(num: number) {
  return new BN.BN(num);
}

function membershipLamports(sol: number) {
  return membershipToBN(sol * 1_000_000_000);
}

function getConfigPDA(programId: any): [any, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId
  );
}

function getMembershipPDA(member: any, programId: any): [any, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("membership"), member.toBuffer()],
    programId
  );
}

function getMembershipMintPDA(tier: number, programId: any): [any, number] {
  const tierName = tier === 0 ? "Bronze" : tier === 1 ? "Silver" : "Gold";
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("membership_mint"), Buffer.from(tierName)],
    programId
  );
}

function membershipGetATA(mint: any, owner: any) {
  const seeds = [
    owner.toBuffer(),
    MEMBERSHIP_TOKEN_PROGRAM.toBuffer(),
    mint.toBuffer(),
  ];
  const [address] = web3.PublicKey.findProgramAddressSync(
    seeds,
    MEMBERSHIP_ASSOC_TOKEN_PROGRAM
  );
  return address;
}

// ============================================================================
// INSTRUCTIONS
// ============================================================================

/**
 * Initialize the membership program
 */
async function initialize() {
  console.log("=== Initializing Membership Program ===");
  
  const [configPDA] = getConfigPDA(pg.program.programId);
  
  console.log("Config PDA:", configPDA.toString());
  console.log("Treasury:", MEMBERSHIP_TREASURY.toString());
  console.log("Authority:", pg.wallet.publicKey.toString());
  
  const tx = await pg.program.methods
    .initialize(
      membershipLamports(MEMBERSHIP_PRICES.bronze),
      membershipLamports(MEMBERSHIP_PRICES.silver),
      membershipLamports(MEMBERSHIP_PRICES.gold)
    )
    .accounts({
      config: configPDA,
      treasury: MEMBERSHIP_TREASURY,
      authority: pg.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Initialized! Transaction:", tx);
  return { tx, configPDA };
}

/**
 * Purchase a membership NFT
 * @param tier "bronze" | "silver" | "gold"
 */
async function purchaseMembership(tier: "bronze" | "silver" | "gold", nickname: string, healthFocus?: string) {
  console.log("=== Purchasing Membership ===");
  console.log("Tier:", tier, "Nickname:", nickname);
  
  // Convert tier string to enum object for Anchor (PascalCase)
  const tierEnum = tier === "bronze" ? { Bronze: {} } 
                 : tier === "silver" ? { Silver: {} } 
                 : { Gold: {} };
  const tierIndex = tier === "bronze" ? 0 : tier === "silver" ? 1 : 2;
  
  const [configPDA] = getConfigPDA(pg.program.programId);
  const [membershipPDA] = getMembershipPDA(pg.wallet.publicKey, pg.program.programId);
  const [membershipMintPDA] = getMembershipMintPDA(tierIndex, pg.program.programId);
  
  const memberTokenAccount = membershipGetATA(membershipMintPDA, pg.wallet.publicKey);
  
  console.log("Membership PDA:", membershipPDA.toString());
  console.log("Mint PDA:", membershipMintPDA.toString());
  console.log("Token Account:", memberTokenAccount.toString());
  
  const tx = await (pg.program.methods as any)
    .purchaseMembership(tierEnum, nickname, healthFocus || null)
    .accounts({
      config: configPDA,
      membership: membershipPDA,
      membershipMint: membershipMintPDA,
      memberTokenAccount: memberTokenAccount,
      treasury: MEMBERSHIP_TREASURY,
      member: pg.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: MEMBERSHIP_TOKEN_PROGRAM,
      associatedTokenProgram: MEMBERSHIP_ASSOC_TOKEN_PROGRAM,
      rent: MEMBERSHIP_RENT_SYSVAR,
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
  
  const [configPDA] = getConfigPDA(pg.program.programId);
  const [membershipPDA] = getMembershipPDA(pg.wallet.publicKey, pg.program.programId);
  
  const tx = await pg.program.methods
    .renewMembership()
    .accounts({
      config: configPDA,
      membership: membershipPDA,
      treasury: MEMBERSHIP_TREASURY,
      member: pg.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Membership renewed! Transaction:", tx);
  return { tx };
}

/**
 * Update profile
 */
async function updateProfile(nickname?: string, healthFocus?: string) {
  console.log("=== Updating Profile ===");
  
  const [membershipPDA] = getMembershipPDA(pg.wallet.publicKey, pg.program.programId);
  
  const tx = await pg.program.methods
    .updateProfile(nickname || null, healthFocus || null)
    .accounts({
      membership: membershipPDA,
      member: pg.wallet.publicKey,
    })
    .rpc();
  
  console.log("✅ Profile updated! Transaction:", tx);
  return { tx };
}

/**
 * Fetch membership data
 */
async function getMembership(member?: any) {
  const target = member || pg.wallet.publicKey;
  const [membershipPDA] = getMembershipPDA(target, pg.program.programId);
  
  try {
    const data = await pg.program.account.membership.fetch(membershipPDA);
    console.log("=== Membership Data ===");
    console.log("Member:", data.member.toString());
    console.log("Tier:", data.tier);
    console.log("Nickname:", data.nickname);
    console.log("Health Focus:", data.healthFocus);
    console.log("Is Active:", data.isActive);
    console.log("Expires At:", new Date(Number(data.expiresAt) * 1000).toISOString());
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
  const [configPDA] = getConfigPDA(pg.program.programId);
  
  try {
    const data = await pg.program.account.config.fetch(configPDA);
    console.log("=== Config Data ===");
    console.log("Authority:", data.authority.toString());
    console.log("Treasury:", data.treasury.toString());
    console.log("Bronze Price:", Number(data.bronzePrice) / 1_000_000_000, "SOL");
    console.log("Silver Price:", Number(data.silverPrice) / 1_000_000_000, "SOL");
    console.log("Gold Price:", Number(data.goldPrice) / 1_000_000_000, "SOL");
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

console.log("🚀 Membership Program Client");
console.log("Program ID:", pg.program.programId.toString());
console.log("Wallet:", pg.wallet.publicKey.toString());

// Uncomment ONE of these inside the run() function:

async function runMembership() {
  // 1. Initialize (run once after deployment)
  await initialize();

  // 2. Purchase membership ("bronze", "silver", or "gold")
  // await purchaseMembership("bronze", "MyNickname", "chronic pain");

  // 3. Renew membership
  // await renewMembership();

  // 4. Update profile
  // await updateProfile("NewNickname", "immune support");

  // 5. Fetch data
  // await getConfig();
  // await getMembership();
}

runMembership().catch(console.error);
