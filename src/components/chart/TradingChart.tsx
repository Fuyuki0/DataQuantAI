// ═══════════════════════════════════════════
// FinalQuant — TradingView Chart Component
// Uses Lightweight Charts v5 API
// ═══════════════════════════════════════════

'use client';

import { useEffect, useRef, memo } from 'react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts';
import type { OHLCVData } from '@/types';

interface TradingChartProps {
  candles: OHLCVData[];
  symbol: string;
  isLoading?: boolean;
}

function TradingChartInner({ candles, symbol, isLoading }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f1117' },
        textColor: '#8b8fa3',
        fontSize: 11,
        fontFamily: 'var(--font-geist-mono), monospace',
      },
      grid: {
        vertLines: { color: 'rgba(30, 34, 49, 0.5)' },
        horzLines: { color: 'rgba(30, 34, 49, 0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(108, 92, 231, 0.4)',
          width: 1,
          style: 2,
          labelBackgroundColor: '#6c5ce7',
        },
        horzLine: {
          color: 'rgba(108, 92, 231, 0.4)',
          width: 1,
          style: 2,
          labelBackgroundColor: '#6c5ce7',
        },
      },
      rightPriceScale: {
        borderColor: '#1e2231',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: '#1e2231',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    // Candlestick series (v5 API)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00d68f',
      downColor: '#ff6b6b',
      borderDownColor: '#ff6b6b',
      borderUpColor: '#00d68f',
      wickDownColor: '#ff6b6b',
      wickUpColor: '#00d68f',
    });
    candleSeriesRef.current = candleSeries;

    // Volume histogram series (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    volumeSeriesRef.current = volumeSeries;

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    // Responsive resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);
    handleResize();

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Update data when candles change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !candles.length) return;

    const candleData = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(0, 214, 143, 0.2)' : 'rgba(255, 107, 107, 0.2)',
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles]);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(8, 9, 13, 0.8)' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>Loading {symbol}...</span>
          </div>
        </div>
      )}
      <div ref={chartContainerRef} className="h-full w-full" />
    </div>
  );
}

export const TradingChart = memo(TradingChartInner);
