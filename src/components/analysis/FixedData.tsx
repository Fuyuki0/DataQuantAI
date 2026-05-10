// ═══════════════════════════════════════════
// DataQuantAI — Fixed Data Display
// Real metrics from market data APIs
// ═══════════════════════════════════════════

'use client';

import type { FixedData } from '@/types';
import { formatCurrency, formatPercent, formatVolume } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity, BarChart3, Target, Layers } from 'lucide-react';

interface FixedDataProps {
  data: FixedData;
  symbol: string;
}

export function FixedDataDisplay({ data, symbol }: FixedDataProps) {
  const isPositive = data.changePercent24h >= 0;

  return (
    <div className="stagger-children">
      {/* Price header */}
      <div className="mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--fg-dim)' }}>
          Market Data
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(data.price, data.price < 1 ? 6 : 2)}
          </span>
          <span
            className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: isPositive ? 'var(--green-dim)' : 'var(--red-dim)',
              color: isPositive ? 'var(--green)' : 'var(--red)',
            }}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {formatPercent(data.changePercent24h)}
          </span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <MetricCard
          icon={<TrendingUp size={12} />}
          label="24h High"
          value={formatCurrency(data.high24h, data.high24h < 1 ? 6 : 2)}
          color="var(--green)"
        />
        <MetricCard
          icon={<TrendingDown size={12} />}
          label="24h Low"
          value={formatCurrency(data.low24h, data.low24h < 1 ? 6 : 2)}
          color="var(--red)"
        />
        <MetricCard
          icon={<BarChart3 size={12} />}
          label="24h Volume"
          value={`$${formatVolume(data.volume24h)}`}
          color="var(--cyan)"
        />
        {data.marketCap ? (
          <MetricCard
            icon={<Layers size={12} />}
            label="Market Cap"
            value={formatCurrency(data.marketCap)}
            color="var(--accent)"
          />
        ) : (
          <MetricCard
            icon={<Activity size={12} />}
            label="24h Change"
            value={formatCurrency(data.change24h, data.change24h < 1 ? 6 : 2)}
            color={isPositive ? 'var(--green)' : 'var(--red)'}
          />
        )}
      </div>

      {/* Technical indicators */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--fg-dim)' }}>
          Technical Indicators
        </div>
        <div className="space-y-1.5">
          <IndicatorRow label="RSI(14)" value={data.indicators.rsi?.toFixed(2) ?? '—'} status={getRSIStatus(data.indicators.rsi)} />
          <IndicatorRow
            label="MACD"
            value={data.indicators.macd ? data.indicators.macd.macd.toFixed(4) : '—'}
            status={data.indicators.macd ? (data.indicators.macd.histogram > 0 ? 'bullish' : 'bearish') : 'neutral'}
          />
          <IndicatorRow label="SMA(20)" value={data.indicators.sma20 ? formatCurrency(data.indicators.sma20, 2) : '—'} />
          <IndicatorRow label="SMA(50)" value={data.indicators.sma50 ? formatCurrency(data.indicators.sma50, 2) : '—'} />
          {data.indicators.bollingerBands && (
            <IndicatorRow
              label="BB Width"
              value={((data.indicators.bollingerBands.upper - data.indicators.bollingerBands.lower) / data.indicators.bollingerBands.middle * 100).toFixed(2) + '%'}
              status="neutral"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      className="p-2.5 rounded-md"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-dim)' }}>{label}</span>
      </div>
      <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>
        {value}
      </div>
    </div>
  );
}

function IndicatorRow({ label, value, status }: { label: string; value: string; status?: string }) {
  const statusColor = status === 'bullish' || status === 'oversold'
    ? 'var(--green)'
    : status === 'bearish' || status === 'overbought'
      ? 'var(--red)'
      : 'var(--fg-muted)';

  return (
    <div
      className="flex items-center justify-between px-2.5 py-1.5 rounded"
      style={{ background: 'var(--bg-surface)' }}
    >
      <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-medium" style={{ color: 'var(--fg)' }}>{value}</span>
        {status && (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: statusColor }}
            title={status}
          />
        )}
      </div>
    </div>
  );
}

function getRSIStatus(rsi: number | null | undefined): string {
  if (rsi === null || rsi === undefined) return 'neutral';
  if (rsi >= 70) return 'overbought';
  if (rsi <= 30) return 'oversold';
  return 'neutral';
}
