import type { VercelRequest, VercelResponse } from '@vercel/node';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

const STELLAR_ASSETS_DIR = join(process.cwd(), 'api', 'stellar');

const CONTRACT_ID = process.env.VITE_STELLAR_CONTRACT_ID || 'CCBJKYVIQ6NJKHH2AW254RE2RPDJM7GXTOWA6MTTQWWNBNNZFIS6VU5Z';
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const SOURCE_ACCOUNT = process.env.STELLAR_SOURCE_ACCOUNT || 'alice';

interface ProveRequest {
  verificationId: string;
  optimizationLogId: string;
  circuit: string;
  publicInputs: Record<string, string | number | boolean>;
  contractId?: string;
}

interface ProveResponse {
  status: 'verified' | 'failed' | 'pending';
  txHash?: string;
  error?: string;
}

async function submitViaStellarCli(
  contractId: string,
  publicInputsBytes: Buffer,
  proofBytes: Buffer,
): Promise<{ txHash: string }> {
  const tmpDir = join('/tmp', `stellar-prove-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  const piPath = join(tmpDir, 'public_inputs.bin');
  const proofPath = join(tmpDir, 'proof.bin');
  writeFileSync(piPath, publicInputsBytes);
  writeFileSync(proofPath, proofBytes);

  const cmd = [
    'stellar',
    'contract', 'invoke',
    '--id', contractId,
    '--source', SOURCE_ACCOUNT,
    '--network', STELLAR_NETWORK,
    '--send=yes',
    '--',
    'verify_proof',
    '--public_inputs-file-path', piPath,
    '--proof_bytes-file-path', proofPath,
  ].join(' ');

  const output = execSync(cmd, { encoding: 'utf-8', timeout: 120_000 });

  const txMatch = output.match(/(https:\/\/stellar\.expert\/explorer\/testnet\/tx\/[a-f0-9]+)/);
  const txHash = txMatch
    ? txMatch[1].split('/').pop()!
    : undefined;

  if (!txHash) {
    // Try to find a hex tx hash directly
    const hexMatch = output.match(/[a-f0-9]{64}/);
    if (hexMatch) {
      return { txHash: hexMatch[0] };
    }
    throw new Error(`No transaction hash found in output: ${output.slice(0, 500)}`);
  }

  return { txHash };
}

async function submitViaRpc(
  contractId: string,
  publicInputsBytes: Buffer,
  proofBytes: Buffer,
): Promise<{ txHash: string }> {
  throw new Error('RPC submission not yet implemented — use local CLI mode');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body: ProveRequest = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const contractId = body.contractId || CONTRACT_ID;

  try {
    const useRpc = !!process.env.STELLAR_SECRET_KEY;

    const result = useRpc
      ? await submitViaRpc(contractId, Buffer.from([0x01]), readFileSync(join(STELLAR_ASSETS_DIR, 'proof.bin')))
      : await submitViaStellarCli(
          contractId,
          readFileSync(join(STELLAR_ASSETS_DIR, 'public_inputs.bin')),
          readFileSync(join(STELLAR_ASSETS_DIR, 'proof.bin')),
        );

    const response: ProveResponse = {
      status: 'verified',
      txHash: result.txHash,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Stellar prove error:', error);
    const response: ProveResponse = {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return res.status(500).json(response);
  }
}
