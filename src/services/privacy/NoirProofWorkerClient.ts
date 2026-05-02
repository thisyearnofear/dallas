import type { ProofResult } from './NoirService';

type ValidationProofInput = {
  baselineSeverity: number;
  outcomeSeverity: number;
  durationDays: number;
  costUsd: number;
  hasBaseline: boolean;
  hasOutcome: boolean;
  hasDuration: boolean;
  hasStrategy?: boolean;
  hasProtocol?: boolean;
  hasCost: boolean;
};

type ResponseMsg =
  | { id: string; ok: true; result: any }
  | { id: string; ok: false; error: string };

function uid() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export class NoirProofWorkerClient {
  private worker: Worker | null = null;
  private pending = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void }>();

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    // In SSR/tests Worker may not exist; caller should catch and fall back.
    if (typeof Worker === 'undefined') throw new Error('Worker not available');
    const w = new Worker(new URL('../../workers/noirWorker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (ev: MessageEvent<ResponseMsg>) => {
      const msg = ev.data;
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      if (msg.ok) {
        p.resolve(msg.result);
      } else {
        p.reject(new Error((msg as { ok: false; error: string }).error));
      }
    };
    this.worker = w;
    return w;
  }

  private call<T>(type: string, payload?: any): Promise<T> {
    const w = this.ensureWorker();
    const id = uid();
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      w.postMessage({ id, type, payload });
    });
  }

  async init(): Promise<void> {
    await this.call('init');
  }

  async generateValidationProofs(input: ValidationProofInput): Promise<ProofResult[]> {
    return this.call<ProofResult[]>('generateValidationProofs', input);
  }
}

export const noirProofWorkerClient = new NoirProofWorkerClient();
