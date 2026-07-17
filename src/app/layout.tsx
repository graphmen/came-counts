import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Suspense } from 'react';

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
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body suppressHydrationWarning className="font-sans bg-wez-stone antialiased overflow-x-hidden text-wez-ink">
        <Suspense fallback={
          <aside className="sidebar">
            <div className="px-4 pt-5 pb-4 border-b border-[var(--wez-border)] bg-gradient-to-br from-wez-mint to-wez-sunset-soft">
              <div className="font-display font-extrabold text-xl text-wez-green tracking-tight">WEZ</div>
              <div className="text-xs font-semibold text-wez-sunset mt-1.5">Game Counts</div>
            </div>
          </aside>
        }>
          <Sidebar />
        </Suspense>
        <main className="main-content min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
