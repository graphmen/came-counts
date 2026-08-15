import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Smartphone, ShieldCheck, QrCode } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Download Android App',
  description:
    'Download the WEZ Game Counts Android app for offline wildlife survey and game count field work.',
  openGraph: {
    title: 'Download WEZ Game Counts',
    description: 'Android APK for Wildlife & Environment Zimbabwe field surveys.',
    url: 'https://wezgamecounts.com/download',
  },
};

const APK_PATH = '/downloads/wez-game-counts.apk';
const APK_VERSION = '1.0.0';
const APK_SIZE = '~50 MB';

export default function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-wez-stone text-wez-ink">
      <header className="border-b border-[var(--wez-border)] bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/wez-logo.jpg"
              alt="WEZ"
              className="w-10 h-10 rounded-md object-contain border border-wez-green/30 bg-white"
            />
            <div>
              <div className="font-display font-extrabold text-lg text-wez-green tracking-tight leading-none">
                WEZ Game Counts
              </div>
              <div className="text-xs text-wez-muted mt-1">Android download</div>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-wez-green hover:text-wez-green-mid transition-colors"
          >
            Back to platform
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 sm:py-14">
        <p className="label-muted mb-3">Mobile app</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-wez-ink tracking-tight">
          Download for Android
        </h1>
        <p className="mt-3 text-wez-muted text-sm sm:text-base leading-relaxed max-w-2xl">
          Official field survey app for Wildlife &amp; Environment Zimbabwe. Capture game counts
          offline, tag GPS locations, attach photos, and sync when you are back online.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-[1.2fr_0.8fr]">
          <section className="surface-panel p-5 sm:p-6 flex flex-col">
            <div className="flex items-center gap-2 text-wez-green mb-3">
              <Smartphone size={18} strokeWidth={1.75} />
              <span className="text-xs font-semibold uppercase tracking-wide">APK install</span>
            </div>
            <h2 className="text-lg font-bold text-wez-ink">WEZ Game Counts</h2>
            <p className="text-sm text-wez-muted mt-1">
              Version {APK_VERSION} · {APK_SIZE} · Package <code className="text-xs bg-wez-mint px-1.5 py-0.5 rounded">com.wez.gamecounts</code>
            </p>

            <a
              href={APK_PATH}
              download="wez-game-counts.apk"
              className="mt-6 inline-flex items-center justify-center gap-2 h-12 px-5 rounded-md bg-wez-green text-white font-semibold text-sm hover:bg-wez-green-mid transition-colors"
            >
              <Download size={18} strokeWidth={2} />
              Download Android APK
            </a>

            <p className="mt-3 text-xs text-wez-muted leading-relaxed">
              Direct link:{' '}
              <a
                href="https://wezgamecounts.com/downloads/wez-game-counts.apk"
                className="text-wez-green font-semibold break-all"
              >
                wezgamecounts.com/downloads/wez-game-counts.apk
              </a>
            </p>

            <div className="mt-6 pt-4 border-t border-[var(--wez-border)] space-y-2 text-sm text-wez-muted">
              <p className="font-semibold text-wez-ink text-xs uppercase tracking-wide">Install tips</p>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm leading-relaxed">
                <li>Open this page on your Android phone (or scan the QR code).</li>
                <li>Tap <strong>Download Android APK</strong>.</li>
                <li>If asked, allow installs from this browser / unknown sources.</li>
                <li>Open the downloaded file and install <strong>WEZ Game Counts</strong>.</li>
              </ol>
            </div>
          </section>

          <section className="surface-panel p-5 sm:p-6 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-wez-green mb-3 self-start">
              <QrCode size={18} strokeWidth={1.75} />
              <span className="text-xs font-semibold uppercase tracking-wide">QR code</span>
            </div>
            <img
              src="/downloads/qr-download.png"
              alt="QR code linking to WEZ Game Counts download page"
              className="w-52 h-52 sm:w-56 sm:h-56 bg-white border border-[var(--wez-border)] rounded-md p-2"
            />
            <p className="mt-4 text-sm text-wez-muted leading-relaxed">
              Scan with your phone camera to open the download page.
            </p>
            <p className="mt-2 text-xs font-semibold text-wez-green break-all">
              wezgamecounts.com/download
            </p>
          </section>
        </div>

        <section className="mt-6 surface-panel p-5 sm:p-6">
          <div className="flex items-center gap-2 text-wez-green mb-3">
            <ShieldCheck size={18} strokeWidth={1.75} />
            <span className="text-xs font-semibold uppercase tracking-wide">Privacy</span>
          </div>
          <p className="text-sm text-wez-muted leading-relaxed">
            Field data is used for WEZ wildlife monitoring. Read the{' '}
            <Link href="/privacy" className="text-wez-green font-semibold hover:underline underline-offset-2">
              Privacy Policy
            </Link>
            . For support: {' '}
            <a href="mailto:wezmanapoolsgamecount@gmail.com" className="text-wez-green font-semibold">
              wezmanapoolsgamecount@gmail.com
            </a>
          </p>
        </section>

        <footer className="mt-10 pt-6 border-t border-[var(--wez-border)]">
          <p className="label-muted">
            Wildlife &amp; Environment Zimbabwe · Game Counts · Android sideload distribution
          </p>
        </footer>
      </main>
    </div>
  );
}
