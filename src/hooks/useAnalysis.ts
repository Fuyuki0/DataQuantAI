// ═══════════════════════════════════════════
// FinalQuant — AI Analysis Hook
// ═══════════════════════════════════════════

'use client';

import { useState, useCallback } from 'react';
import type { AnalysisResponse, Timeframe } from '@/types';

export function useAnalysis() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
