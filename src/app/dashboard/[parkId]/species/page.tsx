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
  MapPin as MapIcon
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
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#1a7a4a] border-t-transparent animate-spin" />
        <p className="text-slate-500 font-bold text-sm tracking-wide">Loading Species Data…</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 topographic-bg min-h-screen">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="relative p-6 rounded-3xl glass-card bg-white/80 overflow-hidden group">
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-md border border-emerald-100">
                <Globe size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Biological Inventory</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cycle: {selectedYear} Verification</span>
            </div>
            
            <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight leading-none uppercase">
                Species Analysis
              </h1>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 hidden sm:block">
                <YearSelector parkId={parkId} selectedYear={selectedYear} onYearChange={(y) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('year', y.toString());
                  router.push(`/dashboard/${routeParkId}/species?${params.toString()}`);
                }} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
               <Info size={16} className="text-emerald-600" />
               Primary population distribution and census audit for operational planning.
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Grid View</span>
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <TableIcon size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Table View</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Filters ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card bg-white/80 p-3 rounded-xl">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Search species..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <select 
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Classes</option>
            <option value="mammal">Mammals</option>
            <option value="bird">Birds</option>
            <option value="reptile">Reptiles</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 hover:text-emerald-700 transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* ── Species Content ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredData.map((row) => {
              const meta = getWildlifeMetadata(row.species);
              return (
                <motion.div 
                  key={row.species}
                  className="group bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className={`w-12 h-12 rounded-lg ${meta.bgLight} flex items-center justify-center text-2xl border shadow-sm`}
                      style={{ borderColor: `${meta.color}30` }}
                    >
                      {meta.emoji}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{row.species}</h3>
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mt-0.5">{row.class}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Census Total</p>
                      <p className="text-lg font-bold text-slate-900">{row.total_count.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sex Ratio</p>
                      <p className="text-lg font-bold text-slate-900">
                        {row.male_count > 0 ? (row.female_count / row.male_count).toFixed(1) : '—'} 
                        <span className="text-xs font-semibold ml-1 text-slate-500">F/M</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <div className="flex gap-4">
                      <span className="text-blue-700">♂ {row.male_count}</span>
                      <span className="text-rose-700">♀ {row.female_count}</span>
                    </div>
                    <span className="text-slate-500">#{row.unknown_sex_count}</span>
                  </div>

                  <button 
                    onClick={() => router.push(`/dashboard/${routeParkId}/trends`)}
                    className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-emerald-700 transition-colors"
                  >
                    Analysis <TrendingUp size={16} />
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
            className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Species</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Class</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => (
                  <tr key={row.species} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-900 text-sm">{row.species}</td>
                    <td className="px-4 py-4 text-xs font-bold text-emerald-700 uppercase tracking-wider">{row.class}</td>
                    <td className="px-4 py-4 font-bold text-slate-900 text-sm">{row.total_count.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => router.push(`/dashboard/${routeParkId}/trends`)} className="text-slate-500 hover:text-emerald-700 transition-colors p-2 hover:bg-emerald-50 rounded-lg">
                        <TrendingUp size={18} />
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
      <footer className="mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-600">
          <Info size={16} className="text-emerald-600" />
          <p className="text-xs font-bold uppercase tracking-wider max-w-md">
            All data points reflect field-verified sightings from the {selectedYear} census cycle.
          </p>
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">© 2026 Wildlife Zim · Secure Registry</p>
      </footer>
    </div>
  );
}
