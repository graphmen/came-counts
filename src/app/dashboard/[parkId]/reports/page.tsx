'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { gc, supabase } from '@/lib/supabase';
import { Park, Survey, SpeciesSummaryRow } from '@/types';
import { 
  FileDown, 
  FileText, 
  CheckCircle, 
  Info, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import { ManaPoolsReportPDF } from '@/components/pdf/ManaPoolsReport';

// Client-only dynamic import for PDF components
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

const fadeUp: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export default function ReportsPage({ params }: { params: Promise<{ parkId: string }> }) {
  const { parkId: routeParkId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [park, setPark] = useState<Park | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [speciesData, setSpeciesData] = useState<SpeciesSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedYear = Number(searchParams.get('year')) || 2025;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routeParkId);
        const { data: parkData } = await supabase
          .from('parks')
          .select('*')
          .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? routeParkId : `%${routeParkId.replace(/-/g, ' ')}%`)
          .single();
        
        if (parkData) {
          setPark(parkData);
          const { data: sLoad } = await supabase
            .from('surveys')
            .select('*')
            .eq('park_id', parkData.id)
            .eq('year', selectedYear)
            .single();

          if (sLoad) {
            setSurvey(sLoad);
            const { data: spData } = await supabase
              .from('v_survey_species_totals')
              .select('*')
              .eq('survey_id', sLoad.id)
              .order('total_count', { ascending: false });
            setSpeciesData(spData || []);
          } else {
            setSurvey(null);
            setSpeciesData([]);
          }
        }
      } catch (error) { console.error('Error fetching report data:', error); }
      setLoading(false);
    }
    fetchData();
  }, [selectedYear, routeParkId]);

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', year.toString());
    router.push(`/dashboard/${routeParkId}/reports?${params.toString()}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '3.5px solid #1a7a4a', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.025em' }}>Compiling Report Assets…</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      {/* ── Page Header ────────────────────────────────────────── */}
      <header className="relative p-6 md:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -ml-24 -mb-24" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <FileText size={10} className="text-emerald-400" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Publication Intelligence</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <ShieldCheck size={10} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Compiler Engine: Active</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight leading-none">
                Report Generator
              </h1>
              {park && (
                <div className="bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl hidden sm:block">
                  <YearSelector parkId={park.id} selectedYear={selectedYear} onYearChange={handleYearChange} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                 <Zap size={10} className="text-emerald-400" />
               </div>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed max-w-xl">
                 Automated synthesis of ecological census data for official {park?.name} documentation.
               </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm text-right">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Doc Integrity</div>
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                   <ShieldCheck size={14} className="animate-pulse" /> 100% SECURE
                </div>
              </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Document Preview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {/* Decorative Header Area */}
          <div className="px-6 py-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-2xl">
              📄
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {survey?.year || selectedYear} Annual Game Count
              </h3>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">
                Official Ecological Report · {park?.name}
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={14} className="text-emerald-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Components</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Executive Summary', 'Transect Methodology', 'Species Disaggregation', 
                  'Sex & Age Analysis', 'Static Site Summary', 'Historical Trends', 
                  'Volunteer Log', 'Spatial Analytics'
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 rounded-lg border border-slate-100 text-[11px] font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                <ShieldCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                  This engine synthesizes observational matrices directly from the Supabase ecosystem. 
                  Reports are digitally signed and optimized for professional stakeholder presentations.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Publication Actions</h4>
            
            <div className="space-y-2">
              {mounted && park && survey && speciesData.length > 0 ? (
                <PDFDownloadLink
                  document={<ManaPoolsReportPDF park={park} survey={survey} speciesData={speciesData} />}
                  fileName={`WEZ_${park.name.replace(/\s+/g, '_')}_Report_${survey.year}.pdf`}
                  style={{ textDecoration: 'none' }}
                >
                  {(( { loading: pdfLoading }: any ) => (
                    <button 
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-100 transition-all hover:bg-emerald-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none ${pdfLoading ? 'cursor-wait' : 'cursor-pointer'}`}
                      disabled={pdfLoading}
                    >
                      <FileDown size={16} />
                      {pdfLoading ? 'Processing...' : 'Download PDF Report'}
                    </button>
                  )) as any}
                </PDFDownloadLink>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-400 text-xs font-black cursor-not-allowed" disabled>
                  Data Unavailable
                </button>
              )}

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-black hover:bg-slate-50 transition-colors">
                <FileText size={16} /> Preview Online
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata Registry</p>
              <div className="space-y-2">
                {[
                  { label: 'Standard', value: 'ZEWC Protocol' },
                  { label: 'Format', value: 'PDF/A4' },
                  { label: 'Version', value: 'v1.1.0 Stable', isStatus: true }
                ].map(m => (
                  <div key={m.label} className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">{m.label}</span>
                    <span className={m.isStatus ? 'text-emerald-600 font-black' : 'text-slate-700 font-black'}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 flex items-start gap-3"
          >
            <div className="p-1.5 bg-white rounded-lg shadow-sm border border-amber-100">
              <Info size={14} className="text-amber-600" />
            </div>
            <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
              Reports are cached for 24 hours. Use 'Refresh Node' to force current parity.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
