import { getAleoReadiness } from '../config/chains';
import { getBlockchainConfigErrors, getRpcEndpoint, SOLANA_CONFIG } from '../config/solana';
import { arciumMPCService, lightProtocolService } from '../services/privacy';

type ReadinessStatus = 'ready' | 'partial' | 'simulated' | 'blocked';

interface ReadinessItem {
  name: string;
  status: ReadinessStatus;
  detail: string;
  action: string;
}

const STATUS_STYLES: Record<ReadinessStatus, string> = {
  ready: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  partial: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  simulated: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  blocked: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
};

const STATUS_LABELS: Record<ReadinessStatus, string> = {
  ready: 'Ready',
  partial: 'Configured',
  simulated: 'Fallback',
  blocked: 'Blocked',
};

function getRuntimeEnv() {
  return (import.meta as any)?.env ?? {};
}

function getReadinessItems(): ReadinessItem[] {
  const runtimeEnv = getRuntimeEnv();
  const blockchainErrors = getBlockchainConfigErrors();
  const aleoReadiness = getAleoReadiness();
  const realZkEnabled = runtimeEnv.VITE_ENABLE_REAL_ZK === 'true';
  const heliusConfigured = Boolean(runtimeEnv.VITE_HELIUS_API_KEY || runtimeEnv.VITE_HELIUS_RPC_URL);

  return [
    {
      name: 'Solana coordination',
      status: blockchainErrors.length === 0 ? 'ready' : 'blocked',
      detail: `${SOLANA_CONFIG.network} · ${getRpcEndpoint()}`,
      action: blockchainErrors.length === 0 ? 'Program IDs resolved' : blockchainErrors.join(' '),
    },
    {
      name: 'Bags launch proxy',
      status: SOLANA_CONFIG.bagsApi.url ? 'partial' : 'blocked',
      detail: SOLANA_CONFIG.bagsApi.url || 'No proxy route configured',
      action: 'Server route keeps Bags keys out of the browser',
    },
    {
      name: 'Helius indexing',
      status: heliusConfigured ? 'ready' : 'simulated',
      detail: heliusConfigured ? 'Enhanced RPC/indexing configured' : 'Default public RPC fallback',
      action: heliusConfigured ? 'Ready for higher-volume indexing' : 'Set server-side Helius config before production traffic',
    },
    {
      name: 'Noir proving',
      status: realZkEnabled ? 'ready' : 'simulated',
      detail: realZkEnabled ? 'Real local proofs enabled' : 'Deterministic simulated proof mode',
      action: realZkEnabled ? 'Heavy proving runtime loads on demand' : 'Set VITE_ENABLE_REAL_ZK=true for prover pilots',
    },
    {
      name: 'Aleo verification',
      status: aleoReadiness.readyForSubmission ? 'ready' : aleoReadiness.enabled ? 'partial' : 'simulated',
      detail: aleoReadiness.reason,
      action:
        aleoReadiness.missing.length > 0
          ? `Missing: ${aleoReadiness.missing.join(', ')}`
          : aleoReadiness.warnings[0] || 'Optional dual-chain verification layer',
    },
    {
      name: 'Light compression',
      status: lightProtocolService.isAvailable() ? 'ready' : 'simulated',
      detail: lightProtocolService.isAvailable() ? 'Live compression path available' : 'Compression simulator active',
      action: 'Fallback preserves UX while infra matures',
    },
    {
      name: 'Arcium MPC',
      status: arciumMPCService.isAvailable() ? 'ready' : 'simulated',
      detail: arciumMPCService.isAvailable() ? 'MPC network path available' : 'Local committee fallback active',
      action: 'Threshold access flow remains testable',
    },
  ];
}

export function ServiceReadinessPanel() {
  const items = getReadinessItems();
  const launchCritical = items.filter((item) =>
    ['Solana coordination', 'Bags launch proxy', 'Noir proving'].includes(item.name)
  );
  const criticalReady = launchCritical.filter((item) => item.status === 'ready' || item.status === 'partial').length;

  return (
    <section class="mb-12 bg-slate-950 text-white rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      <div class="p-6 md:p-8 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-brand/30">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-brand/80 font-bold mb-2">Production Readiness</p>
            <h2 class="text-2xl md:text-3xl font-black">Launch-critical services, no guessing.</h2>
            <p class="text-slate-300 mt-2 max-w-3xl">
              Runtime dependencies are visible before builders submit private logs, launch alliance tokens, or validate proofs.
            </p>
          </div>
          <div class="shrink-0 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-center">
            <div class="text-3xl font-black">{criticalReady}/{launchCritical.length}</div>
            <div class="text-xs text-slate-300 uppercase tracking-wide">Core paths ready</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-slate-800">
        {items.map((item) => (
          <div key={item.name} class="bg-slate-950 p-5">
            <div class="flex items-start justify-between gap-3 mb-3">
              <h3 class="font-bold text-lg">{item.name}</h3>
              <span class={`text-[11px] font-black uppercase tracking-wide px-2 py-1 rounded border ${STATUS_STYLES[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </span>
            </div>
            <p class="text-sm text-slate-300 mb-3">{item.detail}</p>
            <p class="text-xs text-slate-500 leading-relaxed">{item.action}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
