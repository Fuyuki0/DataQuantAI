// ═══════════════════════════════════════════
// DataQuantAI — Settings Hook (shared state)
// ═══════════════════════════════════════════

'use client';

import { useState, useEffect } from 'react';
import type { Timeframe } from '@/types';

export interface AppSettings {
  defaultSymbol: string;
  defaultTimeframe: Timeframe;
  aiTemperature: 'precise' | 'balanced' | 'creative';
  autoAnalyze: boolean;
  showVolume: boolean;
  notificationsEnabled: boolean;
  compactMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultSymbol: 'bitcoin',
  defaultTimeframe: '1D',
  aiTemperature: 'balanced',
  autoAnalyze: false,
  showVolume: true,
  notificationsEnabled: false,
  compactMode: false,
};

export const SETTINGS_KEY = 'dataquantai_settings';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  };

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== 'undefined') localStorage.removeItem(SETTINGS_KEY);
  };

  return { settings, update, reset, loaded };
}
