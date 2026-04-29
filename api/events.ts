import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Lightweight telemetry endpoint (devnet/testnet pilot).
 * - Stores nothing server-side; logs to server console for now.
 * - Safe to keep enabled in hackathon; you can swap to a DB later.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.warn('[telemetry] failed to parse event', e);
    return res.status(200).json({ ok: false });
  }
}

