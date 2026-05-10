// ═══════════════════════════════════════════
// DataQuantAI — Landing Page
// ═══════════════════════════════════════════

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Zap, ArrowRight, BarChart3, Brain, Shield,
  TrendingUp, TrendingDown, Activity, MessageSquare,
  History, Settings2, ChevronRight,
} from 'lucide-react';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  const stats = [
    { label: 'Assets Tracked', value: '16+', trend: null },
    { label: 'AI Model', value: 'Gemini', trend: null },
    { label: 'Indicators', value: '7', trend: null },
    { label: 'Latency', value: '<2s', trend: null },
  ];

  const features = [
    {
      icon: <BarChart3 size={22} style={{ color: 'var(--accent)' }} />,
      title: 'Live TradingView Charts',
      desc: 'Candlestick charts powered by Lightweight Charts v5. Full OHLCV data with Bollinger Bands, RSI, MACD, SMA & EMA overlays.',
    },
    {
      icon: <Brain size={22} style={{ color: 'var(--cyan)' }} />,
      title: 'Gemini AI Analysis',
      desc: 'Every analysis runs through Gemini Flash — extracting trend signals, entry/exit points, risk scores, and confidence-rated insights.',
    },
    {
      icon: <MessageSquare size={22} style={{ color: 'var(--green)' }} />,
      title: 'AI Chat Assistant',
      desc: 'Ask anything in natural language. The AI stays aware of your current asset, price, and analysis context for relevant answers.',
    },
    {
      icon: <Shield size={22} style={{ color: 'var(--amber)' }} />,
      title: 'Risk Scoring',
      desc: 'Every analysis includes a 1–10 risk score and 0–100 confidence rating so you understand exactly how strong the signal is.',
    },
    {
      icon: <History size={22} style={{ color: 'var(--red)' }} />,
      title: 'Analysis History',
      desc: 'Every AI analysis is automatically saved. Browse, search, and expand past analyses with full trend data and recommendations.',
    },
    {
      icon: <Settings2 size={22} style={{ color: 'var(--fg-muted)' }} />,
      title: 'Configurable Defaults',
      desc: 'Set your default asset, timeframe, AI style, and chart preferences. All settings auto-save to your browser instantly.',
    },
  ];

  const mockCandles = [
    { h: 40, bear: false }, { h: 55, bear: true }, { h: 35, bear: false },
    { h: 65, bear: false }, { h: 45, bear: true }, { h: 70, bear: false },
    { h: 50, bear: true }, { h: 80, bear: false }, { h: 60, bear: false },
    { h: 90, bear: false }, { h: 75, bear: true }, { h: 85, bear: false },
    { h: 70, bear: true }, { h: 95, bear: false }, { h: 80, bear: false },
    { h: 100, bear: false }, { h: 85, bear: true }, { h: 110, bear: false },
    { h: 95, bear: false }, { h: 120, bear: false },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.07] pointer-events-none"
        style={{ background: 'var(--accent)' }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.05] pointer-events-none"
        style={{ background: 'var(--cyan)' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), #a78bfa)', boxShadow: '0 2px 8px rgba(108,92,231,0.3)' }}>
            <Zap size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--fg)' }}>
            DataQuant<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-xs px-4 py-2 rounded-lg transition-all hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--fg-muted)' }}>
            Sign In
          </Link>
          <Link href="/sign-up"
            className="text-xs px-4 py-2 rounded-lg font-semibold transition-all"
            style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 2px 12px rgba(108,92,231,0.3)' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6 animate-fade-in"
          style={{ background: 'var(--accent-dim)', border: '1px solid rgba(108,92,231,0.3)', color: 'var(--accent)' }}>
          <Activity size={11} className="animate-pulse" />
          Powered by Gemini AI · Live market data
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-4 animate-fade-in-up" style={{ color: 'var(--fg)', animationDelay: '50ms' }}>
          Quant-Grade Analysis<br />
          <span style={{ background: 'linear-gradient(135deg, var(--accent), #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Powered by AI
          </span>
        </h1>

        <p className="text-base max-w-xl mx-auto mb-8 animate-fade-in-up" style={{ color: 'var(--fg-muted)', animationDelay: '150ms' }}>
          Professional-grade technical analysis for crypto, commodities, and indices.
          Real-time charts, AI-driven insights, and a built-in trading assistant.
        </p>

        <div className="flex items-center gap-3 mb-14 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <Link href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:gap-3"
            style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }}>
            Start for Free <ArrowRight size={16} />
          </Link>
          <Link href="/sign-in" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
            Sign In <ChevronRight size={14} />
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mb-14 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold font-mono" style={{ color: 'var(--fg)' }}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--fg-dim)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart mockup */}
        <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden animate-fade-in-up"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)', animationDelay: '400ms', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          {/* Mockup top bar */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>BTC/USD</span>
              <div className="flex gap-1.5">
                {['1H','4H','1D','1W'].map((tf) => (
                  <span key={tf} className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: tf === '1D' ? 'var(--accent)' : 'var(--bg-surface)', color: tf === '1D' ? '#fff' : 'var(--fg-dim)' }}>
                    {tf}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono" style={{ color: 'var(--fg)' }}>$104,320</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>+2.41%</span>
            </div>
          </div>

          {/* Fake chart */}
          <div className="relative px-6 py-4 h-48 flex items-end gap-1.5 overflow-hidden">
            {/* Subtle grid lines */}
            {[0,1,2,3].map((i) => (
              <div key={i} className="absolute left-0 right-0" style={{ bottom: `${(i+1)*25}%`, borderTop: '1px solid var(--border)', opacity: 0.5 }} />
            ))}
            {/* Candles */}
            {mockCandles.map((c, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 relative" style={{ height: '100%' }}>
                <div className="w-0.5 absolute" style={{
                  height: `${c.h * 0.3}%`,
                  background: c.bear ? 'var(--red)' : 'var(--green)',
                  bottom: `${c.h}%`,
                  opacity: 0.6,
                }} />
                <div className="w-full rounded-sm" style={{
                  height: `${c.h * 0.5}%`,
                  background: c.bear ? 'var(--red)' : 'var(--green)',
                  opacity: 0.85,
                  minHeight: '4px',
                }} />
              </div>
            ))}
          </div>

          {/* Bottom bar split: chart left | AI panel right */}
          <div className="flex" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex-1 px-4 py-3 flex items-center gap-4">
              {[['RSI(14)','67.4','var(--amber)'],['MACD','▲ Bullish','var(--green)'],['BB Width','2.4%','var(--fg-muted)']].map(([l,v,c]) => (
                <div key={l}>
                  <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--fg-dim)' }}>{l}</div>
                  <div className="text-xs font-mono font-semibold" style={{ color: c as string }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="w-px" style={{ background: 'var(--border)' }} />
            <div className="w-64 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
                  <Brain size={9} style={{ color: 'var(--accent)' }} />
                </div>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--fg)' }}>AI Analysis</span>
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>Bullish</span>
              </div>
              <div className="text-[10px] leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                Strong uptrend with RSI at 67 — not yet overbought. MACD bullish crossover confirmed.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features grid */}
      <section className="relative z-10 px-8 py-16 max-w-5xl mx-auto w-full">
        <h2 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--fg)' }}>
          Everything a quant needs
        </h2>
        <p className="text-sm text-center mb-10" style={{ color: 'var(--fg-muted)' }}>
          No noise. Just data, analysis, and actionable signals.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="p-5 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'var(--bg-surface)' }}>
                {f.icon}
              </div>
              <div className="text-sm font-semibold mb-1.5" style={{ color: 'var(--fg)' }}>{f.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--fg-dim)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Supported assets strip */}
      <section className="relative z-10 px-8 pb-12 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl px-8 py-6 flex items-center justify-between gap-6 flex-wrap"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--fg)' }}>Supported Markets</p>
            <p className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>Crypto · Commodities · Indices · Forex</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {['₿ BTC','Ξ ETH','◎ SOL','🥇 XAU','📈 SPY','📊 QQQ','€ EUR/USD'].map((a) => (
              <span key={a} className="text-xs px-2.5 py-1 rounded-lg font-mono"
                style={{ background: 'var(--bg-surface)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="relative z-10 px-8 pb-16 max-w-5xl mx-auto w-full text-center">
        <div className="rounded-2xl p-12"
          style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(167,139,250,0.08))', border: '1px solid rgba(108,92,231,0.3)' }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--fg)' }}>
            Ready to trade smarter?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
            Sign up free and start your first AI-powered analysis in under a minute.
          </p>
          <Link href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:gap-3"
            style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 4px 24px rgba(108,92,231,0.4)' }}>
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-[10px]" style={{ color: 'var(--fg-dim)' }}>
        DataQuantAI · Built for quant engineers · No fluff, just data
      </footer>
    </div>
  );
}
