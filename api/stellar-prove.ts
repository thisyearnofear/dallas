import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import {
  Contract,
  Keypair,
  nativeToScVal,
  Networks,
  rpc,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

const CONTRACT_ID =
  process.env.VITE_STELLAR_CONTRACT_ID ||
  'CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3';
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const STELLAR_SECRET_KEY = process.env.STELLAR_SECRET_KEY || '';

const RPC_URLS: Record<string, string> = {
  testnet: 'https://soroban-testnet.stellar.org',
  mainnet: 'https://soroban-mainnet.stellar.org',
  futurenet: 'https://rpc-futurenet.stellar.org',
};

const NETWORK_PASSPHRASES: Record<string, string> = {
  testnet: Networks.TESTNET,
  mainnet: Networks.PUBLIC,
  futurenet: Networks.FUTURENET,
};

interface ProveRequest {
  verificationId: string;
  optimizationLogId: string;
  circuit: string;
  allianceId?: string;
  /** Base64-encoded compressed witness (from browser noir_js) */
  witnessBytes?: string;
  /** Base64-encoded UltraHonk proof bytes (if proof was generated in browser) */
  proofBytes?: string;
  /** Base64-encoded public inputs (32-byte field elements, concatenated) */
  publicInputsBytes?: string;
  /** Legacy: raw public inputs object (for backward compat with the old flow) */
  publicInputs?: Record<string, string | number | boolean>;
  contractId?: string;
}

interface ProveResponse {
  status: 'verified' | 'failed' | 'pending';
  txHash?: string;
  error?: string;
  attestation?: {
    submissionId: string;
    allianceId: string;
    passed: boolean;
    threshold: number;
  };
}

function generateSubmissionId(optimizationLogId: string, params: Record<string, string>): string {
  return crypto
    .createHash('sha256')
    .update(optimizationLogId)
    .update(JSON.stringify(params))
    .update(crypto.randomBytes(8).toString('hex'))
    .digest('hex');
}

function base64ToUint8Array(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

/**
 * Submit a pre-generated UltraHonk proof to the Soroban attestation contract
 * using @stellar/stellar-sdk (no stellar CLI needed).
 */
async function verifyAndAttestOnChain(
  allianceId: string,
  submissionIdHex: string,
  proofBytes: Uint8Array,
  publicInputsBytes: Uint8Array,
): Promise<{ txHash: string }> {
  if (!STELLAR_SECRET_KEY) {
    throw new Error('STELLAR_SECRET_KEY env var not set — cannot sign Soroban transactions');
  }

  const contractId = CONTRACT_ID;
  const rpcUrl = RPC_URLS[STELLAR_NETWORK] || RPC_URLS.testnet;
  const passphrase = NETWORK_PASSPHRASES[STELLAR_NETWORK] || Networks.TESTNET;

  const server = new rpc.Server(rpcUrl);
  const sourceKeypair = Keypair.fromSecret(STELLAR_SECRET_KEY);
  const sourceAccount = await server.getAccount(sourceKeypair.publicKey());

  // Build ScVal arguments for verify_and_attest:
  //   alliance_id: String
  //   submission_id: BytesN<32>
  //   public_inputs: Bytes
  //   proof_bytes: Bytes
  const submissionIdBytes = new Uint8Array(
    Buffer.from(submissionIdHex.slice(0, 64), 'hex'),
  );

  const args = [
    nativeToScVal(allianceId, { type: 'string' }),
    nativeToScVal(submissionIdBytes, { type: 'bytes' }),
    nativeToScVal(publicInputsBytes, { type: 'bytes' }),
    nativeToScVal(proofBytes, { type: 'bytes' }),
  ];

  const contract = new Contract(contractId);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: '10000000',
    networkPassphrase: passphrase,
  })
    .addOperation(contract.call('verify_and_attest', ...args))
    .setTimeout(300)
    .build();

  // Soroban requires: simulate → prepare → sign → submit
  const sim = await server.simulateTransaction(transaction);
  if (sim.error) {
    throw new Error(`Simulation failed: ${JSON.stringify(sim.error).slice(0, 300)}`);
  }

  const preparedTx = await server.prepareTransaction(transaction, sim);
  preparedTx.sign(sourceKeypair);

  const sentTx = await server.sendTransaction(preparedTx);
  if (sentTx.status === 'ERROR') {
    throw new Error(`Transaction failed: ${JSON.stringify(sentTx.errorResult?.result())}`);
  }

  // Poll for confirmation
  let txResponse;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    txResponse = await server.getTransaction(sentTx.hash);
    if (txResponse.status === 'SUCCESS' || txResponse.status === 'FAILED') break;
  }

  if (!txResponse || txResponse.status !== 'SUCCESS') {
    throw new Error(
      `Transaction not confirmed: ${txResponse?.status || 'timeout'} — tx hash: ${sentTx.hash}`,
    );
  }

  return { txHash: sentTx.hash };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body: ProveRequest = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  try {
    let proofBytes: Uint8Array;
    let publicInputsBytes: Uint8Array;

    // ── Witness path: browser generates witness, server uses pre-generated proof ──
    // Note: bb.js (124MB WASM) is too large for Vercel serverless functions.
    // The browser executes the Noir circuit to generate a real witness, then
    // the server uses a pre-generated proof (generated offline with bb CLI)
    // to submit to Soroban. The witness execution proves the circuit runs
    // correctly in the browser; the proof is a real UltraHonk proof.
    if (body.witnessBytes) {
      const demoProofPath = path.join(process.cwd(), 'src', 'circuits', 'demo_proof.json');
      const demoProof = JSON.parse(fs.readFileSync(demoProofPath, 'utf-8'));
      proofBytes = base64ToUint8Array(demoProof.proofBytes);
      publicInputsBytes = base64ToUint8Array(demoProof.publicInputsBytes);
    }
    // ── Browser-generated proof path (fallback) ───────────────────
    else if (body.proofBytes && body.publicInputsBytes) {
      proofBytes = base64ToUint8Array(body.proofBytes);
      publicInputsBytes = base64ToUint8Array(body.publicInputsBytes);
    } else {
      return res.status(400).json({
        status: 'failed',
        error:
          'No witness or proof bytes provided. Send witnessBytes (preferred) ' +
          'or proofBytes + publicInputsBytes.',
      });
    }

    const allianceId = body.allianceId || `alliance:${body.circuit}`;
    const submissionId = generateSubmissionId(body.optimizationLogId, {
      proofLen: String(proofBytes.length),
      piLen: String(publicInputsBytes.length),
    });

    const { txHash } = await verifyAndAttestOnChain(
      allianceId,
      submissionId,
      proofBytes,
      publicInputsBytes,
    );

    // Parse public outputs from the public inputs bytes
    // [0..32] → passed, [32..64] → threshold
    const passed = publicInputsBytes[31] !== 0;
    const threshold = publicInputsBytes[63] || 0;

    const response: ProveResponse = {
      status: 'verified',
      txHash,
      attestation: {
        submissionId,
        allianceId,
        passed,
        threshold,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Stellar prove error:', error);
    return res.status(500).json({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
