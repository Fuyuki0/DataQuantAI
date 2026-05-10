'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  History, Search, Trash2, TrendingUp, TrendingDown, Minus,
  ChevronDown, ChevronUp, RefreshCw, Brain, MessageSquare, Bot, User,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { FixedData, DynamicData } from '@/types';

// ── Analysis history (from DB via API) ─────────────────────────────
interface AnalysisItem {
  id: string;
  symbol: string;
  timeframe: string;
  fixedData: FixedData;
  dynamicData: DynamicData;
  aiModel: string;
  createdAt: string;
}

// ── Chat history (from localStorage) ───────────────────────────────
interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
interface ChatSession {
  symbol: string;
  messages: ChatMessage[];
}

const CHAT_PREFIX = 'dataquantai_chat_';

function loadChatSessionsForUser(userId: string | undefined): ChatSession[] {
  if (!userId || typeof window === 'undefined') return [];
  const sessions: ChatSession[] = [];
  const prefix = `${CHAT_PREFIX}${userId}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      const symbol = key.replace(prefix, '');
      try {
        const raw = localStorage.getItem(key);
        const messages: ChatMessage[] = raw ? JSON.parse(raw) : [];
        if (messages.length > 0) sessions.push({ symbol, messages });
      } catch {}
    }
  }
  return sessions.sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1]?.timestamp ?? '';
    const bLast = b.messages[b.messages.length - 1]?.timestamp ?? '';
    return bLast.localeCompare(aLast);
  });
}

type Tab = 'analysis' | 'chat';

export default function HistoryPage() {
  const { user: clerkUser } = useUser();
  const [tab, setTab] = useState<Tab>('analysis');

  // Analysis state
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  // Shared
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ type: 'analysis' | 'chat'; id: string } | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setIsLoadingAnalysis(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, []);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);
  useEffect(() => {
    setChatSessions(loadChatSessionsForUser(clerkUser?.id));
  }, [clerkUser?.id]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'analysis') {
      await fetch(`/api/history?id=${pendingDelete.id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i.id !== pendingDelete.id));
    } else {
      if (clerkUser?.id) {
        localStorage.removeItem(`${CHAT_PREFIX}${clerkUser.id}_${pendingDelete.id}`);
        setChatSessions((prev) => prev.filter((s) => s.symbol !== pendingDelete.id));
      }
    }
    setPendingDelete(null);
  };

  const sentimentColor = (s: string) =>
    s === 'Bullish' ? 'var(--green)' : s === 'Bearish' ? 'var(--red)' : 'var(--fg-muted)';

  const SentimentIcon = ({ s }: { s: string }) => {
    if (s === 'Bullish') return <TrendingUp size={12} style={{ color: 'var(--green)' }} />;
    if (s === 'Bearish') return <TrendingDown size={12} style={{ color: 'var(--red)' }} />;
    return <Minus size={12} style={{ color: 'var(--fg-muted)' }} />;
  };

  const filteredAnalysis = items.filter((i) =>
    i.symbol.toLowerCase().includes(search.toLowerCase())
  );
  const filteredChat = chatSessions.filter((s) =>
    s.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
            <History size={15} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>History</h1>
            <p className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>
              {tab === 'analysis' ? `${items.length} saved analyses` : `${chatSessions.length} chat sessions`}
            </p>
          </div>
        </div>
        {tab === 'analysis' && (
          <button onClick={fetchAnalysis} className="p-1.5 rounded-lg transition-all hover:bg-[var(--bg-hover)]" title="Refresh">
            <RefreshCw size={13} style={{ color: 'var(--fg-dim)' }} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-3 pb-0 flex-shrink-0">
        <button
          onClick={() => setTab('analysis')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: tab === 'analysis' ? 'var(--accent-dim)' : 'transparent',
            color: tab === 'analysis' ? 'var(--accent)' : 'var(--fg-dim)',
          }}
        >
          <Brain size={12} /> Analysis
        </button>
        <button
          onClick={() => setTab('chat')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: tab === 'chat' ? 'var(--accent-dim)' : 'transparent',
            color: tab === 'chat' ? 'var(--accent)' : 'var(--fg-dim)',
          }}
        >
          <MessageSquare size={12} /> Chat
        </button>
      </div>

      <div className="px-6 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <Search size={13} style={{ color: 'var(--fg-dim)' }} />
          <input id="history-search" type="text" placeholder="Filter by symbol..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs"
            style={{ color: 'var(--fg)', outline: 'none', boxShadow: 'none' }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
        {/* ── ANALYSIS TAB ── */}
        {tab === 'analysis' && (
          isLoadingAnalysis ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)
          ) : filteredAnalysis.length === 0 ? (
            <EmptyState icon={<Brain size={24} style={{ color: 'var(--fg-dim)' }} />}
              message={search ? 'No results found' : 'No analysis history yet'}
              sub="Run an analysis from the dashboard to see it here" />
          ) : (
            filteredAnalysis.map((item) => {
              const isExpanded = expandedId === item.id;
              const { dynamicData: dyn, fixedData: fix } = item;
              return (
                <div key={item.id} className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-all"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                      {item.symbol.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-mono" style={{ color: 'var(--fg)' }}>{item.symbol.toUpperCase()}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                          style={{ background: 'var(--bg-surface)', color: 'var(--fg-muted)' }}>{item.timeframe}</span>
                        <div className="flex items-center gap-1">
                          <SentimentIcon s={dyn.sentiment} />
                          <span className="text-[10px]" style={{ color: sentimentColor(dyn.sentiment) }}>{dyn.sentiment}</span>
                        </div>
                      </div>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--fg-dim)' }}>
                        {new Date(item.createdAt).toLocaleString()} · Risk {dyn.riskScore}/10 · {dyn.confidence}% confidence
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-mono font-semibold" style={{ color: 'var(--fg)' }}>
                        ${fix.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: fix.changePercent24h >= 0 ? 'var(--green-dim)' : 'var(--red-dim)', color: fix.changePercent24h >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {fix.changePercent24h >= 0 ? '+' : ''}{fix.changePercent24h.toFixed(2)}%
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); setPendingDelete({ type: 'analysis', id: item.id }); }}
                        className="p-1 rounded transition-all hover:bg-[var(--red-dim)]">
                        <Trash2 size={11} style={{ color: 'var(--fg-dim)' }} />
                      </button>
                      {isExpanded ? <ChevronUp size={13} style={{ color: 'var(--fg-dim)' }} /> : <ChevronDown size={13} style={{ color: 'var(--fg-dim)' }} />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 space-y-3 animate-fade-in" style={{ borderTop: '1px solid var(--border)' }}>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--fg-dim)' }}>Trend Analysis</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{dyn.trendAnalysis}</p>
                      </div>
                      {dyn.keyInsights?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--fg-dim)' }}>Key Insights</p>
                          <ul className="space-y-1">
                            {dyn.keyInsights.map((ins, idx) => (
                              <li key={idx} className="flex gap-2 text-xs" style={{ color: 'var(--fg-muted)' }}>
                                <span style={{ color: 'var(--accent)' }}>›</span><span>{ins}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="px-3 py-2 rounded-lg text-xs"
                        style={{ background: 'var(--accent-dim)', borderLeft: '2px solid var(--accent)', color: 'var(--fg)' }}>
                        {dyn.recommendation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        )}

        {/* ── CHAT TAB ── */}
        {tab === 'chat' && (
          filteredChat.length === 0 ? (
            <EmptyState icon={<MessageSquare size={24} style={{ color: 'var(--fg-dim)' }} />}
              message={search ? 'No results found' : 'No chat history yet'}
              sub="Start chatting with the AI on the dashboard to see conversations here" />
          ) : (
            filteredChat.map((session) => {
              const isExpanded = expandedSymbol === session.symbol;
              const lastMsg = session.messages[session.messages.length - 1];
              return (
                <div key={session.symbol} className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-all"
                    onClick={() => setExpandedSymbol(isExpanded ? null : session.symbol)}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold"
                      style={{ background: 'var(--bg-surface)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
                      <Bot size={16} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-mono" style={{ color: 'var(--fg)' }}>{session.symbol.toUpperCase()}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--bg-surface)', color: 'var(--fg-muted)' }}>
                          {session.messages.length} messages
                        </span>
                      </div>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--fg-dim)' }}>
                        {lastMsg ? `${new Date(lastMsg.timestamp).toLocaleString()} · Last: "${lastMsg.content.slice(0, 40)}${lastMsg.content.length > 40 ? '…' : ''}"` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setPendingDelete({ type: 'chat', id: session.symbol }); }}
                        className="p-1 rounded transition-all hover:bg-[var(--red-dim)]">
                        <Trash2 size={11} style={{ color: 'var(--fg-dim)' }} />
                      </button>
                      {isExpanded ? <ChevronUp size={13} style={{ color: 'var(--fg-dim)' }} /> : <ChevronDown size={13} style={{ color: 'var(--fg-dim)' }} />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-3 pt-2 space-y-2 max-h-80 overflow-y-auto animate-fade-in"
                      style={{ borderTop: '1px solid var(--border)' }}>
                      {session.messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role === 'model' && (
                            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                              style={{ background: 'var(--accent-dim)' }}>
                              <Bot size={10} style={{ color: 'var(--accent)' }} />
                            </div>
                          )}
                          <div className="max-w-[80%] px-2.5 py-1.5 rounded-xl text-[11px] leading-relaxed"
                            style={{
                              background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-surface)',
                              color: msg.role === 'user' ? '#fff' : 'var(--fg)',
                              border: msg.role === 'model' ? '1px solid var(--border)' : 'none',
                              wordBreak: 'break-word',
                            }}>
                            {msg.role === 'model' ? (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0" {...props} />,
                                  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5" {...props} />,
                                  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5" {...props} />,
                                  li: ({ node, ...props }) => <li className="leading-snug" {...props} />,
                                  strong: ({ node, ...props }) => <strong className="font-bold" style={{ color: 'var(--fg)' }} {...props} />,
                                  h3: ({ node, ...props }) => <h3 className="text-xs font-bold mt-2 mb-1" style={{ color: 'var(--fg)' }} {...props} />,
                                  a: ({ node, ...props }) => <a className="hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer" {...props} />,
                                  code: ({ node, inline, ...props }: any) =>
                                    inline
                                      ? <code className="px-1 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--bg-elevated)' }} {...props} />
                                      : <code className="block p-2 rounded-lg text-[10px] font-mono overflow-x-auto mb-1" style={{ background: 'var(--bg-elevated)' }} {...props} />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            ) : (
                              msg.content
                            )}
                          </div>
                          {msg.role === 'user' && (
                            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                              <User size={10} style={{ color: 'var(--fg-muted)' }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={pendingDelete?.type === 'analysis' ? 'Delete analysis?' : 'Delete chat?'}
        message={pendingDelete?.type === 'analysis'
          ? 'This analysis record will be permanently removed from your history.'
          : `All chat messages for ${pendingDelete?.id?.toUpperCase()} will be permanently deleted.`
        }
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {icon}
      </div>
      <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{message}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>{sub}</p>
    </div>
  );
}
