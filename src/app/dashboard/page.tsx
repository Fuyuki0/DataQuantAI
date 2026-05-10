// ═══════════════════════════════════════════
// DataQuantAI — Dashboard Page (Main Split View)
// ═══════════════════════════════════════════

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { TradingChart } from '@/components/chart/TradingChart';
import { ChartControls } from '@/components/chart/ChartControls';
import { SymbolSelector } from '@/components/chart/SymbolSelector';
import { AIPanel } from '@/components/analysis/AIPanel';
import { useMarketData } from '@/hooks/useMarketData';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useSettings } from '@/hooks/useSettings';
import { SUPPORTED_ASSETS, type Asset, type Timeframe } from '@/types';
import { RefreshCw, Clock, Wifi } from 'lucide-react';

export default function DashboardPage() {
  const { settings, loaded } = useSettings();

  const [selectedAsset, setSelectedAsset] = useState<Asset>(SUPPORTED_ASSETS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [splitPosition, setSplitPosition] = useState(62);
  const [settingsApplied, setSettingsApplied] = useState(false);

  // Apply saved settings on first load
  useEffect(() => {
    if (!loaded || settingsApplied) return;
    const savedAsset = SUPPORTED_ASSETS.find((a) => a.symbol === settings.defaultSymbol);
    if (savedAsset) setSelectedAsset(savedAsset);
    setTimeframe(settings.defaultTimeframe);
    setSettingsApplied(true);
  }, [loaded, settings, settingsApplied]);

  const { data: marketData, isLoading: isMarketLoading, refresh } = useMarketData(
    selectedAsset?.symbol || null,
    timeframe
  );

  const { data: analysis, isLoading: isAnalyzing, error: analysisError, analyze } = useAnalysis(
    selectedAsset?.symbol || null
  );

  // Auto-analyze when asset changes (if setting is on)
  useEffect(() => {
    if (!settingsApplied || !settings.autoAnalyze || !selectedAsset) return;
    analyze(selectedAsset.symbol, timeframe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsset?.symbol, settingsApplied]);

  // ── Resizer logic ──────────────────────
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPos = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.max(30, Math.min(80, newPos)));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // ── Handlers ───────────────────────────
  const handleAnalyze = useCallback(() => {
    if (selectedAsset) analyze(selectedAsset.symbol, timeframe);
  }, [selectedAsset, timeframe, analyze]);

  const handleAssetChange = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
  }, []);

  const handleTimeframeChange = useCallback((tf: Timeframe) => {
    setTimeframe(tf);
  }, []);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
      >
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
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: marketData.priceChangePercent24h >= 0 ? 'var(--green-dim)' : 'var(--red-dim)',
                  color: marketData.priceChangePercent24h >= 0 ? 'var(--green)' : 'var(--red)',
                }}
              >
                {marketData.priceChangePercent24h >= 0 ? '+' : ''}{marketData.priceChangePercent24h.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Status indicators */}
          <div className="flex items-center gap-2" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
            <button
              id="refresh-data-btn"
              onClick={() => refresh()}
              className="p-1.5 rounded transition-all hover:bg-[var(--bg-hover)]"
              title="Refresh data"
            >
              <RefreshCw size={13} style={{ color: 'var(--fg-dim)' }} />
            </button>
            <div className="flex items-center gap-1" title="Live connection">
              <Wifi size={11} style={{ color: 'var(--green)' }} />
              <span className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Split panel */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Left: Chart */}
        <div style={{ width: `${splitPosition}%` }} className="flex-shrink-0 overflow-hidden">
          <div className="h-full relative" style={{ background: 'var(--bg-elevated)' }}>
            {marketData ? (
              <TradingChart
                candles={marketData.candles}
                symbol={marketData.symbol}
                isLoading={isMarketLoading}
                showVolume={settings.showVolume}
              />
            ) : isMarketLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                  />
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

            {/* Chart footer status */}
            <div
              className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex items-center justify-between"
              style={{ background: 'rgba(15, 17, 23, 0.85)', borderTop: '1px solid var(--border)' }}
            >
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
        </div>

        {/* Resize handle */}
        <div className="resize-handle" onMouseDown={handleMouseDown} />

        {/* Right: AI Panel */}
        <div style={{ flex: 1 }} className="overflow-hidden">
          <AIPanel
            analysis={analysis}
            isLoading={isAnalyzing}
            error={analysisError}
            onAnalyze={handleAnalyze}
            selectedSymbol={selectedAsset?.symbol || null}
            selectedAsset={selectedAsset}
          />
        </div>
      </div>
    </div>
  );
}
