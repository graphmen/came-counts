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
  Radar
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import EliteAnalytics from '@/components/charts/EliteAnalytics';
import { FileText } from 'lucide-react';

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
      <p className="text-slate-500 font-bold text-sm tracking-wide">Syncing Command Center...</p>
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
      
      {/* ── Page Header ────────────────────────────────────────── */}
      <header className="relative p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden group">
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <Globe size={14} className="text-emerald-600 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Surveillance Mode</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">
                {park.name}
              </h1>
              <div className="h-10 w-px bg-slate-100 hidden md:block" />
              <div className="bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-inner">
                <YearSelector parkId={park.id} selectedYear={selectedYear} onYearChange={(y) => {
                  const p = new URLSearchParams(searchParams);
                  p.set('year', y.toString());
                  router.push(`/dashboard/${parkId}?${p.toString()}`);
                }} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm uppercase tracking-wider">
                <MapIcon size={16} className="text-emerald-600" />
                {park.region}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="text-slate-500 font-bold tracking-wide">SECTOR_SIZE</span>
                <span className="text-slate-900 font-mono font-bold">{park.area_ha.toLocaleString()} HA</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs tracking-wider shadow-sm">OPERATIONAL_v15</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
              <button 
                onClick={() => router.push(`/dashboard/${parkId}/intelligence`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Radar size={16} className="animate-pulse" />
                <span>Operational Intel</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm">
                <span>Export Reports</span> 
                <FileText size={16} className="text-emerald-400" />
              </button>
              <button 
                onClick={() => router.push(`/dashboard/${parkId}/surveys/new`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm"
              >
                <span>Transmit Data</span> <ChevronRight size={16} className="text-slate-500" />
              </button>
          </div>
        </div>
      </header>

      {/* ── Stats & Charts ─────────────────────────────────────── */}
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

      {/* ── Footer / Status ─────────────────────────────────────── */}
      <footer className="pt-8 pb-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6 text-slate-500">
        <p className="text-xs font-bold uppercase tracking-wider">© 2026 Wildlife & Environment Zimbabwe · Command Platform v15.0.4</p>
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
