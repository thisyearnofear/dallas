// Network Intel Widget - Real-time Network Visualization
// Core Principles: ENHANCEMENT FIRST, CLEAN separation

import { useState, useEffect } from 'preact/hooks';
import { Connection } from '@solana/web3.js';
import { getRpcEndpoint } from '../config/solana';

export function NetworkIntelWidget() {
  const [networkStats, setNetworkStats] = useState({
    ping: 0,
    slot: 0,
    tps: 0,
    epochProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const connection = new Connection(getRpcEndpoint());
    
    const fetchStats = async () => {
      try {
        const start = Date.now();
        const epochInfo = await connection.getEpochInfo();
        const ping = Date.now() - start;
        
        const samples = await connection.getRecentPerformanceSamples(1);
        const tps = samples[0]?.numTransactions / samples[0]?.samplePeriodSecs || 0;

        setNetworkStats({
          ping,
          slot: epochInfo.absoluteSlot,
          tps: Math.floor(tps),
          epochProgress: (epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100
        });
        setLoading(false);
      } catch (e) {
        console.error('Failed to fetch network stats', e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div class="text-xs text-green-500 animate-pulse">Initializing Network Link...</div>;

  const pingColor = networkStats.ping < 200 ? 'text-green-400' : networkStats.ping < 500 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div class="bg-black border border-green-800 rounded p-2 text-xs font-mono w-full">
      <div class="flex justify-between border-b border-green-900 pb-1 mb-1">
        <span class="text-green-600 font-bold">POLICE SCANNER // FDA-NET</span>
        <span class="text-red-500 animate-pulse">● LIVE</span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="flex justify-between">
          <span class="text-gray-500">SURVEILLANCE LAG</span>
          <span class={`${pingColor} font-bold`}>{networkStats.ping}ms</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">GRID ACTIVITY</span>
          <span class="text-blue-400">{networkStats.tps}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">CHECKPOINT</span>
          <span class="text-purple-400">{networkStats.slot.toLocaleString()}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">SWEEP PROGRESS</span>
          <span class="text-yellow-400">{networkStats.epochProgress.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
