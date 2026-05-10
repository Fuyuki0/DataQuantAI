// ═══════════════════════════════════════════
// DataQuantAI — Gemini AI Analysis Engine
// ═══════════════════════════════════════════

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FixedData, DynamicData } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are DataQuantAI — an elite quantitative analyst built for professional traders and hedge fund quants.

ANALYSIS PHILOSOPHY:
- You think in probabilities, not certainties. Every call has a confidence-weighted edge.
- You cross-reference ALL available indicators. A single signal means nothing — confluence matters.
- You identify regime: trending vs ranging, volatile vs compressed. This determines strategy.
- You spot divergences (price vs RSI, price vs MACD, price vs volume) — these are your highest-conviction signals.
- You account for where price sits relative to key moving averages (SMA20/50, EMA12/26) and Bollinger Bands.

ANALYSIS REQUIREMENTS:
1. TREND ANALYSIS: State the primary trend direction (bullish/bearish/neutral) with evidence from at least 3 indicators. Identify the trend strength (strong/moderate/weak) and whether momentum is accelerating or decelerating.

2. RISK ASSESSMENT: Evaluate downside risk by examining volatility (BB width), proximity to support/resistance, and momentum exhaustion signals.

3. ENTRY/EXIT STRATEGY: Provide specific price levels with the logic behind each (e.g., "Entry at $X — this is the BB lower band which has acted as support, confluent with SMA50"). Never give levels without reasoning.

4. KEY INSIGHTS: Find the 3-4 most important signals in the data. Prioritize divergences, crossovers, and extreme readings. Be specific — say "RSI at 72.3 showing bearish divergence with price making new highs" not just "RSI is high."

5. RECOMMENDATION: Give a clear, actionable call — not wishy-washy hedging. State position (long/short/flat), conviction level, and what would invalidate this thesis.

FORMAT: Respond with ONLY valid JSON matching this schema:
{
  "trendAnalysis": "string — 3-5 sentence deep analysis of trend, momentum, and regime",
  "riskScore": number (1-10, based on volatility + proximity to extremes + divergence signals),
  "sentiment": "Bullish" | "Bearish" | "Neutral",
  "entryPoints": ["string array of 2-3 price levels with reasoning for each"],
  "exitPoints": ["string array of 2-3 take-profit / stop-loss levels with reasoning"],
  "keyInsights": ["string array of 3-4 high-signal observations with specific numbers"],
  "recommendation": "string — 2-3 sentence actionable recommendation with conviction and invalidation level",
  "confidence": number (0-100 — be honest, low confidence when signals conflict)
}`;

export async function generateAnalysis(
  symbol: string,
  timeframe: string,
  fixedData: FixedData
): Promise<DynamicData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
  });

  // Compute derived signals to feed the AI richer context
  const priceVsSma20 = fixedData.indicators.sma20
    ? ((fixedData.price - fixedData.indicators.sma20) / fixedData.indicators.sma20 * 100).toFixed(2)
    : null;
  const priceVsSma50 = fixedData.indicators.sma50
    ? ((fixedData.price - fixedData.indicators.sma50) / fixedData.indicators.sma50 * 100).toFixed(2)
    : null;
  const bbPosition = fixedData.indicators.bollingerBands
    ? ((fixedData.price - fixedData.indicators.bollingerBands.lower) /
      (fixedData.indicators.bollingerBands.upper - fixedData.indicators.bollingerBands.lower) * 100).toFixed(1)
    : null;
  const bbWidth = fixedData.indicators.bollingerBands
    ? ((fixedData.indicators.bollingerBands.upper - fixedData.indicators.bollingerBands.lower) /
      fixedData.indicators.bollingerBands.middle * 100).toFixed(2)
    : null;
  const macdCrossover = fixedData.indicators.macd
    ? (fixedData.indicators.macd.histogram > 0 ? 'BULLISH (histogram positive)' : 'BEARISH (histogram negative)')
    : null;

  const prompt = `ANALYZE: ${symbol} | Timeframe: ${timeframe} | Timestamp: ${new Date().toISOString()}

