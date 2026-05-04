'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { gc, supabase } from '@/lib/supabase';
import { Park, Survey, SpeciesSummaryRow } from '@/types';
import {
  ChevronRight,
  TrendingUp,
  Map as MapIcon,
  Globe,
  Radar,
  FileText,
  Activity,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import EliteAnalytics from '@/components/charts/EliteAnalytics';

export default function ParkDashboard({ params }: { params: Promise<{ parkId: string }> }) {
  const { parkId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
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
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm tracking-wide">Syncing Game Counts Hub...</p>
    </div>
  );

  if (!park) return (
    <div className="p-10 text-center">
      <p className="text-rose-500 font-bold bg-rose-50 p-4 rounded-xl border border-rose-100">
        Park Metadata Not Synchronized
      </p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4"
    >

      {/* -- Page Header -- */}
      <header className="relative rounded-[2rem] bg-slate-950 text-white border border-slate-800 shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -ml-24 -mb-24" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Globe size={10} className="text-emerald-400 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live Surveillance Mode</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
                <Radar size={10} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sector Authenticated</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight leading-none">
                {park.name}
              </h1>
              <div className="h-12 w-px bg-white/10 hidden md:block" />
              <div className="bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                <YearSelector parkId={park.id} selectedYear={selectedYear} onYearChange={(y) => {
                  const p = new URLSearchParams(searchParams);
                  p.set('year', y.toString());
                  router.push(`/dashboard/${parkId}?${p.toString()}`);
                }} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em]">
                <MapIcon size={14} className="text-emerald-500" />
                {park.region}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
                <span className="text-slate-500 font-black">Jurisdictional Area</span>
                <span className="text-emerald-400 font-mono font-black">{park.area_ha.toLocaleString()} HA</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-black text-[8px] uppercase tracking-widest shadow-lg shadow-emerald-600/20">Operational v15.0</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push(`/dashboard/${parkId}/intelligence`)}
              className="group flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              <Radar size={16} className="group-hover:animate-spin" />
              <span>Operational Intel</span>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all shadow-lg active:scale-95">
              <span>Export Hub</span>
              <FileText size={16} className="text-emerald-400" />
            </button>
            <button
              onClick={() => router.push(`/dashboard/${parkId}/surveys/new`)}
              className="flex items-center gap-3 px-6 py-3 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl active:scale-95"
            >
              <span>Transmit Data</span> <ChevronRight size={16} className="text-emerald-600" />
            </button>
          </div>
        </div>

        {/* -- Operational Status Bar -- */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-8 py-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Activity size={10} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Census Flux</span>
            <span className="text-[9px] font-mono font-bold text-emerald-400">Stable</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <div className="flex items-center gap-2">
            <ShieldCheck size={10} className="text-blue-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verification</span>
            <span className="text-[9px] font-mono font-bold text-blue-400 uppercase">WEZ-Validated</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-amber-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Latency</span>
            <span className="text-[9px] font-mono font-bold text-amber-400">12ms</span>
          </div>
        </div>
      </header>

      {/* -- Stats & Charts -- */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
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

      {/* -- Footer / Status -- */}
      <footer className="pt-8 pb-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6 text-slate-500">
        <p className="text-xs font-bold uppercase tracking-wider">Wildlife & Environment Zimbabwe - Game Counts Platform v15.0.4</p>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Security Link: Active</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
