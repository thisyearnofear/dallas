/**
 * SolPG Client - DBC Token Program
 * 
 * Usage in Solana Playground:
 * 1. Deploy the dbc_token program
 * 2. Switch to "Client" tab
 * 3. Paste this code
 * 4. Click "Run"
 * 
 * Note: SolPG provides these globals: pg.program, pg.wallet, pg.connection
 */

/// <reference path="../solpg.d.ts" />

// ============================================================================
// CONFIGURATION - Update these after deployment
// ============================================================================

// After deploying, update this with the new mint address from initializeToken
const DBC_MINT = new web3.PublicKey("8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT");

const DBC_TREASURY = new web3.PublicKey("BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK");

const DBC_TOKEN_PROGRAM = new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const DBC_ASSOC_TOKEN_PROGRAM = new web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function dbcToBN(num) {
  return new BN.BN(num);
}

function getTokenConfigPDA(programId) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("token_config")],
    programId
  );
}

function dbcGetATA(mint, owner) {
  const seeds = [
    owner.toBuffer(),
    DBC_TOKEN_PROGRAM.toBuffer(),
    mint.toBuffer(),
  ];
  const [address] = web3.PublicKey.findProgramAddressSync(
    seeds,
    DBC_ASSOC_TOKEN_PROGRAM
  );
  return address;
}

// ============================================================================
// INSTRUCTIONS
// ============================================================================

/**
 * Create a new DBC token mint
 * Run this FIRST after deploying the program
 */
