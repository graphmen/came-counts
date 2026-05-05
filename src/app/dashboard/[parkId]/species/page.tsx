'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gc, supabase } from '@/lib/supabase';
import { SpeciesSummaryRow } from '@/types';
import { 
  Table as TableIcon, 
  LayoutGrid, 
  Search, 
  Filter, 
  Download, 
  Info,
  ChevronRight,
  TrendingUp,
  Users,
  Globe,
  MapPin as MapIcon,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import { getWildlifeMetadata } from '@/lib/constants';

const fadeUp: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export default function SpeciesAnalysisPage({ params }: { params: Promise<{ parkId: string }> }) {
  const { parkId: routeParkId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<SpeciesSummaryRow[]>([]);
  const [parkId, setParkId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);

  const selectedYear = Number(searchParams.get('year')) || 2025;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routeParkId);
        const { data: parkData } = await supabase
          .from('parks')
          .select('id')
          .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? routeParkId : `%${routeParkId.replace(/-/g, ' ')}%`)
          .single();
        
        if (parkData) {
          setParkId(parkData.id);
          const { data: survey } = await supabase.from('surveys').select('id').eq('park_id', parkData.id).eq('year', selectedYear).single();
          if (survey) {
            const { data: sData } = await supabase.from('v_survey_species_totals').select('*').eq('survey_id', survey.id).order('total_count', { ascending: false });
            setData(sData || []);
          } else { setData([]); }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchData();
  }, [selectedYear, routeParkId]);

  const filteredData = useMemo(() => data.filter(item => {
    const matchesSearch = item.species.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 'all' || item.class === filterClass;
    return matchesSearch && matchesClass;
  }), [data, search, filterClass]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh] bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Synchronizing Species Matrix…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Page Header ────────────────────────────────────────── */}
      <header className="relative p-10 rounded-[2.5rem] bg-slate-900/50 text-white border border-white/5 shadow-2xl overflow-hidden group backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Globe size={12} className="text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Biological Inventory</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                <ShieldCheck size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cycle: {selectedYear} Verification</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter leading-none uppercase">
                Species Analysis
              </h1>
              <div className="h-16 w-px bg-white/10 hidden md:block" />
              <div className="bg-white/5 p-2 rounded-[1.5rem] border border-white/10 backdrop-blur-md shadow-2xl">
                <YearSelector parkId={parkId} selectedYear={selectedYear} onYearChange={(y) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('year', y.toString());
                  router.push(`/dashboard/${routeParkId}/species?${params.toString()}`);
                }} />
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="w-8 h-8 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                 <Info size={14} className="text-emerald-400" />
               </div>
               <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] leading-relaxed max-w-xl">
                 Primary population distribution and census audit for operational planning.
               </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-[1.5rem] border border-white/10 backdrop-blur-md shadow-2xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutGrid size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Grid</span>
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <TableIcon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Table</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Search & Filters ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-6 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text"
              placeholder="Filter by species identification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all uppercase tracking-[0.2em]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            <select 
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white outline-none cursor-pointer appearance-none hover:bg-white/10 transition-all uppercase tracking-[0.2em]"
            >
              <option value="all" className="bg-slate-900">Taxonomic Range: ALL</option>
              <option value="mammal" className="bg-slate-900">Class: MAMMALS</option>
              <option value="bird" className="bg-slate-900">Class: BIRDS</option>
              <option value="reptile" className="bg-slate-900">Class: REPTILES</option>
            </select>
          </div>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 transition-all border border-emerald-400/20">
          <Download size={16} /> Export Intelligence
        </button>
      </div>

      {/* ── Species Content ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredData.map((row) => {
              const meta = getWildlifeMetadata(row.species);
              return (
                <motion.div 
                  key={row.species}
                  className="group bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-2xl hover:border-emerald-500/30 transition-all relative overflow-hidden backdrop-blur-md"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/[0.07] transition-colors" />
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div 
                      className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl border border-white/10 shadow-2xl transition-transform group-hover:scale-110 duration-500`}
                    >
                      {meta.emoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-black text-white leading-none uppercase tracking-tight">{row.species}</h3>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-2">{row.class}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Census Total</p>
                      <p className="text-2xl font-mono font-black text-white tracking-tighter">{row.total_count.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Sex Ratio</p>
                      <p className="text-2xl font-mono font-black text-white tracking-tighter">
                        {row.male_count > 0 ? (row.female_count / row.male_count).toFixed(1) : '—'} 
                        <span className="text-[8px] font-black ml-1 text-slate-600">F/M</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-black mb-4 relative z-10 uppercase tracking-widest">
                    <div className="flex gap-4">
                      <span className="text-blue-400">♂ {row.male_count}</span>
                      <span className="text-rose-400">♀ {row.female_count}</span>
                    </div>
                    <span className="text-slate-600">UNK: {row.unknown_sex_count}</span>
                  </div>

                  <button 
                    onClick={() => router.push(`/dashboard/${routeParkId}/trends`)}
                    className="w-full mt-4 pt-5 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-emerald-400 transition-colors relative z-10"
                  >
                    Temporal Analysis <TrendingUp size={16} />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="table" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-md"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Species Identification</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Taxonomic Class</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Census Aggregation</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredData.map((row) => (
                  <tr key={row.species} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                             {getWildlifeMetadata(row.species).emoji}
                          </div>
                          <span className="text-sm font-black text-white uppercase tracking-tight">{row.species}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{row.class}</td>
                    <td className="px-8 py-6">
                       <span className="text-lg font-mono font-black text-white tracking-tighter">{row.total_count.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => router.push(`/dashboard/${routeParkId}/trends`)} className="text-slate-500 hover:text-emerald-400 transition-all p-3 hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/10">
                        <TrendingUp size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer Info ───────────────────────────────────── */}
      <footer className="pt-12 pb-8 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8 relative z-10">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <Info size={20} className="text-slate-500" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Wildlife & Environment Zimbabwe</p>
              <p className="text-[11px] font-black text-white uppercase tracking-[0.1em] mt-1">Operational Node ACTIVE • Secure biological registry</p>
           </div>
        </div>
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">© 2026 DIGITAL_PERIMETER_ACTIVE</p>
      </footer>
    </div>
  );
}
