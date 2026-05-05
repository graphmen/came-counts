import type { Metadata } from 'next';
import { Inter, Outfit, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
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
    description: 'Modernizing Zimbabwe\'s wildlife monitoring with elite digital intelligence.',
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="font-sans bg-slate-950 text-slate-200 antialiased overflow-x-hidden">
        <Sidebar />
        <main className="main-content min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
