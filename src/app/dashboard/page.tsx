'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Park } from '@/types';
import { 
  Map as MapIcon, 
  ShieldCheck, 
  Database,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import EliteAnalytics from '@/components/charts/EliteAnalytics';
import KPICard from '@/components/KPICard';

export default function NationalDashboard() {
  const [parks, setParks] = useState<Park[]>([]);
  const [allSightings, setAllSightings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNationalData() {
      setLoading(true);
      try {
        const { data: pData } = await supabase.from('parks').select('*').order('name');
        setParks(pData || []);

        const { data: sData } = await supabase
          .from('v_survey_species_totals')
          .select('year, total_count, species, park_id');
        
        setAllSightings(sData || []);
      } catch (e) {
        console.error('National data fetch error:', e);
      }
      setLoading(false);
    }
    fetchNationalData();
  }, []);

  const nationalStats = useMemo(() => {
    const totalSightings = allSightings.reduce((acc, curr) => acc + (curr.total_count || 0), 0);
    const totalArea = parks.reduce((acc, curr) => acc + (curr.area_ha || 0), 0);
    const uniqueSpecies = new Set(allSightings.map(s => s.species)).size;
    
    return {
      totalSightings,
      totalArea,
      uniqueSpecies,
      activeNodes: parks.length
    };
  }, [allSightings, parks]);

  const speciesDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    allSightings.forEach(s => {
      map[s.species] = (map[s.species] || 0) + s.total_count;
    });
    return Object.entries(map)
      .map(([species, total_count]) => ({ species, total_count }))
      .sort((a, b) => b.total_count - a.total_count);
  }, [allSightings]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <div className="w-10 h-10 border-3 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-wez-muted text-sm font-medium">Loading national overview…</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">National dashboard</h1>
          <p className="page-subtitle max-w-lg">
            Aggregated wildlife counts across all WEZ operational parks.
          </p>
          <p className="page-meta flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Activity size={12} className="text-wez-green" />
              {nationalStats.activeNodes} parks
            </span>
            <span className="text-wez-stone-200">·</span>
            <span>Zimbabwe</span>
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Verified sightings" value={nationalStats.totalSightings.toLocaleString()} icon={ShieldCheck} color="#0f4c3a" />
        <KPICard title="Hectares managed" value={`${(nationalStats.totalArea / 1000).toFixed(0)}k`} icon={MapIcon} color="#1a6b52" />
        <KPICard title="Species recorded" value={nationalStats.uniqueSpecies} icon={Database} color="#0f4c3a" />
        <KPICard title="Active parks" value={nationalStats.activeNodes} icon={Activity} color="#b45309" />
      </section>

      <section className="surface-panel p-1 overflow-hidden">
        <EliteAnalytics stats={{
          parkName: 'National Overview',
          totalSightings: nationalStats.totalSightings,
          observerCount: 142,
          speciesCount: nationalStats.uniqueSpecies,
          dataPointGrowth: 8.5,
          speciesData: speciesDistribution
        }} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="section-title">Parks</h2>
          <p className="label-muted mt-1">Open a park for detailed game count analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {parks.map((park) => {
            const parkSightings = allSightings.filter(s => s.park_id === park.id).reduce((acc, curr) => acc + curr.total_count, 0);
            return (
              <Link key={park.id} href={`/dashboard/park?parkId=${park.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="surface-panel p-4 h-full hover:border-wez-green/25 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-9 h-9 rounded-sm bg-wez-mint flex items-center justify-center text-wez-green">
                      <MapIcon size={16} strokeWidth={1.75} />
                    </div>
                    <ArrowUpRight size={14} className="text-wez-faint group-hover:text-wez-green transition-colors" />
                  </div>

                  <h3 className="font-display font-semibold text-wez-ink leading-tight">{park.name}</h3>
                  <p className="label-muted mt-1 flex items-center gap-1">
                    {park.region || 'Zimbabwe'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-wez-stone/70 rounded-sm p-2.5 border border-[var(--wez-border)]">
                      <div className="text-sm font-semibold tabular-nums text-wez-green">{parkSightings.toLocaleString()}</div>
                      <div className="label-muted mt-0.5">Sightings</div>
                    </div>
                    <div className="bg-wez-stone/70 rounded-sm p-2.5 border border-[var(--wez-border)]">
                      <div className="text-sm font-semibold tabular-nums text-wez-ink">{park.area_ha ? (park.area_ha / 1000).toFixed(0) + 'k' : '—'}</div>
                      <div className="label-muted mt-0.5">Hectares</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="pt-4 border-t border-[var(--wez-border)] text-center">
        <p className="label-muted">Wildlife & Environment Zimbabwe · National game counts</p>
      </footer>
    </motion.div>
  );
}
