// ═══════════════════════════════════════════
// DataQuantAI — Confirm Dialog Component
// ═══════════════════════════════════════════

'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Yes, delete',
  cancelLabel = 'No, cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  // Focus trap
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-sm mx-4 rounded-2xl p-5 animate-fade-in-up outline-none"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--red-dim)' }}
            >
              <AlertTriangle size={18} style={{ color: 'var(--red)' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg transition-all hover:bg-[var(--bg-hover)]"
          >
            <X size={14} style={{ color: 'var(--fg-dim)' }} />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs leading-relaxed mb-5 pl-[46px]" style={{ color: 'var(--fg-muted)' }}>
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--red)', color: '#fff' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
