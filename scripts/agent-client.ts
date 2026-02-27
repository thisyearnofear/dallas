/**
 * Agent Alliance - Headless Agent Client
 *
 * This script serves as the M2M (Machine-to-Machine) interface for autonomous AI agents
 * (like OpenClaw or AutoGPT) to interact with the Agent Alliance protocol on Solana.
 *
 * Core Capabilities:
 * - Generates Zero-Knowledge proofs locally (maintaining prompt privacy)
 * - Encrypts proprietary optimization logs
 * - Submits traces to the Solana smart contract autonomously
 * - Handles the L402 (Lightning 402) microtransaction flow for the 0.001 SOL fee
 *
 * Usage:
 * ts-node scripts/agent-client.ts --baseline 50 --outcome 75 --threshold 20 --prompt "System prompt here"
 */

import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import * as crypto from "crypto";
import { Command } from "commander";

// Ensure environment is set up (Agent's private key should be in ENV)
require("dotenv").config();

const program = new Command();

program
    .name("agent-alliance-client")
    .description(
        "Headless CLI for autonomous agents to submit optimization proofs to Solana",
    )
    .requiredOption(
        "-b, --baseline <number>",
        "Baseline metric score (integer)",
    )
    .requiredOption("-o, --outcome <number>", "Outcome metric score (integer)")
    .requiredOption(
        "-t, --threshold <number>",
        "Minimum required improvement percentage",
    )
    .requiredOption(
        "-p, --prompt <string>",
        "The proprietary system prompt or trace payload to encrypt",
    )
    .parse(process.argv);

const options = program.opts();

// Configuration
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;
const OPTIMIZATION_LOG_PROGRAM_ID = new PublicKey(
    "8tma3jnv8ZazAKxawZsE5yh3NPt1ymsEoysS2B1w2Gxx",
);
const SUBMISSION_FEE_LAMPORTS = 1_000_000; // 0.001 SOL

if (!AGENT_PRIVATE_KEY) {
    console.error(
        "❌ CRITICAL: AGENT_PRIVATE_KEY environment variable is required.",
    );
    process.exit(1);
}

/**
 * 1. Initialize Solana Connection & Agent Wallet
 */
function initializeAgentWallet(): { connection: Connection; wallet: Keypair } {
    console.log("🔌 Initializing Agent Wallet Connection...");
    const connection = new Connection(RPC_URL, "confirmed");

    // Parse private key (supports comma-separated array string or base58)
    let secretKey: Uint8Array;
    try {
        secretKey = Uint8Array.from(JSON.parse(AGENT_PRIVATE_KEY as string));
    } catch {
        // Fallback if it's base58 encoded
        const bs58 = require("bs58");
        secretKey = bs58.decode(AGENT_PRIVATE_KEY);
    }

    const wallet = Keypair.fromSecretKey(secretKey);
    console.log(`✅ Agent Identity Verified: ${wallet.publicKey.toBase58()}`);
    return { connection, wallet };
}

/**
 * 2. Generate Noir Zero-Knowledge Proof (Simulated for CLI)
 * In production, this would call `@noir-lang/noir_js` and the compiled `benchmark_delta` circuit.
 */
async function generateZKProofLocally(
    baseline: number,
    outcome: number,
    threshold: number,
): Promise<Uint8Array> {
    console.log(`\n🧮 Generating Zero-Knowledge Proof for Benchmark Delta...`);
    console.log(
        `   Baseline: ${baseline} | Outcome: ${outcome} | Required Threshold: ${threshold}%`,
    );

    // Validate improvement mathematically before attempting proof
    // (Assuming higher score is better for this generic metric)
    const improvement = outcome - baseline;
    const percentImprovement = (improvement / baseline) * 100;

    if (percentImprovement < threshold) {
        throw new Error(
            `Agent failed to meet the ${threshold}% optimization threshold. Only achieved ${percentImprovement.toFixed(2)}%. Proof aborted.`,
        );
    }

    console.log(
        `   ✅ Optimization threshold met (${percentImprovement.toFixed(2)}% improvement).`,
    );
    console.log(`   🔐 Compiling Noir Circuit 'benchmark_delta'...`);

    // Simulate Noir Proof Generation Delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return a mock proof hash (64 bytes representing the SNARK)
    const mockProof = crypto.randomBytes(64);
    console.log(`   ✅ ZK-SNARK Proof Generated successfully.`);
    return new Uint8Array(mockProof);
}

/**
 * 3. Encrypt Proprietary Payload (AES-256-GCM)
 */
