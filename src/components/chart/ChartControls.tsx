// ═══════════════════════════════════════════
// DataQuantAI — Chart Controls
// ═══════════════════════════════════════════

'use client';

import type { Timeframe } from '@/types';

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1H', label: '1H' },
  { value: '4H', label: '4H' },
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
];

interface ChartControlsProps {
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}

export function ChartControls({ timeframe, onTimeframeChange }: ChartControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          id={`timeframe-${tf.value}`}
          onClick={() => onTimeframeChange(tf.value)}
          className="px-2.5 py-1 text-xs font-medium rounded transition-all duration-200"
          style={{
            background: timeframe === tf.value ? 'var(--accent-dim)' : 'transparent',
            color: timeframe === tf.value ? 'var(--accent)' : 'var(--fg-muted)',
            border: timeframe === tf.value ? '1px solid rgba(108, 92, 231, 0.3)' : '1px solid transparent',
          }}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
