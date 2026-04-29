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
    const body = JSON.stringify({
      event,
      ts: Date.now(),
      sessionId: getSessionId(),
      path: typeof location !== 'undefined' ? location.pathname : undefined,
      ...payload,
    });

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

