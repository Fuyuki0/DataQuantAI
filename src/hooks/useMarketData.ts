// ═══════════════════════════════════════════
// DataQuantAI — Market Data Hook (SWR)
// ═══════════════════════════════════════════

'use client';

import useSWR from 'swr';
import type { MarketDataResponse, Timeframe } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch market data');
  return res.json();
});

export function useMarketData(symbol: string | null, timeframe: Timeframe = '1D') {
  const { data, error, isLoading, mutate } = useSWR<MarketDataResponse>(
    symbol ? `/api/market?symbol=${symbol}&timeframe=${timeframe}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30s
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}
