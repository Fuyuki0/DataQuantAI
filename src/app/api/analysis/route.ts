// ═══════════════════════════════════════════
// FinalQuant — AI Analysis API Route
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateAnalysis } from '@/lib/gemini';
import { SUPPORTED_ASSETS } from '@/types';
import type { FixedData, Timeframe } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { symbol, timeframe } = body as { symbol: string; timeframe: Timeframe };

    if (!symbol || !timeframe) {
      return NextResponse.json(
        { error: 'Symbol and timeframe are required' },
        { status: 400 }
      );
    }

    const asset = SUPPORTED_ASSETS.find((a) => a.symbol === symbol);
    if (!asset) {
      return NextResponse.json({ error: `Unsupported symbol: ${symbol}` }, { status: 400 });
    }

    // Fetch market data first
    const marketRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/market?symbol=${symbol}&timeframe=${timeframe}`,
      {
        headers: {
          Cookie: req.headers.get('cookie') || '',
        },
      }
    );

    if (!marketRes.ok) {
      throw new Error('Failed to fetch market data for analysis');
    }

    const marketData = await marketRes.json();

    // Build fixed data
    const fixedData: FixedData = {
      price: marketData.currentPrice,
      change24h: marketData.priceChange24h,
      changePercent24h: marketData.priceChangePercent24h,
      high24h: marketData.high24h,
      low24h: marketData.low24h,
      volume24h: marketData.volume24h,
      marketCap: marketData.marketCap,
      indicators: marketData.indicators,
      timestamp: new Date().toISOString(),
    };

    // Generate AI analysis
    const dynamicData = await generateAnalysis(
      `${asset.name} (${symbol})`,
      timeframe,
      fixedData
    );

    return NextResponse.json({
      symbol,
      timeframe,
      fixedData,
      dynamicData,
    });
  } catch (error) {
    console.error('[Analysis API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis generation failed' },
      { status: 500 }
    );
  }
}
