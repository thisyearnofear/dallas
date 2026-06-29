/**
 * Browser-side ZK proof generation service.
 *
 * The browser executes the Noir circuit via WASM (noir_js) to produce a witness,
 * then generates a real UltraHonk proof using bb.js (Barretenberg WASM).
 * The proof + public inputs are sent to the Vercel API which submits them
 * to the Soroban attestation contract.
 *
 * This is the honest flow:
 *   1. Browser executes Noir circuit with private inputs → compressed witness
 *   2. Browser generates UltraHonk proof from witness via bb.js WASM
 *   3. Browser sends proof + public inputs to server
 *   4. Server submits to Soroban verify_and_attest (on-chain verification)
 *
 * Private inputs never leave the browser. The proof is generated from the
 * actual witness — no cached/pre-generated proofs.
 */

import { Noir } from '@noir-lang/noir_js';
import initNoirC from '@noir-lang/noirc_abi';
import initACVM from '@noir-lang/acvm_js';
// Vite resolves these ?url imports to the hashed WASM asset paths
import acvmWasmUrl from '@noir-lang/acvm_js/web/acvm_js_bg.wasm?url';
import noircWasmUrl from '@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url';
import circuitJson from '../../circuits/benchmark_delta.json';

// bb.js browser build — generates UltraHonk proofs in the browser
import { Barretenberg, UltraHonkBackend } from '@aztec/bb.js';

export interface BrowserProofResult {
  /** Base64-encoded UltraHonk proof bytes (for Soroban submission) */
  proofBytes: string;
  /** Base64-encoded public inputs (32-byte field elements, concatenated) */
  publicInputsBytes: string;
  /** Whether the circuit's `passed` output is true */
  passed: boolean;
  /** The threshold value from the circuit output */
  threshold: number;
}

let noirInstance: Noir | null = null;
let bbInstance: Barretenberg | null = null;
let honkBackend: UltraHonkBackend | null = null;
let initPromise: Promise<void> | null = null;

/** Lazy-init the Noir WASM runtime + Barretenberg proof backend. */
async function ensureInit(): Promise<void> {
  if (noirInstance && honkBackend) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 1. Initialize ACVM + noirc_abi WASM (for witness generation)
    await Promise.all([
      initACVM(fetch(acvmWasmUrl)),
      initNoirC(fetch(noircWasmUrl)),
    ]);

    noirInstance = new Noir(circuitJson as any);
    await noirInstance.init();

    // 2. Initialize Barretenberg (for UltraHonk proof generation)
    //    This loads the ~3.5MB bb.js WASM in the browser.
    bbInstance = await Barretenberg.new();

    // 3. Create UltraHonkBackend with the circuit's ACIR bytecode
    const bytecode = (circuitJson as any).bytecode;
    honkBackend = new UltraHonkBackend(bytecode, bbInstance);
  })();

  return initPromise;
}

/** Convert Uint8Array to base64 string for transport. */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface ProveInputs {
  baselineMetric: number;
  outcomeMetric: number;
  minImprovementPercent: number;
}

/**
 * Execute the Noir circuit and generate a real UltraHonk proof in the browser.
 *
 * Flow:
 * 1. noir_js executes the circuit with private inputs → compressed witness
 * 2. bb.js generates an UltraHonk proof from the witness
 * 3. Proof + public inputs are base64-encoded for transport to the server
 * 4. Server submits to Soroban verify_and_attest for on-chain verification
 *
 * @param inputs Circuit inputs (private — never leave the browser)
 */
export async function generateProofInBrowser(inputs: ProveInputs): Promise<BrowserProofResult> {
  await ensureInit();
  if (!noirInstance || !honkBackend) {
    throw new Error('ZK runtime not initialized');
  }

  // ── Step 1: Execute circuit to get witness + return value ──
  let witness: Uint8Array;
  let returnValue: any;
  try {
    const result = await noirInstance.execute({
      baseline_metric: inputs.baselineMetric,
      outcome_metric: inputs.outcomeMetric,
      min_improvement_percent: inputs.minImprovementPercent,
    });
    witness = result.witness;
    returnValue = result.returnValue;
  } catch (e) {
    throw new Error(`Witness generation failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  // The circuit returns (bool, u8) = (passed, threshold)
  const passed = Array.isArray(returnValue) ? returnValue[0] === true : Boolean(returnValue);
  const threshold = Array.isArray(returnValue) ? Number(returnValue[1]) : 0;

  // ── Step 2: Generate UltraHonk proof from witness ──
  let proofData: { proof: Uint8Array; publicInputs: string[] };
  try {
    proofData = await honkBackend.generateProof(witness, {
      keccak: true, // Match the on-chain verifier (Keccak hash for Soroban)
    });
  } catch (e) {
    throw new Error(`Proof generation failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── Step 3: Convert public inputs from field strings to byte array ──
  // Each public input is a 32-byte BN254 field element (hex string)
  const publicInputsBytes = new Uint8Array(proofData.publicInputs.length * 32);
  for (let i = 0; i < proofData.publicInputs.length; i++) {
    const fieldHex = proofData.publicInputs[i].replace(/^0x/, '');
    const fieldBytes = new Uint8Array(32);
    // Pad to 32 bytes (field elements are big-endian)
    const hexPadded = fieldHex.padStart(64, '0');
    for (let j = 0; j < 32; j++) {
      fieldBytes[j] = parseInt(hexPadded.substr(j * 2, 2), 16);
    }
    publicInputsBytes.set(fieldBytes, i * 32);
  }

  return {
    proofBytes: uint8ArrayToBase64(proofData.proof),
    publicInputsBytes: uint8ArrayToBase64(publicInputsBytes),
    passed,
    threshold,
  };
}

/** Pre-warm the WASM runtime so the first user-triggered proof is fast. */
export async function prewarmProver(): Promise<void> {
  try {
    await ensureInit();
  } catch (e) {
    console.warn('Prover prewarm failed (will retry on demand):', e);
  }
}
