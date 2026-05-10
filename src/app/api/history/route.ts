// ═══════════════════════════════════════════
// DataQuantAI — Analysis History API Route
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

async function ensureUser(clerkUserId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    `${clerkUserId}@dataquantai.local`;

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

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const user = await ensureUser(userId);

    const items = await prisma.analysisHistory.findMany({
      where: {
        userId: user.id,
        ...(symbol ? { symbol } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[History GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const user = await ensureUser(userId);

    await prisma.analysisHistory.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[History DELETE Error]', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
