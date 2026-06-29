/**
 * Browser-side ZK proving service.
 *
 * Generates Noir UltraHonk proofs entirely in the browser via WASM —
 * no nargo/bb/stellar CLI needed. The proof + public inputs are then
 * sent to the Vercel API which submits them to Soroban via @stellar/stellar-sdk.
 *
 * This is the load-bearing ZK loop: private inputs never leave the browser.
 * Only the proof bytes and public inputs (which are public by definition) hit the server.
 */

import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend, Barretenberg } from '@aztec/bb.js';
import type { ProofData } from '@aztec/bb.js';
import circuitJson from '../../circuits/benchmark_delta.json';

export interface BrowserProofResult {
  /** Raw UltraHonk proof bytes */
  proof: Uint8Array;
  /** Public inputs as concatenated 32-byte BN254 field elements (big-endian) */
  publicInputsBytes: Uint8Array;
  /** Public inputs as decimal strings (from bb.js) */
  publicInputs: string[];
  /** Whether the circuit's `passed` output is true */
  passed: boolean;
  /** The threshold value from the circuit output */
  threshold: number;
}

let noirInstance: Noir | null = null;
let backend: UltraHonkBackend | null = null;
let bbApi: Barretenberg | null = null;
let initPromise: Promise<void> | null = null;

/** Lazy-init the Noir + bb.js WASM runtimes (heavy — ~2-5s first time). */
async function ensureInit(): Promise<void> {
  if (backend && noirInstance) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Init Barretenberg WASM singleton
    bbApi = await Barretenberg.new();
    await bbApi.initSRSChonk(0); // tiny circuit, no SRS needed beyond default

    // Create UltraHonk backend with the circuit bytecode
    const bytecode = (circuitJson as any).bytecode;
    backend = new UltraHonkBackend(bytecode, bbApi);

    // Create Noir instance for witness generation
    noirInstance = new Noir(circuitJson as any);
    await noirInstance.init();
  })();

  return initPromise;
}

/** Convert a decimal string field element to a 32-byte big-endian Uint8Array. */
function fieldToBytes(value: string): Uint8Array {
  const bigVal = BigInt(value);
  const bytes = new Uint8Array(32);
  let val = bigVal;
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(val & 0xffn);
    val >>= 8n;
  }
  return bytes;
}

/** Convert an array of decimal-string field elements to concatenated 32-byte bytes. */
function fieldsToBytes(fields: string[]): Uint8Array {
  const result = new Uint8Array(fields.length * 32);
  fields.forEach((f, i) => {
    result.set(fieldToBytes(f), i * 32);
  });
  return result;
}

export interface ProveInputs {
  baselineMetric: number;
  outcomeMetric: number;
  minImprovementPercent: number;
}

/**
 * Generate a ZK proof in the browser.
 *
 * Flow:
 * 1. noir_js executes the circuit → witness
 * 2. bb.js UltraHonkBackend generates the proof from the witness
 * 3. Convert proof + public inputs to the byte format Soroban expects
 *
 * @param inputs Circuit inputs (all private — never leave the browser)
 */
export async function generateProofInBrowser(inputs: ProveInputs): Promise<BrowserProofResult> {
  await ensureInit();
  if (!noirInstance || !backend) {
    throw new Error('ZK runtime not initialized');
  }

  // Step 1: Execute circuit to get witness
  const { witness } = await noirInstance.execute({
    baseline_metric: inputs.baselineMetric,
    outcome_metric: inputs.outcomeMetric,
    min_improvement_percent: inputs.minImprovementPercent,
  });

  // Step 2: Generate UltraHonk proof with keccak oracle hash
  // (matches the CLI's --oracle_hash keccak flag used by the Soroban verifier)
  const proofData: ProofData = await backend.generateProof(witness, {
    keccak: true,
  });

  // Step 3: Convert to byte format
  const publicInputsBytes = fieldsToBytes(proofData.publicInputs);

  // Parse circuit outputs from public inputs:
  // [0..32] → passed (1 = true, 0 = false)
  // [32..64] → threshold (u8 in last byte)
  const passedByte = publicInputsBytes[31];
  const passed = passedByte !== 0;
  const threshold = publicInputsBytes[63];

  return {
    proof: proofData.proof,
    publicInputsBytes,
    publicInputs: proofData.publicInputs,
    passed,
    threshold,
  };
}

/** Pre-warm the WASM runtimes so the first user-triggered proof is fast. */
export async function prewarmProver(): Promise<void> {
  try {
    await ensureInit();
  } catch (e) {
    console.warn('Prover prewarm failed (will retry on demand):', e);
  }
}