async function createDbcMint() {
  console.log("=== Creating DBC Token Mint ===");
  
  const mintKeypair = web3.Keypair.generate();
  const mintRent = await pg.connection.getMinimumBalanceForRentExemption(82);
  
  const createMintIx = web3.SystemProgram.createAccount({
    fromPubkey: pg.wallet.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: 82,
    lamports: mintRent,
    programId: DBC_TOKEN_PROGRAM,
  });
  
  // Initialize mint with 6 decimals
  const initMintIx = new web3.TransactionInstruction({
    keys: [
      { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
      { pubkey: new web3.PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false },
    ],
    programId: DBC_TOKEN_PROGRAM,
    data: Buffer.from([
      0, // InitializeMint instruction
      6, // decimals
      ...pg.wallet.publicKey.toBuffer(), // mint authority
      1, // has freeze authority
      ...pg.wallet.publicKey.toBuffer(), // freeze authority
    ]),
  });
  
  const tx = new web3.Transaction().add(createMintIx, initMintIx);
  tx.feePayer = pg.wallet.publicKey;
  tx.recentBlockhash = (await pg.connection.getLatestBlockhash()).blockhash;
  tx.partialSign(mintKeypair);
  const signedTx = await pg.wallet.signTransaction(tx);
  const sig = await pg.connection.sendRawTransaction(signedTx.serialize());
  await pg.connection.confirmTransaction(sig);
  
  console.log("✅ DBC Mint Created!");
  console.log("");
  console.log("🔑 DBC MINT ADDRESS:", mintKeypair.publicKey.toString());
  console.log("");
  console.log("👉 UPDATE DBC_MINT in this file with the address above!");
  console.log("👉 Also update TREASURY_DBC_MINT in treasury/client.ts");
  console.log("👉 And update src/config/solana.ts dbcMintAddress");
  console.log("");
  console.log("Transaction:", sig);
  
  return mintKeypair.publicKey;
}

/**
 * Initialize the DBC token program
 * Run after creating the mint
 */
async function initializeToken() {
  console.log("=== Initializing DBC Token ===");
  
  const [configPDA] = getTokenConfigPDA(pg.program.programId);
  
  console.log("Config PDA:", configPDA.toString());
  console.log("Mint:", DBC_MINT.toString());
  console.log("Treasury:", DBC_TREASURY.toString());
  
  const tx = await (pg.program.methods as any)
    .initializeToken(6) // 6 decimals
    .accounts({
      tokenConfig: configPDA,
      mint: DBC_MINT,
      governanceAuthority: pg.wallet.publicKey,
      treasury: DBC_TREASURY,
      payer: pg.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ DBC Token Initialized!");
  console.log("Transaction:", tx);
  return { tx, configPDA };
}

/**
 * Mint DBC tokens to your wallet (for testing)
 * You must be the mint authority
 */
async function mintDbc(amount) {
  console.log("=== Minting DBC ===");
  console.log("Amount:", amount, "DBC");
  
  const ata = dbcGetATA(DBC_MINT, pg.wallet.publicKey);
  const ataInfo = await pg.connection.getAccountInfo(ata);
  
  const ixs = [];
  
  // Create ATA if needed
  if (!ataInfo) {
    console.log("Creating your token account...");
    const createAtaIx = new web3.TransactionInstruction({
      keys: [
        { pubkey: pg.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: ata, isSigner: false, isWritable: true },
        { pubkey: pg.wallet.publicKey, isSigner: false, isWritable: false },
        { pubkey: DBC_MINT, isSigner: false, isWritable: false },
        { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: DBC_TOKEN_PROGRAM, isSigner: false, isWritable: false },
      ],
      programId: DBC_ASSOC_TOKEN_PROGRAM,
      data: Buffer.alloc(0),
    });
    ixs.push(createAtaIx);
  }
  
  // MintTo instruction - write u64 as little-endian bytes
  const amountNum = amount * 1_000_000; // 6 decimals
  const amountBuffer = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    amountBuffer[i] = Number((BigInt(amountNum) >> BigInt(i * 8)) & BigInt(0xff));
  }
  
  const mintToIx = new web3.TransactionInstruction({
    keys: [
      { pubkey: DBC_MINT, isSigner: false, isWritable: true },
      { pubkey: ata, isSigner: false, isWritable: true },
      { pubkey: pg.wallet.publicKey, isSigner: true, isWritable: false },
    ],
    programId: DBC_TOKEN_PROGRAM,
    data: Buffer.concat([Buffer.from([7]), amountBuffer]), // 7 = MintTo
  });
  ixs.push(mintToIx);
  
  const tx = new web3.Transaction().add(...ixs);
  tx.feePayer = pg.wallet.publicKey;
  tx.recentBlockhash = (await pg.connection.getLatestBlockhash()).blockhash;
  const signedTx = await pg.wallet.signTransaction(tx);
  const sig = await pg.connection.sendRawTransaction(signedTx.serialize());
  await pg.connection.confirmTransaction(sig);
  
  console.log("✅ Minted", amount, "DBC to your wallet!");
  console.log("Token Account:", ata.toString());
  console.log("Transaction:", sig);
  
  return { sig, ata };
}

/**
 * Get DBC token balance
 */
async function getBalance(owner?) {
  const target = owner || pg.wallet.publicKey;
  const ata = dbcGetATA(DBC_MINT, target);
  
  try {
    const balance = await pg.connection.getTokenAccountBalance(ata);
    console.log("=== DBC Balance ===");
    console.log("Owner:", target.toString());
    console.log("Token Account:", ata.toString());
    console.log("Balance:", balance.value.uiAmount, "DBC");
    return balance.value.uiAmount;
  } catch (e) {
    console.log("No token account found for:", target.toString());
    return 0;
  }
}

/**
 * Get token config
 */
async function getConfig() {
  const [configPDA] = getTokenConfigPDA(pg.program.programId);
  
  try {
    const data = await pg.program.account.tokenConfig.fetch(configPDA);
    console.log("=== DBC Token Config ===");
    console.log("Mint:", data.mint.toString());
    console.log("Governance:", data.governanceAuthority.toString());
    console.log("Treasury:", data.treasury.toString());
    console.log("Total Minted:", Number(data.totalMinted) / 1_000_000, "DBC");
    console.log("Total Burned:", Number(data.totalBurned) / 1_000_000, "DBC");
    console.log("Max Supply:", Number(data.maxSupply) / 1_000_000, "DBC");
    console.log("Initialized:", data.initialized);
    return data;
  } catch (e) {
    console.log("Token config not initialized");
    return null;
  }
}

// ============================================================================
// MAIN - Uncomment the function you want to run
// ============================================================================

console.log("🚀 DBC Token Program Client");
console.log("Program ID:", pg.program.programId.toString());
console.log("Wallet:", pg.wallet.publicKey.toString());

async function runDbcToken() {
  // STEP 1: Create mint (DONE - mint: 8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT)
  // await createDbcMint();

  // STEP 2: Initialize token (DONE)
  // await initializeToken();

  // STEP 3: Mint some DBC for testing (DONE)
  // await mintDbc(10000); // Mint 10,000 DBC

  // STEP 4: Check balance
  await getBalance();

  // Get config
  await getConfig();
}

runDbcToken().catch(console.error);
