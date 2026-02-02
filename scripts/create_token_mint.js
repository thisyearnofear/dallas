import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Configure the connection to devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function createExperienceTokenMint() {
  console.log("🚀 Creating EXPERIENCE Token Mint on Solana Devnet...");
  
  // Get the current wallet (using the same wallet as the Solana CLI config)
  // First, let's get the current wallet address from Solana config
  let walletKeypair;
  let walletPublicKey;
  try {
    // Dynamically import child_process and fs
    const { execSync } = await import('child_process');
    const { promises: fs } = await import('fs');
    
    // Get the keypair file path
    const configOutput = execSync('solana config get', { encoding: 'utf8' });
    const keypairLine = configOutput.split('\n').find(line => line.includes('Keypair Path:'));
    const keypairPath = keypairLine.split(':')[1].trim();
    
    // Read the keypair from the file
    const secretKeyData = await fs.readFile(keypairPath, 'utf8');
    const secretKey = Uint8Array.from(JSON.parse(secretKeyData));
    walletKeypair = Keypair.fromSecretKey(secretKey);
    walletPublicKey = walletKeypair.publicKey;
    console.log(`🔑 Using current wallet: ${walletPublicKey.toBase58()}`);
  } catch (error) {
    console.error("❌ Could not get wallet from Solana CLI config. Please ensure you have a wallet set up.");
    throw error;
  }
  
  // Generate a new keypair for the mint authority
  const mintAuthority = Keypair.generate();
  console.log(`🔑 Generated new mint authority: ${mintAuthority.publicKey.toBase58()}`);
  
  // Airdrop some SOL to the mint authority for transaction fees
  console.log("💸 Requesting airdrop for transaction fees...");
  try {
    const airdropSignature = await connection.requestAirdrop(
      mintAuthority.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    console.log("✅ Airdrop confirmed");
  } catch (error) {
    console.warn("⚠️ Airdrop failed (this is common on devnet). Please ensure your wallet has sufficient SOL for transactions.");
    // We'll continue anyway, assuming the user has some SOL in their wallet
  }
  
  // Create the mint
  console.log("💰 Creating token mint with 6 decimals...");
  const mint = await createMint(
    connection,
    mintAuthority, // mint authority
    mintAuthority.publicKey, // freeze authority
    6, // decimals
    undefined, // programId (uses default)
    walletKeypair // payer (use the connected wallet)
  );
  
  console.log("✅ EXPERIENCE Token Mint created successfully!");
  console.log(`📋 Mint Address: ${mint.toBase58()}`);
  
  // Create associated token accounts for treasury and wallet
  const treasuryPublicKey = new PublicKey("BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK");
  
  console.log("🏦 Creating associated token account for treasury...");
  const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    walletKeypair, // payer (use the connected wallet)
    mint, // mint
    treasuryPublicKey, // owner
    false, // allow owner off curve
    "confirmed", // commitment
    TOKEN_PROGRAM_ID // programId
  );
  console.log(`✅ Treasury token account: ${treasuryTokenAccount.address.toBase58()}`);
  
  console.log("🏦 Creating associated token account for wallet...");
  const walletTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    walletKeypair, // payer (use the connected wallet)
    mint, // mint
    walletPublicKey, // owner (the user's wallet)
    false, // allow owner off curve
    "confirmed", // commitment
    TOKEN_PROGRAM_ID // programId
  );
  console.log(`✅ Wallet token account: ${walletTokenAccount.address.toBase58()}`);
  
  // Optionally mint some tokens to treasury and wallet
  console.log("🪙 Minting initial tokens to treasury and wallet...");
  await mintTo(
    connection,
    walletKeypair, // payer (use the connected wallet)
    mint, // mint
    treasuryTokenAccount.address, // destination
    mintAuthority, // mint authority
    1000000000000, // amount (with 6 decimals, this is 1,000,000,000 tokens)
    [], // multisig authorities
    undefined, // confirm options
    TOKEN_PROGRAM_ID // programId
  );
  
  await mintTo(
    connection,
    walletKeypair, // payer (use the connected wallet)
    mint, // mint
    walletTokenAccount.address, // destination
    mintAuthority, // mint authority
    100000000000, // amount (with 6 decimals, this is 100,000,000 tokens)
    [], // multisig authorities
    undefined, // confirm options
    TOKEN_PROGRAM_ID // programId
  );
  
  console.log("✅ Initial tokens minted to treasury and wallet");
  
  // Return both the mint and mint authority
  return { mint, mintAuthority };
}

// Update the configuration file with the new mint address
async function updateConfigFile(mintAddress) {
  const { promises: fs } = await import('fs');
  const path = await import('path');
  
  const configPath = path.join(process.cwd(), 'src/config/solana.ts');
  let configContent = await fs.readFile(configPath, 'utf8');
  
  // Create a backup
  await fs.writeFile(`${configPath}.backup`, configContent);
  
  // Replace the placeholder with the actual mint address
  const updatedConfig = configContent.replace(
    /experienceMintAddress:\s*'EXPERIENCE_MINT_ADDRESS_NEEDED'/,
    `experienceMintAddress: '${mintAddress}'`
  );
  
  await fs.writeFile(configPath, updatedConfig);
  console.log(`✅ Configuration updated with mint address: ${mintAddress}`);
}

async function main() {
  try {
    console.log("🚀 Dallas Buyers Club - EXPERIENCE Token Mint Creation");
    console.log("=====================================================");
    
    // Create the token mint
    const result = await createExperienceTokenMint();
    const mintAddress = result.mint.toBase58();
    const mintAuthority = result.mintAuthority;
    
    // Update the configuration file
    await updateConfigFile(mintAddress);
    
    console.log("\n🎉 Token mint creation complete!");
    console.log("📋 Next steps:");
    console.log("   1. Save the mint authority private key securely (it controls the mint)");
    console.log("   2. The mint address has been updated in src/config/solana.ts");
    console.log("   3. You can now use the Experience Token Program with this mint");
    console.log(`   4. Mint Address: ${mintAddress}`);
    
    // Output the private key for the mint authority (IMPORTANT: save this securely!)
    console.log(`\n🔐 Mint Authority Private Key (SAVE THIS SECURELY):`);
    console.log(JSON.stringify(Array.from(mintAuthority.secretKey)));
  } catch (error) {
    console.error("❌ Error creating token mint:", error);
  }
}

// Run the main function
main();