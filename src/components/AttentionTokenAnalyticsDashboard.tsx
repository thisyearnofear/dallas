/**
 * Attention Token Analytics Dashboard
 * Advanced analytics with charts, metrics, and insights
 */

import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { attentionTokenService } from '../services/AttentionTokenService';
import { attentionTokenTradingService, PriceHistory } from '../services/AttentionTokenTradingService';
import { AttentionToken } from '../types/attentionToken';

interface AttentionTokenAnalyticsDashboardProps {
  token: AttentionToken;
}

export const AttentionTokenAnalyticsDashboard: React.FC<AttentionTokenAnalyticsDashboardProps> = ({
  token,
}) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [token.mint, timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const history = await attentionTokenTradingService.getPriceHistory(
        token.mint,
        timeframe
      );
      setPriceHistory(history);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const analytics = token.analytics;
  if (!analytics) return null;

  // Calculate additional metrics
  const allTimeHigh = Math.max(...priceHistory.map((p) => p.price));
  const allTimeLow = Math.min(...priceHistory.map((p) => p.price));
  const currentPrice = analytics.price;
  const athDistance = ((currentPrice - allTimeHigh) / allTimeHigh) * 100;
  const atlDistance = ((currentPrice - allTimeLow) / allTimeLow) * 100;

  const totalVolume = priceHistory.reduce((sum, p) => sum + p.volume, 0);
  const avgVolume = totalVolume / priceHistory.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{token.name}</h1>
          <p className="text-gray-400">{token.symbol}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">${currentPrice.toFixed(6)}</div>
          <div
            className={`text-sm ${
              analytics.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {analytics.priceChange24h >= 0 ? '+' : ''}
            {analytics.priceChange24h.toFixed(2)}% (24h)
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Market Cap"
          value={`$${analytics.marketCap.toLocaleString()}`}
          icon="💰"
        />
        <MetricCard
          label="24h Volume"
          value={`$${analytics.volume24h.toLocaleString()}`}
          icon="📊"
        />
        <MetricCard
          label="Holders"
          value={analytics.holders.toLocaleString()}
          icon="👥"
        />
        <MetricCard
          label="Transactions"
          value={analytics.transactions.toLocaleString()}
          icon="🔄"
        />
      </div>

      {/* Price Chart */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Price Chart</h3>
          <div className="flex gap-2">
            {(['1h', '24h', '7d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-bold transition ${
                  timeframe === tf
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
        ) : priceHistory.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p>No price data available for this timeframe</p>
              <p className="text-sm mt-2">Trading activity will appear here</p>
            </div>
          </div>
        ) : (
          <SimplePriceChart data={priceHistory} />
        )}
      </div>

      {/* Price Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="All-Time High"
          value={`$${allTimeHigh.toFixed(6)}`}
          subtitle={`${athDistance.toFixed(2)}% from ATH`}
          subtitleColor={athDistance >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="All-Time Low"
          value={`$${allTimeLow.toFixed(6)}`}
          subtitle={`${atlDistance.toFixed(2)}% from ATL`}
          subtitleColor={atlDistance >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Average Volume"
          value={`$${avgVolume.toLocaleString()}`}
          subtitle={`${timeframe} period`}
          subtitleColor="text-gray-400"
        />
      </div>

      {/* Volume Chart */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4">Volume</h3>
        <SimpleVolumeChart data={priceHistory} />
      </div>

      {/* Fee Distribution */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4">Fee Distribution</h3>
        <div className="space-y-3">
          <FeeBar label="Submitter (50%)" percentage={50} amount={analytics.lifetimeFees * 0.5} />
          <FeeBar label="Validators (10%)" percentage={10} amount={analytics.lifetimeFees * 0.1} />
          <FeeBar label="Platform (10%)" percentage={10} amount={analytics.lifetimeFees * 0.1} />
          <FeeBar label="Liquidity (30%)" percentage={30} amount={analytics.lifetimeFees * 0.3} />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 text-right">
          <div className="text-sm text-gray-400">Total Lifetime Fees</div>
          <div className="text-2xl font-bold text-green-400">
            ${analytics.lifetimeFees.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Token Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Token Details">
          <InfoRow label="Symbol" value={token.symbol} />
          <InfoRow label="Mint Address" value={`${token.mint.toString().slice(0, 8)}...`} />
          <InfoRow
            label="Created"
            value={new Date(token.createdAt).toLocaleDateString()}
          />
          <InfoRow
            label="Reputation Score"
            value={`${token.reputationScore}/100`}
            valueColor="text-green-400"
          />
        </InfoCard>

        <InfoCard title="Trading Info">
          <InfoRow label="Bonding Curve" value={`${token.bondingCurve.toString().slice(0, 8)}...`} />
          <InfoRow label="Trading Fee" value="2%" />
          <InfoRow
            label="Last Trade"
            value={new Date(analytics.lastTradeAt).toLocaleTimeString()}
          />
          <InfoRow label="Status" value="Active" valueColor="text-green-400" />
        </InfoCard>
      </div>

      {/* Graduation Progress */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg border border-purple-500">
        <h3 className="text-xl font-bold mb-4">🎓 DEX Graduation Progress</h3>
        <div className="space-y-4">
          <ProgressBar
            label="Market Cap"
            current={analytics.marketCap}
            target={100000}
            unit="$"
          />
          <ProgressBar
            label="Daily Volume"
            current={analytics.volume24h}
            target={10000}
            unit="$"
          />
          <ProgressBar
            label="Consecutive Days"
            current={0}
            target={7}
            unit=" days"
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components

const MetricCard: React.FC<{ label: string; value: string; icon: string }> = ({
  label,
  value,
  icon,
}) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: string;
  subtitle: string;
  subtitleColor: string;
}> = ({ label, value, subtitle, subtitleColor }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
    <div className="text-sm text-gray-400 mb-1">{label}</div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className={`text-sm ${subtitleColor}`}>{subtitle}</div>
  </div>
);

const SimplePriceChart: React.FC<{ data: PriceHistory[] }> = ({ data }) => {
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;

  const maxPrice = Math.max(...data.map((d) => d.price));
  const minPrice = Math.min(...data.map((d) => d.price));
  const range = maxPrice - minPrice;

  return (
    <div className="h-64 flex items-end gap-1">
      {data.map((point, i) => {
        const height = ((point.price - minPrice) / range) * 100;
        return (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t hover:opacity-80 transition cursor-pointer"
            style={{ height: `${height}%` }}
            title={`$${point.price.toFixed(6)} at ${new Date(point.timestamp).toLocaleString()}`}
          />
        );
      })}
    </div>
  );
};

const SimpleVolumeChart: React.FC<{ data: PriceHistory[] }> = ({ data }) => {
  if (data.length === 0) return <div className="h-40 flex items-center justify-center text-gray-500">No data available</div>;

  const maxVolume = Math.max(...data.map((d) => d.volume));

  return (
    <div className="h-40 flex items-end gap-1">
      {data.map((point, i) => {
        const height = (point.volume / maxVolume) * 100;
        return (
          <div
            key={i}
            className="flex-1 bg-blue-600 rounded-t hover:opacity-80 transition cursor-pointer"
            style={{ height: `${height}%` }}
            title={`$${point.volume.toFixed(2)} volume`}
          />
        );
      })}
    </div>
  );
};

const FeeBar: React.FC<{ label: string; percentage: number; amount: number }> = ({
  label,
  percentage,
  amount,
}) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold">${amount.toLocaleString()}</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
      <div
        className="bg-gradient-to-r from-green-600 to-emerald-600 h-3 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string; valueColor?: string }> = ({
  label,
  value,
  valueColor = 'text-white',
}) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">{label}:</span>
    <span className={`font-bold ${valueColor}`}>{value}</span>
  </div>
);

const ProgressBar: React.FC<{
  label: string;
  current: number;
  target: number;
  unit: string;
}> = ({ label, current, target, unit }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className={isComplete ? 'text-green-400' : 'text-gray-400'}>
          {current.toLocaleString()}
          {unit} / {target.toLocaleString()}
          {unit} {isComplete ? '✓' : ''}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isComplete ? 'bg-green-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
