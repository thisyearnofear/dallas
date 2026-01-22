import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getNetworkStatus } from '../services/BlockchainIntegration';

interface NetworkStatusData {
    blockHeight: number;
    health: 'ok' | 'behind' | 'unknown';
    tps: number;
}

export const NetworkStatus: FunctionalComponent = () => {
    const [status, setStatus] = useState<NetworkStatusData>({
        blockHeight: 0,
        health: 'unknown',
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

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'ok':
                return 'text-green-400';
            case 'behind':
                return 'text-yellow-400';
            default:
                return 'text-red-400';
        }
    };

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'ok':
                return '✅';
            case 'behind':
                return '⚠️';
            default:
                return '❌';
        }
    };

    return (
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-white">🌐 Network Status</h3>
                <button
                    onClick={loadNetworkStatus}
                    disabled={loading}
                    class="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-2 py-1 rounded transition"
                >
                    {loading ? '⏳' : '🔄'}
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Network Health */}
                <div class="text-center">
                    <div class="text-2xl mb-1">
                        {getHealthIcon(status.health)}
                    </div>
                    <div class={`text-sm font-bold ${getHealthColor(status.health)}`}>
                        {status.health.toUpperCase()}
                    </div>
                    <div class="text-xs text-gray-400">Health</div>
                </div>

                {/* Block Height */}
                <div class="text-center">
                    <div class="text-lg font-bold text-blue-400">
                        {status.blockHeight.toLocaleString()}
                    </div>
                    <div class="text-xs text-gray-400">Block Height</div>
                </div>

                {/* TPS */}
                <div class="text-center">
                    <div class="text-lg font-bold text-purple-400">
                        {status.tps}
                    </div>
                    <div class="text-xs text-gray-400">TPS</div>
                </div>
            </div>

            {lastUpdated && (
                <div class="text-xs text-gray-500 text-center mt-3">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
            )}

            {/* Network Info */}
            <div class="mt-4 text-xs text-gray-400 space-y-1">
                <div>🔗 Solana Devnet</div>
                <div>⚡ Fast finality (~400ms)</div>
                <div>💰 Low fees (~$0.00025)</div>
            </div>
        </div>
    );
};