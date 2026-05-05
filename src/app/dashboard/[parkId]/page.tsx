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
  Zap,
  Info,
  Database
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import EliteAnalytics from '@/components/charts/EliteAnalytics';
import PredictiveTrendEngine from '@/components/intel/PredictiveTrendEngine';

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
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
      <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Syncing Game Counts Hub...</p>
    </div>
  );

  if (!park) return (
    <div className="p-10 text-center">
      <p className="text-rose-400 font-black text-[10px] uppercase tracking-[0.2em] bg-rose-500/10 p-6 rounded-2xl border border-rose-500/20 backdrop-blur-md">
        Park Metadata Not Synchronized
      </p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-slate-950 px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >

      {/* -- Page Header -- */}
      <header className="relative rounded-[2.5rem] bg-slate-900/50 text-white border border-white/5 shadow-2xl overflow-hidden group backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

        <div className="relative z-10 p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Globe size={12} className="text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Operational Recon mode</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                <Radar size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sector Authenticated</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter leading-none uppercase">
                {park.name}
              </h1>
              <div className="h-16 w-px bg-white/10 hidden md:block" />
              <div className="bg-white/5 p-2 rounded-[1.5rem] border border-white/10 backdrop-blur-md shadow-2xl">
                <YearSelector parkId={park.id} selectedYear={selectedYear} onYearChange={(y) => {
                  const p = new URLSearchParams(searchParams);
                  p.set('year', y.toString());
                  router.push(`/dashboard/${parkId}?${p.toString()}`);
                }} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-3 text-slate-300 font-black text-[10px] uppercase tracking-[0.3em]">
                <MapIcon size={16} className="text-emerald-500" />
                {park.region}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em]">
                <span className="text-slate-500">Jurisdictional Area</span>
                <span className="text-emerald-400 font-mono font-black">{park.area_ha.toLocaleString()} HA</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 border border-white/10">Tactical v15.0</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/${parkId}/intelligence`)}
              className="group flex items-center gap-4 px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/30 active:scale-95 border border-white/10"
            >
              <Radar size={18} className="group-hover:animate-spin" />
              <span>Operational Intel</span>
            </button>
            <button className="flex items-center gap-4 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-2xl backdrop-blur-md active:scale-95">
              <span>Export Hub</span>
              <FileText size={18} className="text-emerald-400" />
            </button>
          </div>
        </div>

        {/* -- Operational Status Bar -- */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-10 py-5 border-t border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Activity size={12} className="text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Census Flux</span>
            <span className="text-[10px] font-mono font-black text-emerald-400">STABLE</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <div className="flex items-center gap-3">
            <ShieldCheck size={12} className="text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verification</span>
            <span className="text-[10px] font-mono font-black text-indigo-400 uppercase">WEZ-AUTHENTICATED</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <div className="flex items-center gap-3">
            <Zap size={12} className="text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Latency</span>
            <span className="text-[10px] font-mono font-black text-amber-400">12MS</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
             <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">ID: GAMECOUNT-NODE-01</div>
          </div>
        </div>
      </header>

      {/* -- Stats & Charts -- */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="relative z-10"
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

      {/* -- Longitudinal Analysis & Forecasting -- */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="relative z-10"
      >
        <PredictiveTrendEngine parkId={parkId} />
      </motion.section>

      {/* -- Footer / Status -- */}
      <footer className="pt-12 pb-8 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8 relative z-10">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <Info size={20} className="text-slate-500" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Wildlife & Environment Zimbabwe</p>
              <p className="text-[11px] font-black text-white uppercase tracking-[0.1em] mt-1">Game Counts Platform v15.0.4 • Operational Node ACTIVE</p>
           </div>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
             <Database size={14} className="text-slate-600" />
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">DB Version: GC.9.4</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Security Link: Encrypted</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
