// ═══════════════════════════════════════════
// FinalQuant — Market Data API Route
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getCryptoMarketData, getCryptoOHLC, timeframeToDays } from '@/lib/market/coingecko';
import { getTraditionalMarketData, getTraditionalOHLC } from '@/lib/market/alphavantage';
import { SUPPORTED_ASSETS } from '@/types';
import type { MarketDataResponse, Timeframe } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const timeframe = (searchParams.get('timeframe') || '1D') as Timeframe;

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const asset = SUPPORTED_ASSETS.find((a) => a.symbol === symbol);
    if (!asset) {
      return NextResponse.json({ error: `Unsupported symbol: ${symbol}` }, { status: 400 });
    }

    let response: MarketDataResponse;

    if (asset.type === 'CRYPTO') {
      // Fetch from CoinGecko
      const [marketData, ohlcData] = await Promise.all([
        getCryptoMarketData(symbol),
        getCryptoOHLC(symbol, timeframeToDays(timeframe)),
      ]);

      response = {
        symbol,
        name: asset.name,
        type: asset.type,
        currentPrice: marketData.currentPrice,
        priceChange24h: marketData.priceChange24h,
        priceChangePercent24h: marketData.priceChangePercent24h,
        high24h: marketData.high24h,
        low24h: marketData.low24h,
        volume24h: marketData.volume24h,
        marketCap: marketData.marketCap,
        candles: ohlcData.candles,
        indicators: ohlcData.indicators,
      };
    } else {
      // Fetch from Alpha Vantage
      const [marketData, ohlcData] = await Promise.all([
        getTraditionalMarketData(symbol).catch(() => ({
          currentPrice: 0,
          priceChange24h: 0,
          priceChangePercent24h: 0,
          high24h: 0,
          low24h: 0,
          volume24h: 0,
        })),
        getTraditionalOHLC(symbol, timeframe),
      ]);

      // If Alpha Vantage quote failed, use last candle data
      const lastCandle = ohlcData.candles[ohlcData.candles.length - 1];
      const prevCandle = ohlcData.candles[ohlcData.candles.length - 2];

      response = {
        symbol,
        name: asset.name,
        type: asset.type,
        currentPrice: marketData.currentPrice || lastCandle?.close || 0,
        priceChange24h: marketData.priceChange24h || (lastCandle && prevCandle ? lastCandle.close - prevCandle.close : 0),
        priceChangePercent24h: marketData.priceChangePercent24h || (lastCandle && prevCandle ? ((lastCandle.close - prevCandle.close) / prevCandle.close) * 100 : 0),
        high24h: marketData.high24h || lastCandle?.high || 0,
        low24h: marketData.low24h || lastCandle?.low || 0,
        volume24h: marketData.volume24h || lastCandle?.volume || 0,
        candles: ohlcData.candles,
        indicators: ohlcData.indicators,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Market API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
