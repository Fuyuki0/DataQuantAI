// ═══════════════════════════════════════════
// DataQuantAI — Clerk Webhook Handler
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Clerk webhook to sync user creation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'user.created') {
      await prisma.user.create({
        data: {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
          imageUrl: data.image_url || null,
        },
      });
    }

    if (type === 'user.updated') {
      await prisma.user.upsert({
        where: { clerkId: data.id },
        update: {
          email: data.email_addresses?.[0]?.email_address || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
          imageUrl: data.image_url || null,
        },
        create: {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
          imageUrl: data.image_url || null,
        },
      });
    }

    if (type === 'user.deleted') {
      await prisma.user.deleteMany({
        where: { clerkId: data.id },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Clerk Webhook Error]', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
