// ═══════════════════════════════════════════
// FinalQuant — Landing Page (Redirect)
// ═══════════════════════════════════════════

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowRight, BarChart3, Brain, Shield } from 'lucide-react';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background gradient orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
        style={{ background: 'var(--cyan)' }}
      />

      <main className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 animate-fade-in-up">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              boxShadow: '0 8px 32px rgba(108, 92, 231, 0.3)',
            }}
          >
            <Zap size={28} color="#fff" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl font-bold tracking-tight mb-3 animate-fade-in-up"
          style={{ color: 'var(--fg)', animationDelay: '100ms' }}
        >
          Final<span style={{ color: 'var(--accent)' }}>Quant</span>
        </h1>

        <p
          className="text-lg mb-2 animate-fade-in-up"
          style={{ color: 'var(--fg-muted)', animationDelay: '200ms' }}
        >
          AI-Driven Financial Analysis
        </p>

        <p
          className="text-sm mb-10 max-w-md mx-auto animate-fade-in-up"
          style={{ color: 'var(--fg-dim)', animationDelay: '300ms' }}
        >
          Professional-grade quantitative analysis powered by Gemini AI.
          Real-time charts, technical indicators, and actionable insights
          for crypto, commodities, and markets.
        </p>

        {/* Features */}
        <div
          className="grid grid-cols-3 gap-4 mb-10 animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <FeatureCard
            icon={<BarChart3 size={20} style={{ color: 'var(--green)' }} />}
            title="Live Charts"
            desc="TradingView-powered candles"
          />
          <FeatureCard
            icon={<Brain size={20} style={{ color: 'var(--accent)' }} />}
            title="AI Analysis"
            desc="Gemini quantitative engine"
          />
          <FeatureCard
            icon={<Shield size={20} style={{ color: 'var(--cyan)' }} />}
            title="Risk Scoring"
            desc="Real-time risk assessment"
          />
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:gap-3"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(108, 92, 231, 0.3)',
            }}
          >
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>

        <p className="mt-6 text-xs" style={{ color: 'var(--fg-dim)' }}>
          Built for quant engineers · No fluff, just data
        </p>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div
      className="p-4 rounded-lg text-center"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--fg)' }}>{title}</div>
      <div className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>{desc}</div>
    </div>
  );
}
