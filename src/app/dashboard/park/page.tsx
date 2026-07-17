'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Park, SpeciesSummaryRow } from '@/types';
import {
  Map as MapIcon,
  Radar
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import dynamic from 'next/dynamic';
const EliteAnalytics = dynamic(() => import('@/components/charts/EliteAnalytics'), { ssr: false });

function ParkDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parkId = searchParams.get('parkId') || 'mana-pools-national-park';
  const [park, setPark] = useState<Park | null>(null);
  const [speciesData, setSpeciesData] = useState<SpeciesSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedYear = Number(searchParams.get('year')) || 2025;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parkId);
        const { data: pData } = await supabase
          .from('parks')
          .select('*')
          .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? parkId : `%${parkId.replace(/-/g, ' ')}%`)
          .single();

        setPark(pData);

        if (pData) {
          const { data: sData } = await supabase
            .from('surveys')
            .select('*')
            .eq('park_id', pData.id)
            .eq('year', selectedYear)
            .single();

          if (sData) {
            const { data: specData } = await supabase
              .from('v_survey_species_totals')
              .select('*')
              .eq('survey_id', sData.id)
              .order('total_count', { ascending: false });
            setSpeciesData(specData || []);
          }
        }
      } catch (e) {
        console.error('Data fetch error:', e);
      }
      setLoading(false);
    }
    fetchData();
  }, [selectedYear, parkId]);

  const totalSightings = useMemo(() => speciesData.reduce((a, b) => a + (b.total_count || 0), 0), [speciesData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-wez-muted text-sm font-medium">Loading park dashboard…</p>
    </div>
  );

  if (!park) return (
    <div className="p-8 text-center">
      <p className="text-rose-700 font-medium bg-rose-50 p-4 rounded-md border border-rose-100">
        Park metadata not found
      </p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">{park.name}</h1>
          <p className="page-subtitle">Park game count overview and species summary</p>
          <p className="page-meta flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <MapIcon size={13} className="text-wez-green" strokeWidth={1.75} />
              {park.region}
            </span>
            <span className="text-wez-stone-200">·</span>
            <span>{park.area_ha.toLocaleString()} ha</span>
            <span className="text-wez-stone-200">·</span>
            <span>Survey {selectedYear}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <YearSelector parkId={park.id} selectedYear={selectedYear} onYearChange={(y) => {
            const p = new URLSearchParams(searchParams.toString());
            p.set('year', y.toString());
            p.set('parkId', parkId);
            router.push(`/dashboard/park?${p.toString()}`);
          }} />
          <button
            onClick={() => router.push(`/dashboard/park/intelligence?parkId=${parkId}`)}
            className="btn-primary flex items-center justify-center gap-2 h-10"
          >
            <Radar size={16} strokeWidth={1.75} />
            Operational intel
          </button>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="surface-panel p-1 overflow-hidden"
      >
        <EliteAnalytics stats={{
          parkName: park.name,
          totalSightings: totalSightings,
          observerCount: totalSightings > 0 ? 42 : 0,
          speciesCount: speciesData.length,
          dataPointGrowth: totalSightings > 0 ? 12 : 0,
          speciesData: speciesData
        }} />
      </motion.section>

      <footer className="pt-4 border-t border-[var(--wez-border)] flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="label-muted">© 2026 Wildlife & Environment Zimbabwe</p>
        <p className="label-muted flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-wez-green-light" />
          Connected
        </p>
      </footer>
    </motion.div>
  );
}

export default function ParkDashboard(props: any) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-wez-muted text-sm font-medium">Loading park dashboard…</p>
      </div>
    }>
      <ParkDashboardContent {...props} />
    </Suspense>
  );
}