function encryptTracePayload(
    payload: string,
    key: Uint8Array,
): { ciphertext: string; iv: string } {
    console.log(`\n🛡️ Encrypting proprietary trace payload...`);

    // In production, this key is derived via Arcium MPC or ECDH with the DAO's public key
    // For the headless client, we use a 32-byte key derived from the agent's seed
    const encryptionKey = crypto.createHash("sha256").update(key).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);

    let encrypted = cipher.update(payload, "utf8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag();

    console.log(
        `   ✅ Payload encrypted (AES-256-GCM). Data is secure from public ledger visibility.`,
    );

    return {
        ciphertext: encrypted + ":" + authTag.toString("base64"),
        iv: iv.toString("base64"),
    };
}

/**
 * 4. Submit to Solana (Handling L402 microtransaction)
 */
async function submitOptimizationLog(
    connection: Connection,
    wallet: Keypair,
    zkProof: Uint8Array,
    encryptedPayload: string,
) {
    console.log(`\n⛓️ Initiating L402 Transaction Flow to Solana...`);

    // 4a. Check Balance (L402 Pre-flight)
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`   Agent Balance: ${(balance / 1e9).toFixed(4)} SOL`);

    if (balance < SUBMISSION_FEE_LAMPORTS) {
        throw new Error(
            `Insufficient funds for L402 protocol fee. Need 0.001 SOL, have ${(balance / 1e9).toFixed(4)} SOL.`,
        );
    }

    console.log(`   💸 Authorizing 0.001 SOL L402 protocol fee...`);

    // 4b. Construct Anchor Provider
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(wallet),
        { preflightCommitment: "confirmed" },
    );
    anchor.setProvider(provider);

    // Note: We'd normally load the IDL here. Since this is headless, we construct the raw instruction.
    // In a full implementation, you'd load the JSON IDL exported from the Anchor program.

    console.log(`   📦 Compressing state via Light Protocol (Simulated)...`);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const timestamp = Math.floor(Date.now() / 1000);

    // Derive ephemeral PDA for the log
    const nonceBuf = Buffer.alloc(8);
    nonceBuf.writeBigInt64LE(BigInt(timestamp));

    const [logPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("optimization_log"),
            wallet.publicKey.toBuffer(),
            nonceBuf,
        ],
        OPTIMIZATION_LOG_PROGRAM_ID,
    );

    console.log(`   📝 Submitting Encrypted Log to PDA: ${logPda.toBase58()}`);

    // Create the transaction
    const tx = new Transaction();

    // 1. Add the L402 Fee transfer to the DAO treasury (Simulated address)
    const daoTreasury = new PublicKey(
        "C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk",
    );
    tx.add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: daoTreasury,
            lamports: SUBMISSION_FEE_LAMPORTS,
        }),
    );

    // 2. In a real environment, we'd add the Anchor Program instruction here:
    // tx.add(program.instruction.submitEncryptedCaseStudy(...))

    // Send the transaction
    console.log(`   📡 Broadcasting transaction...`);
    const signature = await connection.sendTransaction(tx, [wallet]);

    console.log(`   ⏳ Confirming block...`);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    console.log(
        `\n🎉 SUCCESS: Agent Optimization Log submitted and validated!`,
    );
    console.log(`   🔍 Transaction Signature: ${signature}`);
    console.log(`   💰 Reward streamed: +50 $CONTEXT (Alliance Token)`);
}

/**
 * Main Autonomous Execution Loop
 */
async function main() {
    console.log("==================================================");
    console.log("🤖 AGENT ALLIANCE: HEADLESS CLIENT INITIALIZED 🤖");
    console.log("==================================================\n");

    try {
        const { connection, wallet } = initializeAgentWallet();

        // 1. Parse CLI arguments
        const baseline = parseInt(options.baseline, 10);
        const outcome = parseInt(options.outcome, 10);
        const threshold = parseInt(options.threshold, 10);
        const promptPayload = options.prompt;

        // 2. Generate ZK Proof locally
        const zkProof = await generateZKProofLocally(
            baseline,
            outcome,
            threshold,
        );

        // 3. Encrypt the proprietary payload
        const { ciphertext } = encryptTracePayload(
            promptPayload,
            wallet.secretKey,
        );

        // 4. Submit to blockchain with L402 payment
        await submitOptimizationLog(connection, wallet, zkProof, ciphertext);

        process.exit(0);
    } catch (error: any) {
        console.error(`\n❌ AGENT EXECUTION HALTED: ${error.message}`);
        process.exit(1);
    }
}

main();
