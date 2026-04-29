import { useEffect, useState } from 'preact/hooks';

type TelemetryEvent = {
  event?: string;
  ts?: number;
  sessionId?: string;
  path?: string;
  network?: string;
  wallet?: string;
  error?: string;
};

export default function PilotDashboard() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setEvents(Array.isArray(json.events) ? json.events : []);
    } catch (e) {
      // Local dev fallback: read from localStorage
      try {
        const local = JSON.parse(localStorage.getItem('dbc_telemetry_local') || '[]');
        if (Array.isArray(local)) {
          setEvents(local.slice(-200).reverse());
          setError(null);
          return;
        }
      } catch {}
      setError(e instanceof Error ? e.message : String(e));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div class="max-w-6xl mx-auto">
      <div class="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white">Pilot Telemetry</h1>
          <p class="text-slate-600 dark:text-slate-300">
            Live view of recent events (for devnet/testnet pilots). Refreshes every 5s.
          </p>
        </div>
        <button
          onClick={load}
          class="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800"
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div class="mb-4 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 font-bold">
          Failed to load telemetry: {error}
        </div>
      )}

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th class="text-left p-3 font-black">Time</th>
                <th class="text-left p-3 font-black">Event</th>
                <th class="text-left p-3 font-black">Path</th>
                <th class="text-left p-3 font-black">Network</th>
                <th class="text-left p-3 font-black">Session</th>
                <th class="text-left p-3 font-black">Wallet</th>
                <th class="text-left p-3 font-black">Error</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, idx) => (
                <tr key={idx} class="border-t border-slate-100 dark:border-slate-800">
                  <td class="p-3 whitespace-nowrap">
                    {e.ts ? new Date(e.ts).toLocaleTimeString() : '-'}
                  </td>
                  <td class="p-3 font-mono">{e.event || '-'}</td>
                  <td class="p-3 font-mono">{e.path || '-'}</td>
                  <td class="p-3">{e.network || '-'}</td>
                  <td class="p-3 font-mono">{e.sessionId || '-'}</td>
                  <td class="p-3 font-mono">{e.wallet || '-'}</td>
                  <td class="p-3 text-red-700 dark:text-red-300">{e.error || ''}</td>
                </tr>
              ))}
              {events.length === 0 && !loading && (
                <tr>
                  <td class="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={7}>
                    No events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
