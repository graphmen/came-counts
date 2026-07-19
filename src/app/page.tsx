'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  ChevronRight, 
  Map as MapIcon, 
  Database, 
  Users, 
  ShieldCheck,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WEZ_NEWS, WEZ_DIRECTIVES } from '@/lib/wez-news';
import KPICard from '@/components/KPICard';

const PARKS = [
  { id: 'mana-pools-national-park', name: 'Mana Pools', latest: 2025, sightings: 18853, status: 'active', area: '219,600 ha' },
  { id: 'hwange-national-park', name: 'Hwange', latest: null, sightings: null, status: 'coming-soon', area: '1,465,100 ha' },
  { id: 'gonarezhou-national-park', name: 'Gonarezhou', latest: null, sightings: null, status: 'coming-soon', area: '506,400 ha' },
];

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [sightingsCount, setSightingsCount] = useState('18,853');

  useEffect(() => {
    async function fetchStats() {
      const { data: totalSightings } = await supabase.from('v_survey_species_totals').select('total_count');
      const total = totalSightings?.reduce((acc, curr) => acc + curr.total_count, 0) || 18853;
      setSightingsCount(total.toLocaleString());
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">WEZ Game Counts</h1>
          <p className="page-subtitle max-w-xl">
            National wildlife monitoring and reporting for Wildlife & Environment Zimbabwe.
          </p>
          <p className="page-meta">
            Wildlife & Environment Zimbabwe · PVO 204/68
          </p>
        </div>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'gap-2 h-10 px-5')}
        >
          National dashboard <ChevronRight size={16} />
        </Link>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Active sectors" value="06" icon={MapIcon} color="#1f3a1c" />
        <KPICard title="Verified sightings" value={loading ? '…' : sightingsCount} icon={ShieldCheck} color="#3f6b24" />
        <KPICard title="Expert observers" value="142" icon={Users} color="#c46a14" />
        <KPICard title="Species cataloged" value="31" icon={Database} color="#1f3a1c" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 space-y-4">
          <div>
            <h2 className="section-title">Conservation parks</h2>
            <p className="label-muted mt-1">Select a park to open its game count dashboard</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PARKS.map((park, idx) => (
              <motion.div
                key={park.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="surface-panel p-5 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-wez-ink tracking-tight">{park.name}</h3>
                    <p className="label-muted mt-1">{park.area}</p>
                  </div>
                  <span className={`badge ${park.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                    {park.status === 'active' ? 'Active' : 'Coming soon'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-sm bg-wez-stone/80 border border-[var(--wez-border)] p-3">
                    <div className="kpi-value text-xl">{(park.sightings || 0).toLocaleString()}</div>
                    <div className="label-muted mt-1">Sightings</div>
                  </div>
                  <div className="rounded-sm bg-wez-stone/80 border border-[var(--wez-border)] p-3">
                    <div className="kpi-value text-xl">{park.latest || '—'}</div>
                    <div className="label-muted mt-1">Latest cycle</div>
                  </div>
                </div>

                <Link href={park.status === 'active' ? `/dashboard/park?parkId=${park.id}` : '#'} className="block mt-auto">
                  <Button
                    disabled={park.status !== 'active'}
                    className={cn(
                      'w-full h-10 gap-2',
                      park.status === 'active' ? '' : 'opacity-50'
                    )}
                  >
                    Open park <ArrowUpRight size={14} />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div>
            <h2 className="section-title">News & updates</h2>
            <p className="label-muted mt-1">From wezmat.org</p>
          </div>

          <div className="space-y-3">
            {WEZ_NEWS.map((news) => (
              <a
                key={news.id}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block surface-panel p-4 hover:border-wez-green/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-green text-[11px]">{news.category}</span>
                  <span className="label-muted">{news.date}</span>
                </div>
                <h4 className="text-sm font-semibold text-wez-ink leading-snug">{news.title}</h4>
                <p className="text-xs text-wez-muted mt-1.5 line-clamp-2 leading-relaxed">{news.description}</p>
              </a>
            ))}
          </div>

          <div className="surface-panel p-5 bg-wez-mint/40 border-wez-green/10">
            <div className="flex items-center gap-2 text-wez-green mb-3">
              <Info size={14} strokeWidth={1.75} />
              <span className="text-xs font-semibold">Mission</span>
            </div>
            <p className="text-sm text-wez-muted leading-relaxed italic">
              &ldquo;{WEZ_DIRECTIVES.mission}&rdquo;
            </p>
            <p className="label-muted mt-4 pt-3 border-t border-[var(--wez-border)]">
              {WEZ_DIRECTIVES.registration}
            </p>
          </div>
        </aside>
      </div>

      <footer className="pt-6 border-t border-[var(--wez-border)] flex flex-col sm:flex-row justify-between gap-2 text-center sm:text-left">
        <p className="label-muted">Wildlife & Environment Zimbabwe · Game Counts</p>
        <p className="label-muted flex items-center justify-center sm:justify-end gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-wez-green-light" />
          System operational
        </p>
      </footer>
    </div>
  );
}
