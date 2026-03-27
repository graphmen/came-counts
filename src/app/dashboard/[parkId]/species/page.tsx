'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gc } from '@/lib/supabase';
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
  Users
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import { getWildlifeMetadata } from '@/lib/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

export default function SpeciesAnalysisPage({ params }: { params: { parkId: string } }) {
  const { parkId: routeParkId } = params;
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
        const { data: parkData } = await gc
          .from('parks')
          .select('id')
          .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? routeParkId : `%${routeParkId.replace(/-/g, ' ')}%`)
          .single();
        
        if (parkData) {
          setParkId(parkData.id);
          const { data: survey } = await gc.from('surveys').select('id').eq('park_id', parkData.id).eq('year', selectedYear).single();
          if (survey) {
            const { data: sData } = await gc.from('v_survey_species_totals').select('*').eq('survey_id', survey.id).order('total_count', { ascending: false });
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
    <div className="w-full">
      {/* ── Header ────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span style={{ 
              padding: '0.625rem', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '1.25rem', 
              border: '1px solid #dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <TableIcon className="text-[#1a7a4a]" size={24} />
            </span>
            Species Analysis
          </h1>
          <p className="text-slate-500 font-semibold mt-3 flex items-center gap-2">
            Detailed population structure for the {selectedYear} Survey · 
            <span className="text-[#1a7a4a] font-black">{filteredData.length} Taxa Recorded</span>
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          backgroundColor: '#fff', 
          padding: '0.5rem', 
          borderRadius: '1.25rem', 
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <YearSelector parkId={parkId} selectedYear={selectedYear} onYearChange={(y) => {
            const params = new URLSearchParams(searchParams);
            params.set('year', y.toString());
            router.push(`/dashboard/${routeParkId}/species?${params.toString()}`);
          }} />
        </div>
      </motion.div>

      {/* ── Filters & Search ──────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ delay: 0.1 }}
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: '1.25rem',
          borderRadius: '2rem',
          border: '1px solid rgba(0,0,0,0.05)',
          marginBottom: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '384px' }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="Filter by species name..."
              style={{ 
                width: '100%', 
                backgroundColor: '#f8fafc', 
                border: '1px solid transparent', 
                height: '2.75rem', 
                paddingLeft: '2.75rem', 
                paddingRight: '1rem', 
                borderRadius: '0.75rem', 
                fontSize: '0.875rem', 
                fontWeight: '700', 
                color: '#334155',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            style={{ 
              backgroundColor: '#f8fafc', 
              border: '1px solid transparent', 
              height: '2.75rem', 
              paddingLeft: '1rem', 
              paddingRight: '2rem', 
              borderRadius: '0.75rem', 
              fontSize: '0.875rem', 
              fontWeight: '900', 
              color: '#475569',
              outline: 'none',
              cursor: 'pointer'
            }}
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="all">All Classes</option>
            <option value="mammal">Mammals</option>
            <option value="bird">Birds</option>
            <option value="reptile">Reptiles</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setViewMode('grid')} 
            style={{ 
              padding: '0.625rem', 
              borderRadius: '0.75rem', 
              border: '1px solid transparent', 
              backgroundColor: viewMode === 'grid' ? '#1a7a4a' : '#f8fafc',
              color: viewMode === 'grid' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              boxShadow: viewMode === 'grid' ? '0 4px 12px rgba(26,122,74,0.2)' : 'none',
              transition: 'all 0.2s'
            }}>
            <LayoutGrid size={20} />
          </button>
          <button onClick={() => setViewMode('table')}
            style={{ 
              padding: '0.625rem', 
              borderRadius: '0.75rem', 
              border: '1px solid transparent', 
              backgroundColor: viewMode === 'table' ? '#1a7a4a' : '#f8fafc',
              color: viewMode === 'table' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              boxShadow: viewMode === 'table' ? '0 4px 12px rgba(26,122,74,0.2)' : 'none',
              transition: 'all 0.2s'
            }}>
            <TableIcon size={20} />
          </button>
        </div>
      </motion.div>

      {/* ── Species Content ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '1.5rem' 
            }}
          >
            {filteredData.map((row) => {
              const meta = getWildlifeMetadata(row.species);
              const ratio = row.male_count > 0 ? (row.female_count / row.male_count).toFixed(1) : '—';
              
              return (
                <motion.div key={row.species} variants={fadeUp}
                  style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '2rem', 
                    padding: '1.5rem', 
                    border: '1px solid #f1f5f9', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', 
                    right: '-0.75rem', 
                    top: '-0.75rem', 
                    fontSize: '90px', 
                    opacity: 0.04, 
                    pointerEvents: 'none',
                    filter: 'grayscale(1)'
                  }}>
                    {meta.emoji}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '3.5rem', 
                      height: '3.5rem', 
                      borderRadius: '1.25rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '1.875rem', 
                      backgroundColor: meta.bgLight,
                      border: '1px solid rgba(0,0,0,0.03)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      {meta.emoji}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{row.species}</h3>
                      <p style={{ margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '10px', fontWeight: 900, color: '#1a7a4a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {row.class} · <span style={{ color: '#94a3b8' }}>{row.category?.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>Total Count</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{row.total_count.toLocaleString()}</p>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>Sex Ratio</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {ratio} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>{ratio !== '—' ? 'F/M' : ''}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>♂ {row.male_count}</span>
                      <span style={{ color: '#e11d48', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>♀ {row.female_count}</span>
                    </div>
                    <span style={{ color: '#cbd5e1' }}>#{row.unknown_sex_count} unclass.</span>
                  </div>
                  
                  <button 
                    onClick={() => router.push(`/dashboard/${routeParkId}/trends`)}
                    style={{ 
                      width: '100%', 
                      marginTop: '1.5rem', 
                      paddingTop: '1rem', 
                      border: 'none',
                      borderTop: '1px solid #f8fafc', 
                      backgroundColor: 'transparent',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      fontSize: '11px', 
                      fontWeight: 900, 
                      color: '#94a3b8', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em', 
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#1a7a4a'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                  >
                    View History <ChevronRight size={14} />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: '2rem', 
              border: '1px solid #f1f5f9', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
              overflow: 'hidden' 
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Species</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Class</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Total</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>♂ Male</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>♀ Female</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => {
                    const meta = getWildlifeMetadata(row.species);
                    const ratio = row.male_count > 0 ? (row.female_count / row.male_count).toFixed(1) : '—';
                    return (
                      <tr key={row.species} style={{ borderTop: '1px solid #f8fafc', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{meta.emoji}</span>
                            <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.875rem' }}>{row.species}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ fontSize: '10px', fontWeight: 900, color: '#1a7a4a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.class}</span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 900, color: '#0f172a', fontSize: '0.875rem' }}>{row.total_count.toLocaleString()}</td>
                        <td style={{ padding: '1rem 1.5rem', color: '#2563eb', fontWeight: 700, fontSize: '0.875rem' }}>{row.male_count}</td>
                        <td style={{ padding: '1rem 1.5rem', color: '#e11d48', fontWeight: 700, fontSize: '0.875rem' }}>{row.female_count}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: 900, color: '#475569' }}>
                            {ratio} {ratio !== '—' ? 'F/M' : ''}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer Info ───────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ 
          marginTop: '4rem', 
          padding: '2.5rem', 
          backgroundColor: '#0f172a', 
          color: '#fff', 
          borderRadius: '2.5rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(15,23,42,0.15)'
        }}
      >
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '1.25rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Info size={32} className="text-green-400" />
        </div>
        <div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Demographic Accuracy Notice</h4>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontWeight: 700, maxWidth: '40rem', margin: 0 }}>
            Observation results reflect field-verified data. Instances where demographic classification (Sex/Age) 
            was deferred due to herd density or distance are preserved as 'unclassified' to maintain scientific integrity. 
            All reports follow strict ZEWC protocols for ecological data collection.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
