import type { VercelRequest, VercelResponse } from '@vercel/node';

type StoredLog = {
  cid: string;
  encryptedBase64: string;
  createdAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __DBC_OPT_LOG_STORE__: Map<string, StoredLog> | undefined;
  // eslint-disable-next-line no-var
  var __DBC_RATE_LIMIT__: Map<string, { windowStart: number; count: number }> | undefined;
}

function getStore(): Map<string, StoredLog> {
  if (!global.__DBC_OPT_LOG_STORE__) global.__DBC_OPT_LOG_STORE__ = new Map();
  return global.__DBC_OPT_LOG_STORE__;
}

function rateLimit(req: VercelRequest, limit: number, windowMs: number): boolean {
  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  if (!global.__DBC_RATE_LIMIT__) global.__DBC_RATE_LIMIT__ = new Map();
  const rl = global.__DBC_RATE_LIMIT__;
  const key = `${ip}:${req.url?.split('?')[0] || ''}`;
  const now = Date.now();

  const state = rl.get(key);
  if (!state || now - state.windowStart > windowMs) {
    rl.set(key, { windowStart: now, count: 1 });
    return true;
  }
  if (state.count >= limit) return false;
  state.count += 1;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic anti-spam: 120 requests / minute / IP for this endpoint.
  if (!rateLimit(req, 120, 60_000)) {
    return res.status(429).json({ error: 'Rate limited' });
  }

  const store = getStore();

  if (req.method === 'GET') {
    const cid = String(req.query.cid || '');
    if (!cid) return res.status(400).json({ error: 'Missing cid' });
    const item = store.get(cid);
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ cid: item.cid, encryptedBase64: item.encryptedBase64 });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const cid = String(body?.cid || '');
    const encryptedBase64 = String(body?.encryptedBase64 || '');
    const wallet = body?.wallet ? String(body.wallet) : '';

    if (!cid || cid.length < 8) return res.status(400).json({ error: 'Invalid cid' });
    if (!encryptedBase64 || encryptedBase64.length < 32) return res.status(400).json({ error: 'Invalid payload' });

    // Per-wallet anti-spam (pilot): 20 writes / hour / wallet
    if (wallet) {
      const ok = rateLimit(
        // reuse the same rateLimiter with a synthetic URL key
        { ...req, url: `/api/optimization-log::wallet::${wallet}` } as any,
        20,
        60 * 60_000
      );
      if (!ok) return res.status(429).json({ error: 'Rate limited (wallet)' });
    }

    store.set(cid, { cid, encryptedBase64, createdAt: Date.now() });
    return res.status(200).json({ ok: true, cid });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
