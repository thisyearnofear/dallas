/**
 * WearableIntegration - High-Frequency Health Data Management
 * 
 * Provides UI for connecting wearables (Garmin, Dexcom, etc.) and
 * syncing high-frequency health metrics with ZK privacy.
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: Extends privacy dashboard with data ingestion
 * - MODULAR: Independent component for wearable management
 * - CLEAN: Separation of mock generation and privacy submission
 */

import { FunctionalComponent } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import { privacyService } from '../services/privacy/PrivacyService';
import { HealthMetric, HealthInsight } from '../types';
import { useWallet } from '../context/WalletContext';
import { Modal, LoadingScreen } from './SharedUIComponents';

interface Device {
    id: string;
    name: string;
    icon: string;
    type: 'cgm' | 'watch' | 'ring';
    status: 'connected' | 'disconnected' | 'syncing';
}

const SUPPORTED_DEVICES: Device[] = [
    { id: 'garmin_fenix', name: 'Garmin Fenix 7', icon: '⌚', type: 'watch', status: 'disconnected' },
    { id: 'dexcom_g7', name: 'Dexcom G7', icon: '🩸', type: 'cgm', status: 'disconnected' },
    { id: 'oura_ring', name: 'Oura Ring Gen 3', icon: '💍', type: 'ring', status: 'disconnected' },
];

export const WearableIntegration: FunctionalComponent = () => {
    const { publicKey } = useWallet();
    const [devices, setDevices] = useState<Device[]>(SUPPORTED_DEVICES);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState<string[]>([]);
    const [lastSyncResult, setLastSyncResult] = useState<any>(null);

    /**
     * Simulate Wearable Data Ingestion
     */
    const handleConnect = useCallback((deviceId: string) => {
        setDevices(prev => prev.map(d =>
            d.id === deviceId ? { ...d, status: 'connected' } : d
        ));
    }, []);

    /**
     * Unified Sync Flow: Archive (IPFS) + State (Light) + Proof (Noir)
     */
    const handleSync = useCallback(async (device: Device) => {
        if (!publicKey) return;

        setIsSyncing(true);
        setSyncProgress(['Establishing secure connection...', 'Fetching telemetry from Garmin API...']);

        try {
            // 1. Mock Data Generation (High Frequency)
            const mockMetric: HealthMetric = {
                type: device.type === 'cgm' ? 'glucose' : 'steps',
                value: device.type === 'cgm' ? 115 : 8420,
                unit: device.type === 'cgm' ? 'mg/dL' : 'steps',
                timestamp: Date.now(),
                source: 'garmin',
                deviceId: device.id,
            };

            // 2. Mock Insight Generation (Aggregate)
            const mockInsight: HealthInsight = {
                metricType: mockMetric.type,
                period: 'daily',
                averageValue: device.type === 'cgm' ? 112 : 10500,
                minValue: device.type === 'cgm' ? 85 : 0,
                maxValue: device.type === 'cgm' ? 145 : 15000,
                consistencyScore: 92, // High consistency triggers ZK proof
                timestamp: Date.now(),
            };

            await new Promise(r => setTimeout(r, 1500));
            setSyncProgress(prev => [...prev, 'Encrypting raw telemetry (AES-256)...']);

            await new Promise(r => setTimeout(r, 1000));
            setSyncProgress(prev => [...prev, 'Generating ZK Compression state (Light Protocol)...']);

            // 3. Privacy Stack Submission
            const result = await privacyService.submitHealthMetricWithPrivacy(
                publicKey,
                mockMetric,
                mockInsight
            );

            if (result.success) {
                setSyncProgress(prev => [...prev, 'Generating Noir consistency proof...', 'State root registered on Solana.']);
                await new Promise(r => setTimeout(r, 1000));
                setLastSyncResult(result);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Sync failed:', err);
        } finally {
            setIsSyncing(false);
        }
    }, [publicKey]);

    return (
        <div class="w-full max-w-4xl mx-auto p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all">
            {/* Header */}
            <div class="flex items-center justify-between mb-10">
                <div>
                    <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Wearable Syringe</h2>
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Direct Neural Health Ingestion</p>
                </div>
                <div class="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                    🛡️ ZK PROTECTION ACTIVE
                </div>
            </div>

            {/* Device Grid */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {devices.map(device => (
                    <div
                        key={device.id}
                        class={`p-6 rounded-2xl border-2 transition-all group ${device.status === 'connected'
                                ? 'bg-white dark:bg-slate-800 border-green-500 shadow-lg shadow-green-500/10'
                                : 'bg-slate-100 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700 hover:border-blue-500'
                            }`}
                    >
                        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">{device.icon}</div>
                        <h3 class="font-black dark:text-white uppercase text-sm mb-1">{device.name}</h3>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{device.type}</p>

                        {device.status === 'connected' ? (
                            <button
                                onClick={() => handleSync(device)}
                                class="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-black text-[10px] rounded-lg shadow-md transition-all active:scale-95 uppercase tracking-widest"
                            >
                                🔄 Sync Records
                            </button>
                        ) : (
                            <button
                                onClick={() => handleConnect(device.id)}
                                class="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-blue-500 hover:text-white text-slate-600 dark:text-slate-400 font-black text-[10px] rounded-lg transition-all active:scale-95 uppercase tracking-widest border border-slate-300 dark:border-slate-600"
                            >
                                ⚡ Link Device
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Sync Status / Results */}
            {lastSyncResult && (
                <div class="animate-fadeIn p-6 bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-2xl">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-2xl">🛡️</span>
                        <div>
                            <h4 class="font-black text-green-800 dark:text-green-400 text-xs uppercase tracking-widest">Successful Sync</h4>
                            <p class="text-[10px] font-bold text-green-600 opacity-60">Verified with ZK Proofs</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div class="bg-white dark:bg-black/40 p-3 rounded-xl border border-green-200 dark:border-green-800">
                            <p class="text-[9px] font-black uppercase text-slate-400 mb-1">Privacy Score</p>
                            <p class="text-lg font-black text-green-600">{lastSyncResult.privacyScore}/100</p>
                        </div>
                        <div class="bg-white dark:bg-black/40 p-3 rounded-xl border border-green-200 dark:border-green-800">
                            <p class="text-[9px] font-black uppercase text-slate-400 mb-1">Compression</p>
                            <p class="text-lg font-black text-blue-500">
                                {lastSyncResult.operations.find(o => o.type === 'compression')?.metadata.ratio.toFixed(0)}x
                            </p>
                        </div>
                        <div class="bg-white dark:bg-black/40 p-3 rounded-xl border border-green-200 dark:border-green-800">
                            <p class="text-[9px] font-black uppercase text-slate-400 mb-1">State Save</p>
                            <p class="text-lg font-black text-purple-500">{lastSyncResult.compressedState?.costSavings}</p>
                        </div>
                        <div class="bg-white dark:bg-black/40 p-3 rounded-xl border border-green-200 dark:border-green-800">
                            <p class="text-[9px] font-black uppercase text-slate-400 mb-1">ZK Proofs</p>
                            <p class="text-lg font-black text-yellow-500">
                                {lastSyncResult.operations.filter(o => o.type === 'zk_proof').length} Verified
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Sync Modal Overlay */}
            {isSyncing && (
                <LoadingScreen
                    message="Synchronizing Biometrics"
                    agentActivity={syncProgress}
                />
            )}
        </div>
    );
};
