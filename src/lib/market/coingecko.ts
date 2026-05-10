// ═══════════════════════════════════════════
// FinalQuant — CoinGecko Market Data Client
// ═══════════════════════════════════════════

import type { OHLCVData, TechnicalIndicators } from '@/types';
import { calculateIndicators } from '@/lib/utils';

const BASE_URL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

interface CoinGeckoMarketData {
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
}

interface CoinGeckoOHLC {
  candles: OHLCVData[];
  indicators: TechnicalIndicators;
}

export async function getCryptoMarketData(coinId: string): Promise<CoinGeckoMarketData> {
  const url = `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;

  const res = await fetch(url, {
    next: { revalidate: 30 }, // Cache for 30s
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const md = data.market_data;

  return {
    currentPrice: md.current_price?.usd ?? 0,
    priceChange24h: md.price_change_24h ?? 0,
    priceChangePercent24h: md.price_change_percentage_24h ?? 0,
    high24h: md.high_24h?.usd ?? 0,
    low24h: md.low_24h?.usd ?? 0,
    volume24h: md.total_volume?.usd ?? 0,
    marketCap: md.market_cap?.usd ?? 0,
  };
}

export async function getCryptoOHLC(
  coinId: string,
  days: number = 30
): Promise<CoinGeckoOHLC> {
  const url = `${BASE_URL}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko OHLC error: ${res.status} ${res.statusText}`);
  }

  const data: number[][] = await res.json();

  // CoinGecko OHLC format: [timestamp, open, high, low, close]
  const candles: OHLCVData[] = data.map((item) => ({
    time: Math.floor(item[0] / 1000), // Convert ms to seconds
    open: item[1],
    high: item[2],
    low: item[3],
    close: item[4],
    volume: 0, // OHLC endpoint doesn't include volume
  }));

  const closes = candles.map((c) => c.close);
  const indicators = calculateIndicators(closes);

  return { candles, indicators };
}

// Map timeframe to CoinGecko days parameter
export function timeframeToDays(timeframe: string): number {
  switch (timeframe) {
    case '1H': return 1;
    case '4H': return 7;
    case '1D': return 30;
    case '1W': return 90;
    case '1M': return 365;
    default: return 30;
  }
}
