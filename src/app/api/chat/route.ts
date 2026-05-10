// ═══════════════════════════════════════════
// DataQuantAI — AI Chat API Route
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const CHAT_SYSTEM_PROMPT = `You are DataQuantAI, an elite quantitative financial analyst and trading assistant.
You help traders and quant engineers understand markets, interpret technical indicators, and make data-driven decisions.

Guidelines:
- Be concise but thorough — no fluff, no filler
- Use markdown formatting for structure (bold, bullets, code for numbers)
- When given market context, reference it in your answers
- Never fabricate specific price numbers not provided in context
- You can discuss trading strategies, risk management, indicators, and market theory
- Keep responses focused and actionable`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { messages, context } = body as {
      messages: Array<{ role: 'user' | 'model'; content: string }>;
      context?: { symbol: string; price?: number; change?: number; sentiment?: string };
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

    // Build context prefix for system
    let systemWithContext = CHAT_SYSTEM_PROMPT;
    if (context?.symbol) {
      systemWithContext += `\n\nCurrent market context being viewed:\n- Asset: ${context.symbol}`;
      if (context.price) systemWithContext += `\n- Current Price: $${context.price.toLocaleString()}`;
      if (context.change !== undefined) systemWithContext += `\n- 24h Change: ${context.change.toFixed(2)}%`;
      if (context.sentiment) systemWithContext += `\n- AI Sentiment: ${context.sentiment}`;
    }

    // Convert messages to Gemini format (all but last)
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history,
      systemInstruction: { role: 'system', parts: [{ text: systemWithContext }] },
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('[Chat API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    );
  }
}
