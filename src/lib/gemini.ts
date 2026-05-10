// ═══════════════════════════════════════════
// FinalQuant — Gemini AI Client
// ═══════════════════════════════════════════

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FixedData, DynamicData } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are FinalQuant AI, an elite quantitative financial analyst. You provide precise, data-driven analysis for professional traders and quant engineers.

Your analysis must be:
- Grounded in the provided technical data (never fabricate numbers)
- Concise and actionable (no fluff, no disclaimers about "not being financial advice")
- Written for quant engineers who understand technical analysis
- Formatted as structured JSON

Always respond with ONLY valid JSON matching this exact schema:
{
  "trendAnalysis": "string - 2-3 sentence analysis of current trend direction and strength",
  "riskScore": number (1-10, where 1=very low risk, 10=extreme risk),
  "sentiment": "Bullish" | "Bearish" | "Neutral",
  "entryPoints": ["string array of 1-3 suggested entry price levels with reasoning"],
  "exitPoints": ["string array of 1-3 suggested exit/take-profit levels with reasoning"],
  "keyInsights": ["string array of 2-4 key observations from the data"],
  "recommendation": "string - 1-2 sentence actionable recommendation",
  "confidence": number (0-100, your confidence in this analysis)
}`;

export async function generateAnalysis(
  symbol: string,
  timeframe: string,
  fixedData: FixedData
): Promise<DynamicData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
  });

  const prompt = `Analyze ${symbol} on the ${timeframe} timeframe.

Current Market Data:
- Price: $${fixedData.price.toLocaleString()}
- 24h Change: ${fixedData.changePercent24h.toFixed(2)}%
- 24h High: $${fixedData.high24h.toLocaleString()}
- 24h Low: $${fixedData.low24h.toLocaleString()}
- 24h Volume: $${fixedData.volume24h.toLocaleString()}
${fixedData.marketCap ? `- Market Cap: $${fixedData.marketCap.toLocaleString()}` : ''}

Technical Indicators:
- RSI(14): ${fixedData.indicators.rsi?.toFixed(2) ?? 'N/A'}
- MACD: ${fixedData.indicators.macd ? `Line: ${fixedData.indicators.macd.macd.toFixed(4)}, Signal: ${fixedData.indicators.macd.signal.toFixed(4)}, Histogram: ${fixedData.indicators.macd.histogram.toFixed(4)}` : 'N/A'}
- SMA(20): ${fixedData.indicators.sma20 ? `$${fixedData.indicators.sma20.toFixed(2)}` : 'N/A'}
- SMA(50): ${fixedData.indicators.sma50 ? `$${fixedData.indicators.sma50.toFixed(2)}` : 'N/A'}
- EMA(12): ${fixedData.indicators.ema12 ? `$${fixedData.indicators.ema12.toFixed(2)}` : 'N/A'}
- EMA(26): ${fixedData.indicators.ema26 ? `$${fixedData.indicators.ema26.toFixed(2)}` : 'N/A'}
- Bollinger Bands: ${fixedData.indicators.bollingerBands ? `Upper: $${fixedData.indicators.bollingerBands.upper.toFixed(2)}, Middle: $${fixedData.indicators.bollingerBands.middle.toFixed(2)}, Lower: $${fixedData.indicators.bollingerBands.lower.toFixed(2)}` : 'N/A'}

Provide your quantitative analysis as JSON.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      maxOutputTokens: 1024,
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
    // Fallback if JSON parse fails
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
