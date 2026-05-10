// ═══════════════════════════════════════════
// FinalQuant — Alpha Vantage Market Data Client
// ═══════════════════════════════════════════

import type { OHLCVData, TechnicalIndicators } from '@/types';
import { calculateIndicators } from '@/lib/utils';

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

interface AlphaVantageMarketData {
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

interface AlphaVantageOHLC {
  candles: OHLCVData[];
  indicators: TechnicalIndicators;
}

export async function getTraditionalMarketData(symbol: string): Promise<AlphaVantageMarketData> {
  const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Alpha Vantage API error: ${res.status}`);
  }

  const data = await res.json();
  const quote = data['Global Quote'];

  if (!quote || !quote['05. price']) {
    throw new Error('No data from Alpha Vantage for this symbol');
  }

  const price = parseFloat(quote['05. price']);
  const prevClose = parseFloat(quote['08. previous close']);
  const change = parseFloat(quote['09. change']);
  const changePercent = parseFloat(quote['10. change percent']?.replace('%', ''));

  return {
    currentPrice: price,
    priceChange24h: change,
    priceChangePercent24h: changePercent,
    high24h: parseFloat(quote['03. high']),
    low24h: parseFloat(quote['04. low']),
    volume24h: parseFloat(quote['06. volume']),
  };
}

export async function getTraditionalOHLC(
  symbol: string,
  timeframe: string = '1D'
): Promise<AlphaVantageOHLC> {
  // For forex pairs like XAUUSD
  const isForex = symbol.includes('USD') && !['SPY', 'QQQ'].includes(symbol);
  const isCommodity = ['XAUUSD', 'XAGUSD'].includes(symbol);

  let func: string;
  let timeSeriesKey: string;

  if (isCommodity || isForex) {
    // Use forex endpoint for commodities priced in USD
    const fromSymbol = symbol.replace('USD', '');
    func = `FX_DAILY`;
    timeSeriesKey = 'Time Series FX (Daily)';
    const url = `${BASE_URL}?function=${func}&from_symbol=${fromSymbol}&to_symbol=USD&apikey=${API_KEY}&outputsize=compact`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Alpha Vantage error: ${res.status}`);

    const data = await res.json();
    const timeSeries = data[timeSeriesKey];

    if (!timeSeries) {
      // Fallback: generate synthetic data for demo
      return generateSyntheticData(symbol);
    }

    const candles: OHLCVData[] = Object.entries(timeSeries)
      .slice(0, 100)
      .reverse()
      .map(([date, values]: [string, unknown]) => {
        const v = values as Record<string, string>;
        return {
          time: Math.floor(new Date(date).getTime() / 1000),
          open: parseFloat(v['1. open']),
          high: parseFloat(v['2. high']),
          low: parseFloat(v['3. low']),
          close: parseFloat(v['4. close']),
          volume: 0,
        };
      });

    const closes = candles.map((c) => c.close);
    return { candles, indicators: calculateIndicators(closes) };
  }

  // Stock/ETF daily data
  func = 'TIME_SERIES_DAILY';
  timeSeriesKey = 'Time Series (Daily)';
  const url = `${BASE_URL}?function=${func}&symbol=${symbol}&apikey=${API_KEY}&outputsize=compact`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Alpha Vantage error: ${res.status}`);

  const data = await res.json();
  const timeSeries = data[timeSeriesKey];

  if (!timeSeries) {
    return generateSyntheticData(symbol);
  }

  const candles: OHLCVData[] = Object.entries(timeSeries)
    .slice(0, 100)
    .reverse()
    .map(([date, values]: [string, unknown]) => {
      const v = values as Record<string, string>;
      return {
        time: Math.floor(new Date(date).getTime() / 1000),
        open: parseFloat(v['1. open']),
        high: parseFloat(v['2. high']),
        low: parseFloat(v['3. low']),
        close: parseFloat(v['4. close']),
        volume: parseFloat(v['5. volume'] || '0'),
      };
    });

  const closes = candles.map((c) => c.close);
  return { candles, indicators: calculateIndicators(closes) };
}

// Generate synthetic data for demo/fallback
function generateSyntheticData(symbol: string): AlphaVantageOHLC {
  const basePrices: Record<string, number> = {
    'XAUUSD': 2340,
    'XAGUSD': 29.5,
    'SPY': 525,
    'QQQ': 445,
    'EURUSD': 1.085,
    'GBPUSD': 1.265,
  };

  const basePrice = basePrices[symbol] || 100;
  const candles: OHLCVData[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = 90; i >= 0; i--) {
    const change = (Math.random() - 0.48) * basePrice * 0.015;
    price = Math.max(price + change, basePrice * 0.8);
    const spread = basePrice * 0.008;

    candles.push({
      time: now - i * 86400,
      open: price - spread / 2,
      high: price + spread,
      low: price - spread,
      close: price + spread / 2,
      volume: Math.floor(Math.random() * 10000000),
    });
  }

  const closes = candles.map((c) => c.close);
  return { candles, indicators: calculateIndicators(closes) };
}
