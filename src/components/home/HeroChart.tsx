// ═══════════════════════════════════════════
// DataQuantAI — Landing Page Interactive Chart
// Full dashboard-grade chart for the hero section
// ═══════════════════════════════════════════

'use client';

import { useState, useCallback } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { TradingChart } from '@/components/chart/TradingChart';
import { ChartControls } from '@/components/chart/ChartControls';
import { SymbolSelector } from '@/components/chart/SymbolSelector';
import { RefreshCw, Clock, Wifi, Brain, Lock } from 'lucide-react';
import { SUPPORTED_ASSETS, type Asset, type Timeframe } from '@/types';

export function HeroChart() {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(SUPPORTED_ASSETS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');

  const { data: marketData, isLoading, refresh } = useMarketData(
    selectedAsset?.symbol || null,
    timeframe
  );

  const handleAssetChange = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
  }, []);

  const handleTimeframeChange = useCallback((tf: Timeframe) => {
    setTimeframe(tf);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl overflow-hidden animate-fade-in-up"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)', animationDelay: '400ms', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

      {/* Top bar — exactly like the dashboard */}
      <header className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <div className="flex items-center gap-3">
          <SymbolSelector selected={selectedAsset} onSelect={handleAssetChange} />
          <ChartControls timeframe={timeframe} onTimeframeChange={handleTimeframeChange} />
        </div>

        <div className="flex items-center gap-3">
          {/* Price ticker */}
          {marketData && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>
                ${marketData.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: marketData.currentPrice < 1 ? 6 : 2 })}
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: marketData.priceChangePercent24h >= 0 ? 'var(--green-dim)' : 'var(--red-dim)',
                  color: marketData.priceChangePercent24h >= 0 ? 'var(--green)' : 'var(--red)',
                }}>
                {marketData.priceChangePercent24h >= 0 ? '+' : ''}{marketData.priceChangePercent24h.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Status indicators */}
          <div className="flex items-center gap-2" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
            <button onClick={() => refresh()}
              className="p-1.5 rounded transition-all hover:bg-[var(--bg-hover)]" title="Refresh data">
              <RefreshCw size={13} style={{ color: 'var(--fg-dim)' }} />
            </button>
            <div className="flex items-center gap-1" title="Live connection">
              <Wifi size={11} style={{ color: 'var(--green)' }} />
              <span className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chart area */}
      <div className="relative" style={{ height: '360px', background: 'var(--bg-elevated)' }}>
        {marketData ? (
          <TradingChart
            candles={marketData.candles}
            symbol={marketData.symbol}
            isLoading={isLoading}
            showVolume={true}
          />
        ) : isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Loading chart data...
              </span>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs" style={{ color: 'var(--fg-dim)' }}>
              Select an asset to view chart
            </span>
          </div>
        )}

        {/* Chart footer */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex items-center justify-between"
          style={{ background: 'rgba(15, 17, 23, 0.85)', borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5">
            <Clock size={10} style={{ color: 'var(--fg-dim)' }} />
            <span className="text-[10px] font-mono" style={{ color: 'var(--fg-dim)' }} suppressHydrationWarning>
              {new Date().toLocaleTimeString()} · {timeframe}
            </span>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>
            {selectedAsset?.type === 'CRYPTO' ? 'CoinGecko' : 'Alpha Vantage'}
          </span>
        </div>
      </div>

      {/* Bottom indicators bar + AI teaser */}
      <div className="flex" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Indicators */}
        <div className="flex-1 px-4 py-3 flex items-center gap-5 overflow-hidden">
          {marketData?.indicators ? (
            <>
              <div>
                <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--fg-dim)' }}>RSI(14)</div>
                <div className="text-xs font-mono font-semibold" style={{
                  color: (marketData.indicators.rsi ?? 50) > 70 ? 'var(--red)' : (marketData.indicators.rsi ?? 50) < 30 ? 'var(--green)' : 'var(--amber)'
                }}>
                  {marketData.indicators.rsi?.toFixed(2) || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--fg-dim)' }}>MACD</div>
                <div className="text-xs font-mono font-semibold" style={{
                  color: marketData.indicators.macd ? (marketData.indicators.macd.histogram > 0 ? 'var(--green)' : 'var(--red)') : 'var(--fg-dim)'
                }}>
                  {marketData.indicators.macd ? (marketData.indicators.macd.histogram > 0 ? '▲ Bullish' : '▼ Bearish') : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--fg-dim)' }}>SMA(20)</div>
                <div className="text-xs font-mono font-semibold" style={{ color: 'var(--fg-muted)' }}>
                  {marketData.indicators.sma20 ? `$${marketData.indicators.sma20.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--fg-dim)' }}>BB Width</div>
                <div className="text-xs font-mono font-semibold" style={{ color: 'var(--fg-muted)' }}>
                  {marketData.indicators.bollingerBands
                    ? ((marketData.indicators.bollingerBands.upper - marketData.indicators.bollingerBands.lower) / marketData.indicators.bollingerBands.middle * 100).toFixed(2) + '%'
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--fg-dim)' }}>EMA Cross</div>
                <div className="text-xs font-mono font-semibold" style={{
                  color: marketData.indicators.ema12 && marketData.indicators.ema26
                    ? (marketData.indicators.ema12 > marketData.indicators.ema26 ? 'var(--green)' : 'var(--red)')
                    : 'var(--fg-dim)'
                }}>
                  {marketData.indicators.ema12 && marketData.indicators.ema26
                    ? (marketData.indicators.ema12 > marketData.indicators.ema26 ? '▲ Bull' : '▼ Bear')
                    : 'N/A'}
                </div>
              </div>
            </>
          ) : (
            <>
              {[1,2,3,4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-2 w-10 rounded mb-1.5" style={{ background: 'var(--bg-surface)' }} />
                  <div className="h-3 w-14 rounded" style={{ background: 'var(--bg-surface)' }} />
                </div>
              ))}
            </>
          )}
        </div>

        {/* AI teaser panel */}
        <div className="w-px" style={{ background: 'var(--border)' }} />
        <div className="w-64 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
              <Brain size={9} style={{ color: 'var(--accent)' }} />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--fg)' }}>AI Analysis</span>
            <span className="ml-auto flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: 'var(--bg-surface)', color: 'var(--fg-dim)', border: '1px solid var(--border)' }}>
              <Lock size={7} /> Sign in
            </span>
          </div>
          <div className="text-[10px] leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            Sign in to unlock Gemini AI quantitative analysis — trend signals, entry/exit points, risk scoring, and live chat assistant.
          </div>
        </div>
      </div>
    </div>
  );
}
