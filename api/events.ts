import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Lightweight telemetry endpoint (devnet/testnet pilot).
 * - Stores last N events in-memory for quick pilot debugging.
 * - Safe to keep enabled in hackathon; you can swap to a DB later.
 */
declare global {
  // eslint-disable-next-line no-var
  var __DBC_TELEMETRY__: any[] | undefined;
  // eslint-disable-next-line no-var
  var __DBC_RATE_LIMIT__: Map<string, { windowStart: number; count: number }> | undefined;
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
  if (!rateLimit(req, 300, 60_000)) {
    return res.status(429).json({ error: 'Rate limited' });
  }

  if (req.method === 'GET') {
    const events = global.__DBC_TELEMETRY__ || [];
    return res.status(200).json({ events: events.slice(-200).reverse() });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    // Avoid accidentally logging secrets / payload blobs
    const safe = {
      event: event?.event,
      ts: event?.ts,
      sessionId: event?.sessionId,
      path: event?.path,
      network: event?.network,
      wallet: event?.wallet ? String(event.wallet).slice(0, 16) : undefined,
      error: event?.error ? String(event.error).slice(0, 200) : undefined,
    };
    console.log('[telemetry]', safe);
    if (!global.__DBC_TELEMETRY__) global.__DBC_TELEMETRY__ = [];
    global.__DBC_TELEMETRY__.push(safe);
    if (global.__DBC_TELEMETRY__.length > 1000) global.__DBC_TELEMETRY__.splice(0, 200);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.warn('[telemetry] failed to parse event', e);
    return res.status(200).json({ ok: false });
  }
}
