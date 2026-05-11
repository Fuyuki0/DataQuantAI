'use client';

import { useState } from 'react';
import { Settings, Monitor, BarChart2, Brain, Bell, RotateCcw, CheckCircle, Sun, Moon, Laptop } from 'lucide-react';
import { SUPPORTED_ASSETS, type Timeframe } from '@/types';
import { useSettings, type ThemeMode } from '@/hooks/useSettings';

export default function SettingsPage() {
  const { settings, update, reset } = useSettings();
  const [showSaved, setShowSaved] = useState(false);

  const handleUpdate = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    update(key, value);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  };

  const handleThemeUpdate = (theme: ThemeMode) => {
    handleUpdate('theme', theme);
    // Dispatch custom event so the ThemeProvider reacts immediately (same tab)
    window.dispatchEvent(new CustomEvent('dataquantai-theme-change', { detail: theme }));
  };

  const handleReset = () => {
    reset();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
    // Reset theme to dark
    window.dispatchEvent(new CustomEvent('dataquantai-theme-change', { detail: 'dark' }));
  };

  const TIMEFRAMES: Timeframe[] = ['1H', '4H', '1D', '1W', '1M'];
  const AI_TEMPS = [
    { value: 'precise', label: 'Precise', desc: 'Low temperature, strict analysis' },
    { value: 'balanced', label: 'Balanced', desc: 'Recommended default' },
    { value: 'creative', label: 'Creative', desc: 'More varied insights' },
  ] as const;

  const THEME_MODES: { value: ThemeMode; label: string; icon: React.ElementType; desc: string }[] = [
    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Always use dark theme' },
    { value: 'light', label: 'Light', icon: Sun, desc: 'Always use light theme' },
    { value: 'system', label: 'System', icon: Laptop, desc: 'Follow system preference' },
  ];


  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
      style={{ background: value ? 'var(--accent)' : 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{
          left: value ? 'calc(100% - 18px)' : '2px',
          background: value ? '#fff' : 'var(--fg-dim)',
        }}
      />
    </button>
  );

  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <Icon size={14} style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>{title}</span>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>{children}</div>
    </div>
  );

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between px-4 py-3 gap-4">
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--fg)' }}>{label}</p>
        {desc && <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-dim)' }}>{desc}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
            <Settings size={15} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>Settings</h1>
            <p className="text-[10px]" style={{ color: 'var(--fg-dim)' }}>Auto-saved to browser</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showSaved && (
            <div className="flex items-center gap-1 text-xs animate-fade-in" style={{ color: 'var(--green)' }}>
              <CheckCircle size={11} /> Saved
            </div>
          )}
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 max-w-2xl">
        {/* Display */}
        <Section icon={Monitor} title="Display">
          <Row label="Theme" desc="Choose your preferred appearance">
            <div className="flex gap-1">
              {THEME_MODES.map((t) => {
                const Icon = t.icon;
                const isActive = settings.theme === t.value;
                return (
                  <button
                    key={t.value}
                    id={`settings-theme-${t.value}`}
                    onClick={() => handleThemeUpdate(t.value)}
                    title={t.desc}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold transition-all"
                    style={{
                      background: isActive ? 'var(--accent)' : 'var(--bg-surface)',
                      color: isActive ? '#fff' : 'var(--fg-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Icon size={11} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Row>
          <Row label="Compact Mode" desc="Reduce spacing and padding">
            <Toggle value={settings.compactMode} onChange={(v) => handleUpdate('compactMode', v)} />
          </Row>
          <Row label="Show Volume" desc="Display volume bars on the chart">
            <Toggle value={settings.showVolume} onChange={(v) => handleUpdate('showVolume', v)} />
          </Row>
        </Section>

        {/* Chart Defaults */}
        <Section icon={BarChart2} title="Chart Defaults">
          <Row label="Default Asset" desc="Asset loaded when you first open the dashboard">
            <select
              id="settings-default-symbol"
              value={settings.defaultSymbol}
              onChange={(e) => handleUpdate('defaultSymbol', e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg outline-none"
              style={{ background: 'var(--bg-surface)', color: 'var(--fg)', border: '1px solid var(--border)' }}
            >
              {SUPPORTED_ASSETS.map((a) => (
                <option key={a.symbol} value={a.symbol}>{a.name}</option>
              ))}
            </select>
          </Row>
          <Row label="Default Timeframe">
            <div className="flex gap-1">
              {TIMEFRAMES.map((tf) => (
                <button key={tf} onClick={() => handleUpdate('defaultTimeframe', tf)}
                  className="px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all"
                  style={{
                    background: settings.defaultTimeframe === tf ? 'var(--accent)' : 'var(--bg-surface)',
                    color: settings.defaultTimeframe === tf ? '#fff' : 'var(--fg-muted)',
                    border: '1px solid var(--border)',
                  }}>
                  {tf}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* AI */}
        <Section icon={Brain} title="AI Settings">
          <Row label="Auto-Analyze" desc="Run analysis automatically when an asset is selected">
            <Toggle value={settings.autoAnalyze} onChange={(v) => handleUpdate('autoAnalyze', v)} />
          </Row>
          <Row label="AI Response Style" desc="Controls creativity vs precision of AI outputs">
            <div className="flex gap-1">
              {AI_TEMPS.map((t) => (
                <button key={t.value} onClick={() => handleUpdate('aiTemperature', t.value)}
                  title={t.desc}
                  className="px-2.5 py-1 rounded text-[10px] font-semibold transition-all"
                  style={{
                    background: settings.aiTemperature === t.value ? 'var(--accent)' : 'var(--bg-surface)',
                    color: settings.aiTemperature === t.value ? '#fff' : 'var(--fg-muted)',
                    border: '1px solid var(--border)',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications">
          <Row label="Browser Notifications" desc="Get notified when analysis completes">
            <Toggle value={settings.notificationsEnabled} onChange={(v) => {
              if (v && typeof window !== 'undefined') {
                Notification.requestPermission().then((p) => handleUpdate('notificationsEnabled', p === 'granted'));
              } else {
                handleUpdate('notificationsEnabled', v);
              }
            }} />
          </Row>
        </Section>

        <p className="text-[10px] pb-4" style={{ color: 'var(--fg-dim)' }}>
          Settings are stored locally in your browser. They do not sync across devices.
        </p>
      </div>
    </div>
  );
}
