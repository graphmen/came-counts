import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for the WEZ Game Counts mobile app and platform operated by Wildlife & Environment Zimbabwe.',
  openGraph: {
    title: 'Privacy Policy | WEZ Game Counts',
    description:
      'How Wildlife & Environment Zimbabwe collects and uses data in WEZ Game Counts.',
    url: 'https://wezgamecounts.com/privacy',
  },
};

const sections: { heading: string; body: ReactNode }[] = [
  {
    heading: '1. Who we are',
    body: (
      <>
        <p>
          This Privacy Policy applies to the <strong>WEZ Game Counts</strong> mobile application
          (<code>com.wez.gamecounts</code>) and related web services at wezgamecounts.com
          (together, the “Service”), operated by{' '}
          <strong>Wildlife &amp; Environment Zimbabwe (WEZ)</strong>, Reg. Pvt. Vol. Org. Number
          P.V.O. 204/68.
        </p>
        <p>
          WEZ runs wildlife monitoring and game-count programmes. The Service helps authorised
          field teams record observations and synchronise them to WEZ systems for conservation
          reporting.
        </p>
      </>
    ),
  },
  {
    heading: '2. What this app does',
    body: (
      <p>
        WEZ Game Counts supports offline and online capture of wildlife survey observations
        (species counts, habitat notes, transect or site references, photos, and GPS location
        when enabled), then syncs those records to the WEZ Game Counts platform when a connection
        is available.
      </p>
    ),
  },
  {
    heading: '3. Data we collect',
    body: (
      <>
        <p>Depending on how you use the Service, we may collect:</p>
        <ul>
          <li>
            <strong>Account / observer identity</strong> — name, team role, and login identifiers
            used to authenticate with WEZ systems
          </li>
          <li>
            <strong>Survey observations</strong> — species, counts, habitat, activity,
            transect/site references, and timestamps
          </li>
          <li>
            <strong>Location data</strong> — precise GPS coordinates and accuracy when you record
            an observation with location enabled
          </li>
          <li>
            <strong>Photos</strong> — images you attach as observation evidence
          </li>
          <li>
            <strong>Device / technical data</strong> — app version and basic device information
            needed for sync reliability and support
          </li>
        </ul>
        <p>
          We do not use the app for advertising, and we do not sell personal data.
        </p>
      </>
    ),
  },
  {
    heading: '4. How we use data',
    body: (
      <>
        <p>Data is used to:</p>
        <ul>
          <li>Operate game-count and ecological monitoring programmes</li>
          <li>Synchronise field records to the WEZ Game Counts platform</li>
          <li>Support survey quality, reporting, and conservation decision-making</li>
          <li>Maintain security and troubleshoot sync or access issues</li>
        </ul>
      </>
    ),
  },
  {
    heading: '5. Legal basis / purpose',
    body: (
      <p>
        Processing is for the legitimate conservation and organisational operations of WEZ and
        authorised partners conducting wildlife surveys in Zimbabwe.
      </p>
    ),
  },
  {
    heading: '6. Sharing',
    body: (
      <p>
        Observation data may be shared with authorised WEZ staff, partner park authorities, and
        service providers that host WEZ Game Counts infrastructure (for example cloud database or
        storage providers acting as processors under our instructions). We do not sell personal
        data.
      </p>
    ),
  },
  {
    heading: '7. Retention',
    body: (
      <p>
        Survey data is retained as required for conservation monitoring, reporting, and
        organisational archives. Account access is retained while you remain an authorised user of
        the Service.
      </p>
    ),
  },
  {
    heading: '8. Security',
    body: (
      <p>
        We use authenticated synchronisation, access controls, and industry-standard hosting
        protections. No method of electronic transmission or storage is completely secure; we work
        to protect data appropriately for the sensitivity of conservation field records.
      </p>
    ),
  },
  {
    heading: '9. Your choices',
    body: (
      <>
        <p>
          You may request correction of your observer profile or ask WEZ about access to records
          you submitted using the contact details below. Location and camera permissions can be
          controlled in your device settings; some survey features will not work without them.
        </p>
      </>
    ),
  },
  {
    heading: '10. Children',
    body: (
      <p>
        The app is intended for authorised adult field volunteers and staff. It is not directed at
        children under 13, and we do not knowingly collect personal data from children under 13.
      </p>
    ),
  },
  {
    heading: '11. Contact',
    body: (
      <>
        <p>
          <strong>Wildlife &amp; Environment Zimbabwe</strong>
          <br />
          National Office: P.O. Box HG 996, Highlands, Harare, Zimbabwe
          <br />
          Reg. Pvt. Vol. Org. Number P.V.O. 204/68
        </p>
        <p>
          Web:{' '}
          <a href="https://wezmat.org/" target="_blank" rel="noopener noreferrer">
            wezmat.org
          </a>
          <br />
          Platform:{' '}
          <a href="https://wezgamecounts.com/">wezgamecounts.com</a>
          <br />
          Matabeleland / Game Counts enquiries:{' '}
          <a href="mailto:wezmanapoolsgamecount@gmail.com">wezmanapoolsgamecount@gmail.com</a>
        </p>
      </>
    ),
  },
  {
    heading: '12. Changes',
    body: (
      <p>
        We may update this Privacy Policy from time to time. The “Last updated” date at the top of
        this page will change when we do. Continued use of the Service after an update constitutes
        notice of the revised policy for authorised users.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
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
              <div className="text-xs text-wez-muted mt-1">Privacy Policy</div>
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
        <p className="label-muted mb-3">Legal</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-wez-ink tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-wez-muted text-sm sm:text-base leading-relaxed max-w-2xl">
          How Wildlife &amp; Environment Zimbabwe collects, uses, and protects information in the
          WEZ Game Counts mobile app and web platform.
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-wez-green-mid">
          Last updated: 6 August 2026
        </p>

        <div className="mt-10 space-y-8 privacy-prose">
          {sections.map((section) => (
            <section key={section.heading} className="surface-panel p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-wez-ink mb-3">{section.heading}</h2>
              <div className="text-sm sm:text-[15px] text-wez-muted leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-wez-green [&_a]:font-semibold [&_a]:underline-offset-2 hover:[&_a]:underline [&_code]:text-xs [&_code]:bg-wez-mint [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-[var(--wez-border)] text-center sm:text-left">
          <p className="label-muted">
            Wildlife &amp; Environment Zimbabwe · Game Counts ·{' '}
            <a href="https://wezgamecounts.com/privacy" className="text-wez-green font-semibold">
              wezgamecounts.com/privacy
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
