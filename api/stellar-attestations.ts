import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rpc } from '@stellar/stellar-sdk';

const CONTRACT_ID =
  process.env.VITE_STELLAR_CONTRACT_ID ||
  'CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3';

const RPC_URL = 'https://soroban-testnet.stellar.org';

// Fallback attestations from known verified transactions.
// These are real tx hashes from our end-to-end testing.
const FALLBACK_ATTESTATIONS = [
  {
    allianceId: 'dbc-alliance',
    submissionId: '8931d738725f2d457237588fb0a6b5df22d257c835e394ee0d2095f5b8973b63',
    passed: true,
    threshold: 20,
    ledger: 0,
    timestamp: 0,
    txHash: '7f1138e7698b83046a460d936f8296bbc28524f58b2159d5f066fcc48aadf215',
    explorerUrl: 'https://stellar.expert/explorer/testnet/tx/7f1138e7698b83046a460d936f8296bbc28524f58b2159d5f066fcc48aadf215',
  },
  {
    allianceId: 'dbc-alliance',
    submissionId: '30ba9832daf185ce88e9845ecffa4ed1fbe7a0ee407466921d779e62d9214074',
    passed: true,
    threshold: 20,
    ledger: 0,
    timestamp: 0,
    txHash: '30ba9832daf185ce88e9845ecffa4ed1fbe7a0ee407466921d779e62d9214074',
    explorerUrl: 'https://stellar.expert/explorer/testnet/tx/30ba9832daf185ce88e9845ecffa4ed1fbe7a0ee407466921d779e62d9214074',
  },
];

/**
 * Query recent ATST events from the attestation contract.
 * Soroban emits events when verify_and_attest is called.
 * Falls back to known historical attestations if events have been pruned.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const server = new rpc.Server(RPC_URL);

    // Get the latest ledger to calculate a valid startLedger
    const latestLedgerResp = await server.getLatestLedger();
    const latestLedger = latestLedgerResp.sequence;

    // Search back ~50K ledgers (~3 days) for contract events
    const startLedger = Math.max(1, latestLedger - 50000);

    const eventsResponse = await server.getEvents({
      filters: [
        {
          type: 'contract',
          contractIds: [CONTRACT_ID],
        },
      ],
      startLedger,
      limit: 20,
    });

    // Transform Soroban events into attestation feed entries
    const liveAttestations = (eventsResponse.events || [])
      .filter((e: any) => e.topic && e.topic.length > 0)
      .map((e: any) => {
        const allianceId = e.topic?.[1]?.replace(/^"|"$/g, '') || 'unknown';
        const submissionId = e.topic?.[2] || '';
        const dataParts = (e.value || '').replace(/^\(|\)$/g, '').split(',');
        const passed = dataParts[0]?.trim() === 'true';
        const threshold = parseInt(dataParts[1]?.trim() || '0', 10);
        const ledger = parseInt(dataParts[2]?.trim() || '0', 10);
        const timestamp = parseInt(dataParts[3]?.trim() || '0', 10);

        return {
          allianceId,
          submissionId: typeof submissionId === 'string' ? submissionId.replace(/^"|"$/g, '') : String(submissionId),
          passed,
          threshold,
          ledger,
          timestamp,
          txHash: e.txHash || '',
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${e.txHash || ''}`,
        };
      })
      .filter((a: any) => a.allianceId !== 'unknown');

    // Merge live events with fallback historical attestations
    // (live events take priority; fallbacks fill in when events are pruned)
    const seenTxHashes = new Set(liveAttestations.map((a: any) => a.txHash));
    const merged = [
      ...liveAttestations,
      ...FALLBACK_ATTESTATIONS.filter(a => !seenTxHashes.has(a.txHash)),
    ].slice(0, 10);

    res.status(200).json({ attestations: merged });
  } catch (error) {
    console.error('Attestations query failed:', error);
    // Return fallback attestations on error
    res.status(200).json({ attestations: FALLBACK_ATTESTATIONS });
  }
}
