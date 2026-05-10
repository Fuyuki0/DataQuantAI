// ═══════════════════════════════════════════
// FinalQuant — AI Analysis Panel (Right Side)
// ═══════════════════════════════════════════

'use client';

import { FixedDataDisplay } from './FixedData';
import { DynamicDataDisplay } from './DynamicData';
import type { AnalysisResponse } from '@/types';
import { Brain, Sparkles, Loader2 } from 'lucide-react';

interface AIPanelProps {
  analysis: AnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze: () => void;
  selectedSymbol: string | null;
}

export function AIPanel({ analysis, isLoading, error, onAnalyze, selectedSymbol }: AIPanelProps) {
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: 'var(--accent-dim)' }}
          >
            <Brain size={13} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>Analysis</span>
        </div>

        <button
          id="run-analysis-btn"
          onClick={onAnalyze}
          disabled={!selectedSymbol || isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isLoading ? 'var(--bg-surface)' : 'var(--accent)',
            color: isLoading ? 'var(--fg-muted)' : '#fff',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            if (!isLoading && selectedSymbol) {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(108, 92, 231, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={12} />
              Run Analysis
            </>
          )}
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedSymbol ? (
          <EmptyState message="Select an asset to begin analysis" />
        ) : error ? (
          <ErrorState message={error} onRetry={onAnalyze} />
        ) : isLoading ? (
          <LoadingState />
        ) : analysis ? (
          <div className="space-y-5 animate-fade-in">
            <FixedDataDisplay data={analysis.fixedData} symbol={analysis.symbol} />
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <DynamicDataDisplay data={analysis.dynamicData} />
            </div>
          </div>
        ) : (
          <EmptyState message="Press Run Analysis to generate AI insights" />
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--accent-dim)' }}
      >
        <Brain size={28} style={{ color: 'var(--accent)', opacity: 0.6 }} />
      </div>
      <p className="text-sm mb-1" style={{ color: 'var(--fg-muted)' }}>{message}</p>
      <p className="text-xs" style={{ color: 'var(--fg-dim)' }}>
        Powered by Gemini 2.0 Flash Lite
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--red-dim)' }}
      >
        <span className="text-2xl">⚠</span>
      </div>
      <p className="text-sm mb-2" style={{ color: 'var(--red)' }}>Analysis Failed</p>
      <p className="text-xs mb-4" style={{ color: 'var(--fg-dim)' }}>{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all"
        style={{ background: 'var(--bg-surface)', color: 'var(--fg)', border: '1px solid var(--border)' }}
      >
        Retry
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="skeleton h-16 w-full" />
      <div className="grid grid-cols-2 gap-2">
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-16 w-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-8 w-3/4" />
      </div>
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-20 w-full" />
    </div>
  );
}
