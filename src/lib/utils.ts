// ═══════════════════════════════════════════
// DataQuantAI — Utility Functions
// ═══════════════════════════════════════════

import { clsx, type ClassValue } from 'clsx';
import type { TechnicalIndicators } from '@/types';

// ── Class merging ──────────────────────────
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ── Number formatting ──────────────────────
export function formatCurrency(value: number, decimals: number = 2): string {
  if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }
  return `$${value.toFixed(decimals)}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

// ── Technical Indicators ───────────────────
export function calculateIndicators(closes: number[]): TechnicalIndicators {
  if (closes.length < 2) {
    return {
      rsi: null,
      macd: null,
      sma20: null,
      sma50: null,
      ema12: null,
      ema26: null,
      bollingerBands: null,
    };
  }

  return {
    rsi: calculateRSI(closes),
    macd: calculateMACD(closes),
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    ema12: calculateEMA(closes, 12),
    ema26: calculateEMA(closes, 26),
    bollingerBands: calculateBollingerBands(closes),
  };
}

function calculateSMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

function calculateEMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const multiplier = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }
  return ema;
}

function calculateRSI(data: number[], period: number = 14): number | null {
  if (data.length < period + 1) return null;

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }

  avgGain /= period;
  avgLoss /= period;

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateMACD(data: number[]): { macd: number; signal: number; histogram: number } | null {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  if (ema12 === null || ema26 === null) return null;

  const macdLine = ema12 - ema26;

  // Simplified signal line (would need full MACD series for accurate EMA of MACD)
  const signal = macdLine * 0.8; // Approximation
  const histogram = macdLine - signal;

  return { macd: macdLine, signal, histogram };
}

function calculateBollingerBands(data: number[], period: number = 20): {
  upper: number;
  middle: number;
  lower: number;
} | null {
  const sma = calculateSMA(data, period);
  if (sma === null || data.length < period) return null;

  const slice = data.slice(-period);
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: sma + 2 * stdDev,
    middle: sma,
    lower: sma - 2 * stdDev,
  };
}

// ── Time helpers ───────────────────────────
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
