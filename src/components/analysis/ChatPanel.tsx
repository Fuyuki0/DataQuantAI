// ═══════════════════════════════════════════
// DataQuantAI — AI Chat Panel Component
// ═══════════════════════════════════════════

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { AnalysisResponse } from '@/types';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface ChatPanelProps {
  analysis: AnalysisResponse | null;
  selectedSymbol: string | null;
}

const CHAT_PREFIX = 'dataquantai_chat_';
const MAX_STORED = 100;

function chatKey(userId: string | undefined, symbol: string | null) {
  if (!userId || !symbol) return null;
  return `${CHAT_PREFIX}${userId}_${symbol}`;
}

function loadMessages(key: string | null): ChatMessage[] {
  if (!key || typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(key: string | null, msgs: ChatMessage[]) {
  if (!key || typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(msgs.slice(-MAX_STORED)));
  } catch {}
}

export function ChatPanel({ analysis, selectedSymbol }: ChatPanelProps) {
  const { user: clerkUser } = useUser();
  const storageKey = chatKey(clerkUser?.id, selectedSymbol);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Track mount status for safe state updates
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Abort any in-flight request on unmount
      abortRef.current?.abort();
    };
  }, []);

  // Load persisted chat when key changes (user or symbol)
  useEffect(() => {
    const loaded = loadMessages(storageKey);
    setMessages(loaded);
    // Detect if last message is from user with no AI reply
    if (loaded.length > 0 && loaded[loaded.length - 1].role === 'user') {
      setHasPending(true);
    } else {
      setHasPending(false);
    }
  }, [storageKey]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const context = analysis
    ? {
        symbol: analysis.symbol,
        price: analysis.fixedData.price,
        change: analysis.fixedData.changePercent24h,
        sentiment: analysis.dynamicData.sentiment,
      }
    : selectedSymbol
    ? { symbol: selectedSymbol }
    : undefined;

  // Core send — works for both new messages and retries
  const doSend = useCallback(async (allMessages: ChatMessage[]) => {
    // Abort any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setHasPending(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Chat failed');
      }

      const data = await res.json();
      const aiMsg: ChatMessage = { role: 'model', content: data.content, timestamp: new Date().toISOString() };

      if (mountedRef.current) {
        setMessages((prev) => {
          const next = [...prev, aiMsg];
          saveMessages(storageKey, next);
          return next;
        });
      } else {
        // Component unmounted but request finished — save directly to storage so it's there when we come back
        const stored = loadMessages(storageKey);
        saveMessages(storageKey, [...stored, aiMsg]);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return; // navigated away, ignore
      const errMsg: ChatMessage = {
        role: 'model',
        content: `⚠ ${err instanceof Error ? err.message : 'Something went wrong. Please try again.'}`,
        timestamp: new Date().toISOString(),
      };
      if (mountedRef.current) {
        setMessages((prev) => {
          const next = [...prev, errMsg];
          saveMessages(storageKey, next);
          return next;
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    }
  }, [context, storageKey]);

  // Send a new user message
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveMessages(storageKey, updatedMessages);
    setInput('');

    await doSend(updatedMessages);
  }, [input, messages, isLoading, storageKey, doSend]);

  // Retry the last unanswered user message
  const retryPending = useCallback(async () => {
    if (isLoading || messages.length === 0) return;
    await doSend(messages);
  }, [messages, isLoading, doSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setHasPending(false);
    setIsLoading(false);
    saveMessages(storageKey, []);
    setShowConfirmClear(false);
  };

  const suggestedQuestions = [
    'What is the current trend?',
    'What are the key support levels?',
    'Is now a good time to enter?',
    'Explain the RSI reading',
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'var(--accent-dim)' }}
          >
            <Bot size={11} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>
            AI Chat
          </span>
          {selectedSymbol && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'var(--bg-surface)', color: 'var(--fg-muted)' }}
            >
              {selectedSymbol.toUpperCase()}
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            title="Clear chat"
            className="p-1 rounded transition-all hover:bg-[var(--bg-hover)]"
          >
            <Trash2 size={12} style={{ color: 'var(--fg-dim)' }} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'var(--accent-dim)' }}
            >
              <Bot size={22} style={{ color: 'var(--accent)', opacity: 0.7 }} />
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--fg-muted)' }}>
              Ask anything about the market
            </p>
            <p className="text-[10px] mb-4" style={{ color: 'var(--fg-dim)' }}>
              {selectedSymbol
                ? `Aware of ${selectedSymbol.toUpperCase()} context`
                : 'Select an asset for contextual answers'}
            </p>
            {/* Suggested questions */}
            <div className="w-full space-y-1.5">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all"
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--fg-muted)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--fg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--fg-muted)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'var(--accent-dim)' }}
                  >
                    <Bot size={12} style={{ color: 'var(--accent)' }} />
                  </div>
                )}
                <div
                  className="max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed overflow-x-auto"
                  style={{
                    background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-surface)',
                    color: msg.role === 'user' ? '#fff' : 'var(--fg)',
                    border: msg.role === 'model' ? '1px solid var(--border)' : 'none',
                    whiteSpace: msg.role === 'user' ? 'pre-wrap' : 'normal',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.role === 'model' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold" style={{ color: 'var(--fg)' }} {...props} />,
                        h3: ({ node, ...props }) => <h3 className="font-bold text-sm mb-2 mt-3 first:mt-0" style={{ color: 'var(--fg)' }} {...props} />,
                        h2: ({ node, ...props }) => <h2 className="font-bold text-sm mb-2 mt-3 first:mt-0" style={{ color: 'var(--fg)' }} {...props} />,
                        h4: ({ node, ...props }) => <h4 className="font-bold mb-1 mt-2" style={{ color: 'var(--fg)' }} {...props} />,
                        a: ({ node, ...props }) => <a className="hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer" {...props} />,
                        code: ({ node, inline, ...props }: any) => 
                          inline 
                            ? <code className="px-1 py-0.5 rounded text-[11px] font-mono" style={{ background: 'var(--bg-elevated)' }} {...props} />
                            : <code className="block p-2 rounded-lg text-[11px] font-mono overflow-x-auto mb-2" style={{ background: 'var(--bg-elevated)' }} {...props} />,
                        blockquote: ({ node, ...props }) => <blockquote className="border-l-2 pl-2 italic my-2" style={{ borderColor: 'var(--accent)', color: 'var(--fg-muted)' }} {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === 'user' && (
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                  >
                    <User size={12} style={{ color: 'var(--fg-muted)' }} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start animate-fade-in">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--accent-dim)' }}
                >
                  <Bot size={12} style={{ color: 'var(--accent)' }} />
                </div>
                <div
                  className="px-3 py-2 rounded-xl flex items-center gap-1.5"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  <Loader2 size={11} className="animate-spin" style={{ color: 'var(--accent)' }} />
                  <span className="text-xs" style={{ color: 'var(--fg-dim)' }}>
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            {/* Retry indicator — shown when last msg is user with no AI reply (navigated away mid-response) */}
            {hasPending && !isLoading && (
              <div className="flex gap-2 justify-start animate-fade-in">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--accent-dim)' }}
                >
                  <Bot size={12} style={{ color: 'var(--accent)' }} />
                </div>
                <button
                  onClick={retryPending}
                  className="px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all hover:opacity-80"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent)', cursor: 'pointer' }}
                >
                  <RefreshCw size={11} style={{ color: 'var(--accent)' }} />
                  <span className="text-xs" style={{ color: 'var(--accent)' }}>
                    Response interrupted — tap to retry
                  </span>
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div
          className="flex items-end gap-2 rounded-xl px-3 py-2 transition-colors"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this market..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-xs"
            style={{
              color: 'var(--fg)',
              caretColor: 'var(--accent)',
              maxHeight: '80px',
              lineHeight: '1.5',
              paddingTop: '5px',
              paddingBottom: '5px',
              outline: 'none',
              boxShadow: 'none',
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 80) + 'px';
            }}
          />
          <button
            id="chat-send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)' }}
          >
            <Send size={12} color="#fff" />
          </button>
        </div>
        <p className="text-[9px] text-center mt-1.5" style={{ color: 'var(--fg-dim)' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <ConfirmDialog
        open={showConfirmClear}
        title="Clear chat?"
        message="All messages in this conversation will be permanently deleted."
        confirmLabel="Yes, clear"
        cancelLabel="No, keep"
        onConfirm={clearChat}
        onCancel={() => setShowConfirmClear(false)}
      />
    </div>
  );
}
