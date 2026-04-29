export type TelemetryEvent =
  | 'wallet_connect'
  | 'wallet_disconnect'
  | 'wallet_error'
  | 'tx_send'
  | 'tx_error'
  | 'privacy_process'
  | 'privacy_error';

export interface TelemetryPayload {
  [key: string]: unknown;
}

function getSessionId(): string {
  if (typeof localStorage === 'undefined') return 'server';
  const key = 'dbc_session_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(key, created);
  return created;
}

export async function track(event: TelemetryEvent, payload: TelemetryPayload = {}): Promise<void> {
  try {
    const evt = {
      event,
      ts: Date.now(),
      sessionId: getSessionId(),
      path: typeof location !== 'undefined' ? location.pathname : undefined,
      ...payload,
    };
    const body = JSON.stringify(evt);

    // Local dev fallback: keep a small rolling buffer so /pilot can still show something
    try {
      if (typeof localStorage !== 'undefined') {
        const key = 'dbc_telemetry_local';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const next = Array.isArray(existing) ? existing : [];
        next.push(evt);
        if (next.length > 500) next.splice(0, 100);
        localStorage.setItem(key, JSON.stringify(next));
      }
    } catch {
      // ignore
    }

    // Prefer sendBeacon (non-blocking, survives navigation)
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const ok = (navigator as any).sendBeacon('/api/events', body);
      if (ok) return;
    }

    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    // Never let telemetry break product flows
  }
}
