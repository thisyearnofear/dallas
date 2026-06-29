/**
 * Browser-side ZK witness generation service.
 *
 * The browser executes the Noir circuit via WASM (noir_js) to produce a witness.
 * The witness is then sent to the Vercel API which generates the UltraHonk proof
 * using bb.js (Node.js) and submits it to Soroban.
 *
 * This split architecture keeps the heavy proof generation on the server while
 * the circuit execution (which processes private inputs) happens in the browser.
 * The private inputs never need to leave the client for proof generation —
 * only the compressed witness is transmitted.
 */

import { Noir } from '@noir-lang/noir_js';
import initNoirC from '@noir-lang/noirc_abi';
import initACVM from '@noir-lang/acvm_js';
// Vite resolves these ?url imports to the hashed WASM asset paths
import acvmWasmUrl from '@noir-lang/acvm_js/web/acvm_js_bg.wasm?url';
import noircWasmUrl from '@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url';
import circuitJson from '../../circuits/benchmark_delta.json';

export interface BrowserProofResult {
  /** Base64-encoded compressed witness bytes (to send to server) */
  witnessBytes: string;
  /** Whether the circuit's `passed` output is true (from witness execution) */
  passed: boolean;
  /** The threshold value from the circuit output */
  threshold: number;
}

let noirInstance: Noir | null = null;
let initPromise: Promise<void> | null = null;

/** Lazy-init the Noir WASM runtime (witness generation only — ~1-2s first time). */
async function ensureInit(): Promise<void> {
  if (noirInstance) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Explicitly init the ACVM and noirc_abi WASM modules with their
    // bundled URLs. This is required in a Vite/browser context.
    await Promise.all([
      initACVM(fetch(acvmWasmUrl)),
      initNoirC(fetch(noircWasmUrl)),
    ]);

    // Create Noir instance for witness generation
    noirInstance = new Noir(circuitJson as any);
    await noirInstance.init();
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
 * Execute the Noir circuit in the browser to generate a witness.
 *
 * Flow:
 * 1. noir_js executes the circuit with private inputs → compressed witness
 * 2. Witness is base64-encoded for transport to the server
 * 3. Server generates the UltraHonk proof and submits to Soroban
 *
 * @param inputs Circuit inputs (private — only the witness leaves the browser)
 */
export async function generateProofInBrowser(inputs: ProveInputs): Promise<BrowserProofResult> {
  await ensureInit();
  if (!noirInstance) {
    throw new Error('ZK runtime not initialized');
  }

  // Execute circuit to get witness + return value
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

  return {
    witnessBytes: uint8ArrayToBase64(witness),
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
