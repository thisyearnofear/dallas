/**
 * Optimization Log Storage Service
 *
 * For devnet/testnet pilots we need encrypted payload persistence so that:
 *  - logs are discoverable on-chain (account points to a CID)
 *  - details are retrievable off-chain (encrypted blob)
 *
 * This service supports a simple internal scheme:
 *  - cid: "dbc_<hash>"
 *  - payload stored via /api/optimization-log
 */
export class OptimizationLogStorageService {
  async putEncrypted(cid: string, encryptedBase64: string): Promise<void> {
    try {
      const res = await fetch('/api/optimization-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid, encryptedBase64 }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return;
    } catch (e) {
      // Local dev fallback (vite dev won't serve Vercel functions)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`dbc_optlog_${cid}`, encryptedBase64);
        return;
      }
      throw e;
    }
  }

  async getEncrypted(cid: string): Promise<string> {
    try {
      const res = await fetch(`/api/optimization-log?cid=${encodeURIComponent(cid)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const encrypted = String(json.encryptedBase64 || '');
      if (!encrypted) throw new Error('Empty payload');
      return encrypted;
    } catch (e) {
      if (typeof localStorage !== 'undefined') {
        const fallback = localStorage.getItem(`dbc_optlog_${cid}`);
        if (fallback) return fallback;
      }
      throw e;
    }
  }
}

export const optimizationLogStorageService = new OptimizationLogStorageService();
