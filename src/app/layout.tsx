// ═══════════════════════════════════════════
// DataQuantAI — Root Layout
// ═══════════════════════════════════════════

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'DataQuantAI — AI-Driven Financial Analysis',
  description: 'Professional quantitative analysis platform powered by AI. Real-time charts, technical indicators, and Gemini-driven market insights for crypto, commodities, and indices.',
  keywords: ['quant', 'trading', 'analysis', 'crypto', 'AI', 'financial data', 'technical analysis'],
};

// Inline script to prevent flash of wrong theme before hydration
const themeInitScript = `
(function() {
  try {
    var raw = localStorage.getItem('dataquantai_settings');
    var theme = raw ? JSON.parse(raw).theme : 'dark';
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#6c5ce7',
          colorBackground: '#0f1117',
          colorInputBackground: '#151822',
          colorInputText: '#e8eaed',
          colorText: '#ffffff',
          colorTextSecondary: '#c8cadb',
          colorTextOnPrimaryBackground: '#ffffff',
          borderRadius: '6px',
        },
        elements: {
          headerTitle: { color: '#ffffff' },
          headerSubtitle: { color: '#c8cadb' },
          socialButtonsBlockButtonText: { color: '#ffffff' },
          formFieldLabel: { color: '#c8cadb' },
          formFieldInput: { color: '#e8eaed' },
          footerActionText: { color: '#c8cadb' },
          footerActionLink: { color: '#a78bfa' },
          identityPreviewText: { color: '#ffffff' },
          formResendCodeLink: { color: '#a78bfa' },
          dividerText: { color: '#8b8fa3' },
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

