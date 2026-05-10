// ═══════════════════════════════════════════
// DataQuantAI — AI Analysis Hook (with localStorage persistence)
// ═══════════════════════════════════════════

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { AnalysisResponse, Timeframe } from '@/types';

const ANALYSIS_KEY_PREFIX = 'dataquantai_analysis_';

function loadAnalysis(symbol: string | null): AnalysisResponse | null {
  if (!symbol || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ANALYSIS_KEY_PREFIX + symbol);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAnalysis(result: AnalysisResponse) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANALYSIS_KEY_PREFIX + result.symbol, JSON.stringify(result));
  } catch {}
}

export function useAnalysis(currentSymbol: string | null = null) {
  const [data, setData] = useState<AnalysisResponse | null>(() => loadAnalysis(currentSymbol));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore cached analysis when symbol changes
  useEffect(() => {
    if (!currentSymbol) {
      setData(null);
      return;
    }
    const cached = loadAnalysis(currentSymbol);
    setData(cached);
    setError(null);
  }, [currentSymbol]);

  const analyze = useCallback(async (symbol: string, timeframe: Timeframe) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframe }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed (${res.status})`);
      }

      const result: AnalysisResponse = await res.json();
      setData(result);
      saveAnalysis(result); // persist so it survives navigation
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, isLoading, error, analyze, reset };
}
