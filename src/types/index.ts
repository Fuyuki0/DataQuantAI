// ═══════════════════════════════════════════
// FinalQuant — Type Definitions
// ═══════════════════════════════════════════

export type AssetType = 'CRYPTO' | 'COMMODITY' | 'INDEX' | 'FOREX';

export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
  icon?: string;
}

export interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataResponse {
  symbol: string;
  name: string;
  type: AssetType;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
  candles: OHLCVData[];
  indicators: TechnicalIndicators;
}

export interface TechnicalIndicators {
  rsi: number | null;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  } | null;
  sma20: number | null;
  sma50: number | null;
  ema12: number | null;
  ema26: number | null;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  } | null;
}

export interface FixedData {
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
  indicators: TechnicalIndicators;
  timestamp: string;
}

export interface DynamicData {
  trendAnalysis: string;
  riskScore: number; // 1-10
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  entryPoints: string[];
  exitPoints: string[];
  keyInsights: string[];
  recommendation: string;
  confidence: number; // 0-100
  generatedAt: string;
}

export interface AnalysisResponse {
  symbol: string;
  timeframe: string;
  fixedData: FixedData;
  dynamicData: DynamicData;
}

export type Timeframe = '1H' | '4H' | '1D' | '1W' | '1M';

export interface ChartConfig {
  symbol: string;
  timeframe: Timeframe;
  showVolume: boolean;
  showSMA: boolean;
  showEMA: boolean;
  showBollinger: boolean;
}

export const SUPPORTED_ASSETS: Asset[] = [
  // Crypto
  { symbol: 'bitcoin', name: 'Bitcoin', type: 'CRYPTO', icon: '₿' },
  { symbol: 'ethereum', name: 'Ethereum', type: 'CRYPTO', icon: 'Ξ' },
  { symbol: 'solana', name: 'Solana', type: 'CRYPTO', icon: '◎' },
  { symbol: 'binancecoin', name: 'BNB', type: 'CRYPTO', icon: '◆' },
  { symbol: 'ripple', name: 'XRP', type: 'CRYPTO', icon: '✕' },
  { symbol: 'cardano', name: 'Cardano', type: 'CRYPTO', icon: '₳' },
  { symbol: 'dogecoin', name: 'Dogecoin', type: 'CRYPTO', icon: 'Ð' },
  { symbol: 'avalanche-2', name: 'Avalanche', type: 'CRYPTO', icon: '▲' },
  { symbol: 'polkadot', name: 'Polkadot', type: 'CRYPTO', icon: '●' },
  { symbol: 'chainlink', name: 'Chainlink', type: 'CRYPTO', icon: '⬡' },
  // Commodities
  { symbol: 'XAUUSD', name: 'Gold (XAU/USD)', type: 'COMMODITY', icon: '🥇' },
  { symbol: 'XAGUSD', name: 'Silver (XAG/USD)', type: 'COMMODITY', icon: '🥈' },
  // Indices
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'INDEX', icon: '📈' },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF', type: 'INDEX', icon: '📊' },
  // Forex
  { symbol: 'EURUSD', name: 'EUR/USD', type: 'FOREX', icon: '€' },
  { symbol: 'GBPUSD', name: 'GBP/USD', type: 'FOREX', icon: '£' },
];
