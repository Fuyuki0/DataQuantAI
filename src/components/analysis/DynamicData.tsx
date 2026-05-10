// ═══════════════════════════════════════════
// FinalQuant — Dynamic Data Display
// AI-powered analysis from Gemini
// ═══════════════════════════════════════════

'use client';

import type { DynamicData } from '@/types';
import { timeAgo } from '@/lib/utils';
import {
  Brain,
  Shield,
  ArrowUpCircle,
  ArrowDownCircle,
  Lightbulb,
  Target,
  Gauge,
} from 'lucide-react';

interface DynamicDataProps {
  data: DynamicData;
}

export function DynamicDataDisplay({ data }: DynamicDataProps) {
  const sentimentConfig = {
    Bullish: { color: 'var(--green)', bg: 'var(--green-dim)', icon: ArrowUpCircle },
    Bearish: { color: 'var(--red)', bg: 'var(--red-dim)', icon: ArrowDownCircle },
    Neutral: { color: 'var(--amber)', bg: 'var(--amber-dim)', icon: Target },
  };

  const sentiment = sentimentConfig[data.sentiment] || sentimentConfig.Neutral;
  const SentimentIcon = sentiment.icon;

  return (
    <div className="stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain size={14} style={{ color: 'var(--accent)' }} />
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-dim)' }}>
            AI Analysis
          </span>
        </div>
        <span className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>
          {timeAgo(data.generatedAt)}
        </span>
      </div>

      {/* Sentiment & Confidence row */}
      <div className="flex gap-2 mb-3">
        <div
          className="flex-1 flex items-center gap-2 p-2.5 rounded-md"
          style={{ background: sentiment.bg, border: `1px solid ${sentiment.color}22` }}
        >
          <SentimentIcon size={16} style={{ color: sentiment.color }} />
          <div>
            <div className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>Sentiment</div>
            <div className="text-sm font-bold" style={{ color: sentiment.color }}>{data.sentiment}</div>
          </div>
        </div>

        <div
          className="flex-1 flex items-center gap-2 p-2.5 rounded-md"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <Gauge size={16} style={{ color: 'var(--accent)' }} />
          <div>
            <div className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>Confidence</div>
            <div className="text-sm font-bold" style={{ color: 'var(--fg)' }}>{data.confidence}%</div>
          </div>
        </div>

        <div
          className="flex-1 flex items-center gap-2 p-2.5 rounded-md"
          style={{
            background: getRiskBg(data.riskScore),
            border: `1px solid ${getRiskColor(data.riskScore)}22`,
          }}
        >
          <Shield size={16} style={{ color: getRiskColor(data.riskScore) }} />
          <div>
            <div className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>Risk</div>
            <div className="text-sm font-bold" style={{ color: getRiskColor(data.riskScore) }}>{data.riskScore}/10</div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <AnalysisSection
        icon={<Target size={13} style={{ color: 'var(--cyan)' }} />}
        title="Trend Analysis"
      >
        <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          {data.trendAnalysis}
        </p>
      </AnalysisSection>

      {/* Entry / Exit points */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-md" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowUpCircle size={11} style={{ color: 'var(--green)' }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-dim)' }}>Entry Points</span>
          </div>
          <ul className="space-y-1">
            {data.entryPoints.map((point, i) => (
              <li key={i} className="text-[11px] leading-snug" style={{ color: 'var(--fg-muted)' }}>
                <span style={{ color: 'var(--green)' }}>›</span> {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-2.5 rounded-md" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowDownCircle size={11} style={{ color: 'var(--red)' }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-dim)' }}>Exit Points</span>
          </div>
          <ul className="space-y-1">
            {data.exitPoints.map((point, i) => (
              <li key={i} className="text-[11px] leading-snug" style={{ color: 'var(--fg-muted)' }}>
                <span style={{ color: 'var(--red)' }}>›</span> {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key Insights */}
      <AnalysisSection
        icon={<Lightbulb size={13} style={{ color: 'var(--amber)' }} />}
        title="Key Insights"
      >
        <ul className="space-y-1.5">
          {data.keyInsights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--fg-muted)' }}>
              <span className="mt-0.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--amber)' }} />
              {insight}
            </li>
          ))}
        </ul>
      </AnalysisSection>

      {/* Recommendation */}
      <div
        className="p-3 rounded-md"
        style={{
          background: 'var(--accent-dim)',
          border: '1px solid rgba(108, 92, 231, 0.2)',
        }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <Brain size={12} style={{ color: 'var(--accent)' }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            Recommendation
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--fg)' }}>
          {data.recommendation}
        </p>
      </div>
    </div>
  );
}

function AnalysisSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-dim)' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function getRiskColor(score: number): string {
  if (score <= 3) return 'var(--green)';
  if (score <= 6) return 'var(--amber)';
  return 'var(--red)';
}

function getRiskBg(score: number): string {
  if (score <= 3) return 'var(--green-dim)';
  if (score <= 6) return 'var(--amber-dim)';
  return 'var(--red-dim)';
}
