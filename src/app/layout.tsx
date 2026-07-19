import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import AppShell from '@/components/AppShell';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | WEZ Wildlife Platform',
    default: 'WEZ Game Counts | Wildlife Game Count Zimbabwe',
  },
  description: 'The official multi-park wildlife monitoring and reporting platform for Wildlife & Environment Zimbabwe (WEZ). Real-time digital dashboards, rigorous trend analysis, and automated professional reports.',
  keywords: ['WEZ', 'Wildlife', 'Zimbabwe', 'Game Count', 'Conservation', 'Mana Pools', 'Hwange'],
  authors: [{ name: 'WEZ Conservation Tech Team' }],
  openGraph: {
    title: 'WEZ Game Counts | Wildlife Game Count',
    description: 'Modernizing Zimbabwe\'s wildlife monitoring with digital intelligence.',
    url: 'https://wez-platform.vercel.app',
    siteName: 'WEZ Wildlife Platform',
    locale: 'en_ZW',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body suppressHydrationWarning className="font-sans bg-wez-stone antialiased overflow-x-hidden text-wez-ink">
        <Suspense
          fallback={
            <main className="main-content min-h-screen relative z-[1]">
              {children}
            </main>
          }
        >
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
