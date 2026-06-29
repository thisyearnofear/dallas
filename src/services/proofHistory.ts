/**
 * Proof history persistence — stores recent ZK proof results in localStorage
 * so returning users see their previous attestations.
 */

export interface ProofRecord {
  txHash: string;
  explorerUrl: string;
  allianceId: string;
  threshold: number;
  passed: boolean;
  metric: string;
  baseline: number;
  outcome: number;
  improvement: number;
  timestamp: number;
  submissionId?: string;
}

const STORAGE_KEY = 'dbc-proof-history';
const MAX_RECORDS = 10;

export function saveProof(record: ProofRecord): void {
  try {
    const history = getProofHistory();
    // Dedupe by txHash
    const filtered = history.filter(r => r.txHash !== record.txHash);
    filtered.unshift(record);
    const trimmed = filtered.slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save proof to localStorage:', e);
  }
}

export function getProofHistory(): ProofRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProofRecord[];
  } catch {
    return [];
  }
}

export function clearProofHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Build a URL for /submit that pre-fills the form with proof data.
 * This bridges the proof demo → submission flow.
 */
export function buildSubmitUrlFromProof(record: ProofRecord): string {
  const params = new URLSearchParams({
    proof_tx: record.txHash,
    proof_alliance: record.allianceId,
    proof_threshold: String(record.threshold),
    proof_metric: record.metric,
    proof_baseline: String(record.baseline),
    proof_outcome: String(record.outcome),
    proof_passed: String(record.passed),
  });
  return `/submit?${params.toString()}`;
}

/**
 * Read proof data from URL params on the /submit page.
 */
export function readProofFromUrl(): Partial<ProofRecord> | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const txHash = params.get('proof_tx');
  if (!txHash) return null;

  return {
    txHash,
    allianceId: params.get('proof_alliance') || '',
    threshold: parseInt(params.get('proof_threshold') || '0', 10),
    metric: params.get('proof_metric') || '',
    baseline: parseInt(params.get('proof_baseline') || '0', 10),
    outcome: parseInt(params.get('proof_outcome') || '0', 10),
    passed: params.get('proof_passed') === 'true',
  };
}
