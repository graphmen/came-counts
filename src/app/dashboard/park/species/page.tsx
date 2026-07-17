'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gc, supabase } from '@/lib/supabase';
import { SpeciesSummaryRow } from '@/types';
import { 
  Table as TableIcon, 
  LayoutGrid, 
  Search, 
  Download, 
  Info,
  TrendingUp,
} from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import { getWildlifeMetadata } from '@/lib/constants';

const fadeUp: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

function SpeciesAnalysisPageContent() {
  const searchParams = useSearchParams();
  const routeParkId = searchParams.get('parkId') || 'mana-pools-national-park';
  const router = useRouter();
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
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-wez-muted text-sm font-medium">Loading species data…</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Species analysis</h1>
          <p className="page-subtitle">Population distribution and census totals for operational planning</p>
          <p className="page-meta">Survey {selectedYear}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <YearSelector parkId={parkId} selectedYear={selectedYear} onYearChange={(y) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('year', y.toString());
            params.set('parkId', routeParkId);
            router.push(`/dashboard/park/species?${params.toString()}`);
          }} />
          <div className="flex items-center gap-1 p-1 rounded-md border border-[var(--wez-border)] bg-white shadow-card">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-wez-mint text-wez-green' : 'text-wez-muted hover:text-wez-ink'}`}
            >
              <LayoutGrid size={16} strokeWidth={1.75} />
              Grid
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-wez-mint text-wez-green' : 'text-wez-muted hover:text-wez-ink'}`}
            >
              <TableIcon size={16} strokeWidth={1.75} />
              Table
            </button>
          </div>
        </div>
      </header>

      <div className="surface-panel p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-wez-muted" size={14} strokeWidth={1.75} />
            <input 
              type="text"
              placeholder="Search species..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-wez-stone border border-[var(--wez-border)] rounded-md text-sm text-wez-ink focus:ring-2 focus:ring-wez-green/30 outline-none transition-all"
            />
          </div>
          <select 
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 bg-white border border-[var(--wez-border)] rounded-md text-sm font-medium text-wez-ink outline-none cursor-pointer"
          >
            <option value="all">All Classes</option>
            <option value="mammal">Mammals</option>
            <option value="bird">Birds</option>
            <option value="reptile">Reptiles</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--wez-border)] bg-white text-wez-ink text-sm font-medium hover:border-wez-green/25 hover:text-wez-green transition-colors">
          <Download size={16} strokeWidth={1.75} /> Export CSV
        </button>
      </div>

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
                  className="surface-panel p-5 hover:border-wez-green/25 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className={`w-12 h-12 rounded-md ${meta.bgLight} flex items-center justify-center text-2xl border border-[var(--wez-border)]`}
                      style={{ borderColor: `${meta.color}30` }}
                    >
                      {meta.emoji}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-wez-ink leading-tight">{row.species}</h3>
                      <p className="label-muted mt-0.5 capitalize">{row.class}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-wez-stone p-3 rounded-md border border-[var(--wez-border)]">
                      <p className="label-muted mb-1">Census total</p>
                      <p className="text-xl font-display font-bold text-wez-ink tracking-tight">{row.total_count.toLocaleString()}</p>
                    </div>
                    <div className="bg-wez-stone p-3 rounded-md border border-[var(--wez-border)]">
                      <p className="label-muted mb-1">Sex ratio</p>
                      <p className="text-xl font-display font-bold text-wez-ink tracking-tight">
                        {row.male_count > 0 ? (row.female_count / row.male_count).toFixed(1) : '—'} 
                        <span className="label-muted ml-1">F/M</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm font-medium mb-2">
                    <div className="flex gap-4">
                      <span className="text-blue-700">♂ {row.male_count}</span>
                      <span className="text-rose-700">♀ {row.female_count}</span>
                    </div>
                    <span className="text-wez-muted">#{row.unknown_sex_count}</span>
                  </div>

                  <button 
                    onClick={() => router.push(`/dashboard/park/trends?parkId=${routeParkId}`)}
                    className="w-full mt-4 pt-3 border-t border-[var(--wez-border)] flex items-center justify-between text-sm font-medium text-wez-muted hover:text-wez-green transition-colors"
                  >
                    View trends <TrendingUp size={16} strokeWidth={1.75} />
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
            className="surface-panel overflow-hidden"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-wez-stone border-b border-[var(--wez-border)]">
                  <th className="px-4 py-3 label-muted text-left">Species</th>
                  <th className="px-4 py-3 label-muted text-left">Class</th>
                  <th className="px-4 py-3 label-muted text-left">Total</th>
                  <th className="px-4 py-3 label-muted text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => (
                  <tr key={row.species} className="border-b border-[var(--wez-border)] hover:bg-wez-stone/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-wez-ink text-sm">{row.species}</td>
                    <td className="px-4 py-3 label-muted capitalize">{row.class}</td>
                    <td className="px-4 py-3 font-medium text-wez-ink text-sm">{row.total_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => router.push(`/dashboard/park/trends?parkId=${routeParkId}`)} className="text-wez-muted hover:text-wez-green transition-colors p-2 hover:bg-wez-mint rounded-md">
                        <TrendingUp size={18} strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="pt-4 border-t border-[var(--wez-border)] flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="label-muted flex items-center gap-1.5">
          <Info size={14} className="text-wez-green" strokeWidth={1.75} />
          Field-verified sightings from the {selectedYear} census.
        </p>
        <p className="label-muted">© 2026 Wildlife & Environment Zimbabwe</p>
      </footer>
    </div>
  );
}

export default function SpeciesAnalysisPage(props: any) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-wez-muted text-sm font-medium">Loading species data…</p>
      </div>
    }>
      <SpeciesAnalysisPageContent {...props} />
    </Suspense>
  );
}
