// ═══════════════════════════════════════════
// DataQuantAI — Theme Provider
// Applies the user's theme preference to <html>
// ═══════════════════════════════════════════

'use client';

import { useEffect, useState } from 'react';
import { loadSettings, SETTINGS_KEY, type ThemeMode } from '@/hooks/useSettings';

function getResolvedTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Apply theme on mount
    const settings = loadSettings();
    const resolved = getResolvedTheme(settings.theme);
    document.documentElement.setAttribute('data-theme', resolved);

    // Listen for system preference changes (only matters in 'system' mode)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const current = loadSettings();
      if (current.theme === 'system') {
        const res = getResolvedTheme('system');
        document.documentElement.setAttribute('data-theme', res);
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    // Listen for localStorage changes from settings updates
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY) {
        const updated = loadSettings();
        const res = getResolvedTheme(updated.theme);
        document.documentElement.setAttribute('data-theme', res);
      }
    };
    window.addEventListener('storage', handleStorage);

    // Also listen for in-page settings changes via a custom event
    const handleThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<ThemeMode>).detail;
      const res = getResolvedTheme(detail);
      document.documentElement.setAttribute('data-theme', res);
    };
    window.addEventListener('dataquantai-theme-change', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dataquantai-theme-change', handleThemeChange);
    };
  }, []);

  // Prevent flash of wrong theme — render children immediately since
  // the theme is applied via data attribute, not React state
  return <>{children}</>;
}
