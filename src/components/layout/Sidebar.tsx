// ═══════════════════════════════════════════
// FinalQuant — Sidebar Navigation
// ═══════════════════════════════════════════

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Activity,
  History,
  Settings,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

const SECONDARY_ITEMS = [
  { href: '/dashboard/history', icon: History, label: 'History', disabled: true },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-14 flex flex-col items-center py-3 flex-shrink-0"
      style={{
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="mb-6 group">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)',
          }}
        >
          <Zap size={16} color="#fff" strokeWidth={2.5} />
        </div>
      </Link>

      {/* Primary nav */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--fg-dim)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--fg-muted)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--fg-dim)';
                }
              }}
            >
              <Icon size={18} />
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </Link>
          );
        })}

        <div className="w-5 my-2" style={{ borderTop: '1px solid var(--border)' }} />

        {SECONDARY_ITEMS.map(({ href, icon: Icon, label, disabled }) => (
          <button
            key={href}
            title={`${label} (Coming soon)`}
            disabled={disabled}
            className="w-9 h-9 rounded-lg flex items-center justify-center opacity-30 cursor-not-allowed"
            style={{ color: 'var(--fg-dim)' }}
          >
            <Icon size={18} />
          </button>
        ))}
      </nav>

      {/* Live indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-center" title="Data feed active">
          <Activity size={14} style={{ color: 'var(--green)' }} className="animate-pulse" />
        </div>
      </div>

      {/* User avatar */}
      <div className="flex items-center justify-center">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-7 h-7',
            },
          }}
        />
      </div>
    </aside>
  );
}
