// ═══════════════════════════════════════════
// DataQuantAI — Symbol Selector
// ═══════════════════════════════════════════

'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { SUPPORTED_ASSETS, type Asset } from '@/types';

interface SymbolSelectorProps {
  selected: Asset | null;
  onSelect: (asset: Asset) => void;
}

export function SymbolSelector({ selected, onSelect }: SymbolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = SUPPORTED_ASSETS.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {
    CRYPTO: filtered.filter((a) => a.type === 'CRYPTO'),
    COMMODITY: filtered.filter((a) => a.type === 'COMMODITY'),
    INDEX: filtered.filter((a) => a.type === 'INDEX'),
    FOREX: filtered.filter((a) => a.type === 'FOREX'),
  };

  const typeLabels: Record<string, string> = {
    CRYPTO: 'Crypto',
    COMMODITY: 'Commodities',
    INDEX: 'Indices',
    FOREX: 'Forex',
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="symbol-selector"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 text-sm font-medium"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--fg)',
        }}
      >
        {selected ? (
          <>
            <span className="text-base">{selected.icon}</span>
            <span>{selected.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              {selected.type}
            </span>
          </>
        ) : (
          <span style={{ color: 'var(--fg-muted)' }}>Select asset...</span>
        )}
        <ChevronDown size={14} style={{ color: 'var(--fg-dim)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1.5 w-72 rounded-lg overflow-hidden z-50 animate-fade-in"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Search input */}
          <div className="p-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-dim)' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 rounded text-xs"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                  outline: 'none',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--fg-dim)' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Asset list */}
          <div className="max-h-72 overflow-y-auto p-1">
            {Object.entries(grouped).map(([type, assets]) => {
              if (assets.length === 0) return null;
              return (
                <div key={type}>
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-dim)' }}>
                    {typeLabels[type]}
                  </div>
                  {assets.map((asset) => (
                    <button
                      key={asset.symbol}
                      id={`asset-${asset.symbol}`}
                      onClick={() => {
                        onSelect(asset);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-all duration-150"
                      style={{
                        background: selected?.symbol === asset.symbol ? 'var(--accent-dim)' : 'transparent',
                        color: 'var(--fg)',
                      }}
                      onMouseEnter={(e) => {
                        if (selected?.symbol !== asset.symbol) {
                          e.currentTarget.style.background = 'var(--bg-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selected?.symbol !== asset.symbol) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <span className="text-base w-6 text-center">{asset.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{asset.name}</div>
                        <div className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>{asset.symbol.toUpperCase()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-6 text-xs" style={{ color: 'var(--fg-dim)' }}>
                No assets found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
