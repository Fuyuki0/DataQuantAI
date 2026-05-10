// ═══════════════════════════════════════════
// FinalQuant — Root Layout
// ═══════════════════════════════════════════

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
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
  title: 'FinalQuant — AI-Driven Financial Analysis',
  description: 'Professional quantitative analysis platform powered by AI. Real-time charts, technical indicators, and Gemini-driven market insights for crypto, commodities, and indices.',
  keywords: ['quant', 'trading', 'analysis', 'crypto', 'AI', 'financial data', 'technical analysis'],
};

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
          borderRadius: '6px',
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
