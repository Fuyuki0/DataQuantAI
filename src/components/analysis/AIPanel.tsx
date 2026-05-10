// ═══════════════════════════════════════════
// DataQuantAI — AI Analysis Panel (Analysis + Chat tabs)
// ═══════════════════════════════════════════

'use client';

import { useState } from 'react';
import { FixedDataDisplay } from './FixedData';
import { DynamicDataDisplay } from './DynamicData';
import { ChatPanel } from './ChatPanel';
import { Brain, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import type { AnalysisResponse, Asset } from '@/types';

interface AIPanelProps {
  analysis: AnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze: () => void;
  selectedSymbol: string | null;
  selectedAsset?: Asset;
}

type Tab = 'analysis' | 'chat';

export function AIPanel({ analysis, isLoading, error, onAnalyze, selectedSymbol }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('analysis')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === 'analysis' ? 'var(--accent-dim)' : 'transparent',
              color: activeTab === 'analysis' ? 'var(--accent)' : 'var(--fg-dim)',
            }}
          >
            <Brain size={12} />
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === 'chat' ? 'var(--accent-dim)' : 'transparent',
              color: activeTab === 'chat' ? 'var(--accent)' : 'var(--fg-dim)',
            }}
          >
            <MessageSquare size={12} />
            Chat
          </button>
        </div>

        {/* Run Analysis button — only visible on analysis tab */}
        {activeTab === 'analysis' && (
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
              <><Loader2 size={12} className="animate-spin" />Analyzing...</>
            ) : (
              <><Sparkles size={12} />Run Analysis</>
            )}
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'analysis' ? (
          <div className="h-full overflow-y-auto p-4">
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
        ) : (
          <ChatPanel analysis={analysis} selectedSymbol={selectedSymbol} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-dim)' }}>
        <Brain size={28} style={{ color: 'var(--accent)', opacity: 0.6 }} />
      </div>
      <p className="text-sm mb-1" style={{ color: 'var(--fg-muted)' }}>{message}</p>
      <p className="text-xs" style={{ color: 'var(--fg-dim)' }}>Powered by Gemini Flash</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--red-dim)' }}>
        <span className="text-2xl">⚠</span>
      </div>
      <p className="text-sm mb-2" style={{ color: 'var(--red)' }}>Analysis Failed</p>
      <p className="text-xs mb-4" style={{ color: 'var(--fg-dim)' }}>{message}</p>
      <button onClick={onRetry} className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all"
        style={{ background: 'var(--bg-surface)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
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
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-8 w-full" />)}
      </div>
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-20 w-full" />
    </div>
  );
}