═══ PRICE ACTION ═══
Current Price: $${fixedData.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
24h Change: ${fixedData.changePercent24h >= 0 ? '+' : ''}${fixedData.changePercent24h.toFixed(2)}% ($${fixedData.change24h.toLocaleString(undefined, { maximumFractionDigits: 2 })})
24h Range: $${fixedData.low24h.toLocaleString(undefined, { maximumFractionDigits: 2 })} — $${fixedData.high24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
24h Volume: $${fixedData.volume24h.toLocaleString()}
${fixedData.marketCap ? `Market Cap: $${fixedData.marketCap.toLocaleString()}` : ''}

═══ MOMENTUM INDICATORS ═══
RSI(14): ${fixedData.indicators.rsi?.toFixed(2) ?? 'N/A'} ${fixedData.indicators.rsi ? (fixedData.indicators.rsi > 70 ? '⚠ OVERBOUGHT' : fixedData.indicators.rsi < 30 ? '⚠ OVERSOLD' : '') : ''}
MACD Line: ${fixedData.indicators.macd?.macd.toFixed(4) ?? 'N/A'}
MACD Signal: ${fixedData.indicators.macd?.signal.toFixed(4) ?? 'N/A'}
MACD Histogram: ${fixedData.indicators.macd?.histogram.toFixed(4) ?? 'N/A'} ${macdCrossover ? `→ ${macdCrossover}` : ''}

═══ TREND INDICATORS ═══
SMA(20): ${fixedData.indicators.sma20 ? `$${fixedData.indicators.sma20.toFixed(2)}` : 'N/A'} ${priceVsSma20 ? `(price ${Number(priceVsSma20) >= 0 ? 'above' : 'below'} by ${Math.abs(Number(priceVsSma20))}%)` : ''}
SMA(50): ${fixedData.indicators.sma50 ? `$${fixedData.indicators.sma50.toFixed(2)}` : 'N/A'} ${priceVsSma50 ? `(price ${Number(priceVsSma50) >= 0 ? 'above' : 'below'} by ${Math.abs(Number(priceVsSma50))}%)` : ''}
EMA(12): ${fixedData.indicators.ema12 ? `$${fixedData.indicators.ema12.toFixed(2)}` : 'N/A'}
EMA(26): ${fixedData.indicators.ema26 ? `$${fixedData.indicators.ema26.toFixed(2)}` : 'N/A'}
${fixedData.indicators.ema12 && fixedData.indicators.ema26 ? `EMA Cross: ${fixedData.indicators.ema12 > fixedData.indicators.ema26 ? 'BULLISH (EMA12 > EMA26)' : 'BEARISH (EMA12 < EMA26)'}` : ''}

═══ VOLATILITY ═══
BB Upper: ${fixedData.indicators.bollingerBands ? `$${fixedData.indicators.bollingerBands.upper.toFixed(2)}` : 'N/A'}
BB Middle: ${fixedData.indicators.bollingerBands ? `$${fixedData.indicators.bollingerBands.middle.toFixed(2)}` : 'N/A'}
BB Lower: ${fixedData.indicators.bollingerBands ? `$${fixedData.indicators.bollingerBands.lower.toFixed(2)}` : 'N/A'}
${bbPosition ? `BB Position: ${bbPosition}% (0%=lower band, 100%=upper band)` : ''}
${bbWidth ? `BB Width: ${bbWidth}% (volatility gauge)` : ''}

═══ TASK ═══
Perform deep quantitative analysis. Cross-reference ALL indicators above for confluence. Identify divergences, crossovers, and extreme readings. Produce actionable JSON output.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const response = result.response;
  const text = response.text();

  try {
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      trendAnalysis: 'Analysis generation encountered an issue. Please retry.',
      riskScore: 5,
      sentiment: 'Neutral',
      entryPoints: [],
      exitPoints: [],
      keyInsights: ['Unable to parse AI response. Raw output available in logs.'],
      recommendation: 'Retry analysis with refreshed data.',
      confidence: 0,
      generatedAt: new Date().toISOString(),
    };
  }
}
