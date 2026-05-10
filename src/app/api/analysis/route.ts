// ═══════════════════════════════════════════
// DataQuantAI — AI Analysis API Route
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { generateAnalysis } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { SUPPORTED_ASSETS } from '@/types';
import type { FixedData, Timeframe } from '@/types';

/**
 * Ensures a User row exists in the DB for the given Clerk user.
 * Uses email + clerkId from the Clerk session so the required email field is satisfied.
 */
async function ensureUser(clerkUserId: string) {
  // Try to find the existing user first (fast path)
  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (existing) return existing;

  // Need to create — fetch full Clerk profile for email
  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    `${clerkUserId}@dataquantai.local`; // fallback so it never fails

  return prisma.user.upsert({
    where: { clerkId: clerkUserId },
    create: {
      clerkId: clerkUserId,
      email,
      name: clerkUser?.fullName ?? undefined,
      imageUrl: clerkUser?.imageUrl ?? undefined,
    },
    update: {},
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { symbol, timeframe } = body as { symbol: string; timeframe: Timeframe };

    if (!symbol || !timeframe) {
      return NextResponse.json({ error: 'Symbol and timeframe are required' }, { status: 400 });
    }

    const asset = SUPPORTED_ASSETS.find((a) => a.symbol === symbol);
    if (!asset) {
      return NextResponse.json({ error: `Unsupported symbol: ${symbol}` }, { status: 400 });
    }

    // Fetch market data
    const marketRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/market?symbol=${symbol}&timeframe=${timeframe}`,
      { headers: { Cookie: req.headers.get('cookie') || '' } }
    );

    if (!marketRes.ok) throw new Error('Failed to fetch market data for analysis');

    const marketData = await marketRes.json();

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

    const dynamicData = await generateAnalysis(`${asset.name} (${symbol})`, timeframe, fixedData);

    // Save to history — ensure user row exists first with proper email
    try {
      const user = await ensureUser(userId);
      await prisma.analysisHistory.create({
        data: {
          userId: user.id,
          symbol,
          timeframe,
          fixedData: fixedData as object,
          dynamicData: dynamicData as object,
          aiModel: 'gemini-2.0-flash-lite',
        },
      });
      console.log(`[Analysis] Saved history for user ${user.id}, symbol: ${symbol}`);
    } catch (dbErr) {
      // Log the full error so it's visible in dev
      console.error('[Analysis] Failed to save history:', dbErr);
    }

    return NextResponse.json({ symbol, timeframe, fixedData, dynamicData });
  } catch (error) {
    console.error('[Analysis API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis generation failed' },
      { status: 500 }
    );
  }
}
