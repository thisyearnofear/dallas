import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getNetworkStatus } from '../services/BlockchainIntegration';

interface NetworkStatusData {
    blockHeight: number;
    agent: 'ok' | 'behind' | 'unknown';
    tps: number;
}

interface NetworkStatusProps {
    compact?: boolean;
}

export const NetworkStatus: FunctionalComponent<NetworkStatusProps> = ({ compact = false }) => {
    const [status, setStatus] = useState<NetworkStatusData>({
        blockHeight: 0,
        agent: 'unknown',
        tps: 0,
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        loadNetworkStatus();

        // Update every 30 seconds
        const interval = setInterval(loadNetworkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNetworkStatus = async () => {
        try {
            const networkStatus = await getNetworkStatus();
            setStatus(networkStatus);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to load network status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAgentColor = (agent: string = 'unknown') => {
        switch (agent) {
            case 'ok':
                return 'text-green-600 dark:text-green-400';
            case 'behind':
                return 'text-yellow-600 dark:text-yellow-400';
            default:
                return 'text-red-600 dark:text-red-400';
        }
    };

    const getAgentIcon = (agent: string = 'unknown') => {
        switch (agent) {
            case 'ok':
                return '✅';
            case 'behind':
                return '⚠️';
            default:
                return '❌';
        }
    };

    return (
        <div class={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm ${compact ? 'p-3' : 'p-4'}`}>
            <div class={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
                <h3 class={`font-bold text-slate-900 dark:text-white ${compact ? 'text-base' : 'text-lg'}`}>🌐 Network Status</h3>
                <button
                    onClick={loadNetworkStatus}
                    disabled={loading}
                    class="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-2 py-1 rounded transition shadow-sm"
                >
                    {loading ? '⏳' : '🔄'}
                </button>
            </div>

            <div class={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
                {/* Network Agent */}
                <div class="text-center">
                    <div class={`${compact ? 'text-lg' : 'text-2xl'} mb-1`}>
                        {getAgentIcon(status.agent)}
                    </div>
                    <div class={`font-bold ${getAgentColor(status.agent)} ${compact ? 'text-xs' : 'text-sm'}`}>
                        {status?.agent?.toUpperCase() || 'UNKNOWN'}
                    </div>
                    {!compact && <div class="text-xs text-slate-500 dark:text-slate-400">Agent</div>}
                </div>

                {/* Block Height */}
                <div class="text-center">
                    <div class={`font-bold text-blue-600 dark:text-blue-400 ${compact ? 'text-sm' : 'text-lg'}`}>
                        {compact 
                            ? (status.blockHeight > 999999 ? (status.blockHeight / 1000000).toFixed(1) + 'M' : status.blockHeight.toLocaleString())
                            : status.blockHeight.toLocaleString()
                        }
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">{compact ? 'Height' : 'Block Height'}</div>
                </div>

                {/* TPS */}
                <div class="text-center">
                    <div class={`font-bold text-purple-600 dark:text-purple-400 ${compact ? 'text-sm' : 'text-lg'}`}>
                        {status.tps}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">TPS</div>
                </div>
            </div>

            {!compact && lastUpdated && (
                <div class="text-xs text-slate-500 dark:text-slate-500 text-center mt-3">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
            )}

            {/* Network Info */}
            <div class={`text-xs text-slate-500 dark:text-slate-400 space-y-1 ${compact ? 'mt-2' : 'mt-4'}`}>
                <div class="flex items-center gap-1">
                    <span>🔗</span>
                    <span>Solana Devnet</span>
                </div>
                {!compact && (
                    <>
                        <div>⚡ Fast finality (~400ms)</div>
                        <div>💰 Low fees (~$0.00025)</div>
                    </>
                )}
            </div>
        </div>
    );
};