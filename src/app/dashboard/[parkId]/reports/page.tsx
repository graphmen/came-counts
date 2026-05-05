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
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Page Header ────────────────────────────────────────── */}
      <header className="relative p-10 rounded-[2.5rem] bg-white text-slate-900 border border-slate-200 shadow-sm overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
                <FileText size={12} className="text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Publication Intelligence</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
                <ShieldCheck size={12} className="text-slate-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Compiler Engine: Active</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 tracking-tighter leading-none uppercase">
                Report Generator
              </h1>
              <div className="h-16 w-px bg-slate-200 hidden md:block" />
              {park && (
                <div className="bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200 shadow-sm">
                  <YearSelector parkId={park.id} selectedYear={selectedYear} onYearChange={handleYearChange} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
               <div className="w-8 h-8 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                 <Zap size={14} className="text-emerald-600" />
               </div>
               <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] leading-relaxed max-w-xl">
                 Automated synthesis of ecological census data for official {park?.name} documentation.
               </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 text-right shadow-sm">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Doc Integrity</div>
                <div className="flex items-center gap-3 text-emerald-600 font-black text-sm">
                   <ShieldCheck size={18} className="animate-pulse" /> 100% SECURE
                </div>
              </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Document Preview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Decorative Header Area */}
          <div className="px-8 py-8 bg-slate-50 border-b border-slate-200 flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-3xl">
              📄
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight uppercase">
                {survey?.year || selectedYear} Annual Game Count
              </h3>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-2">
                Official Ecological Report · {park?.name}
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Document Components</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  'Executive Summary', 'Transect Methodology', 'Species Disaggregation', 
                  'Sex & Age Analysis', 'Static Site Summary', 'Historical Trends', 
                  'Volunteer Log', 'Spatial Analytics'
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-black text-slate-600 uppercase tracking-widest group hover:bg-slate-100 transition-all">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] group-hover:scale-125 transition-transform" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-start gap-4 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <ShieldCheck size={20} className="text-indigo-600 flex-shrink-0 mt-1" />
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-relaxed">
                  This engine synthesizes observational matrices directly from the Supabase ecosystem. 
                  Reports are digitally signed and optimized for professional stakeholder presentations.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8"
          >
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Publication Actions</h4>
            
            <div className="space-y-3">
              {mounted && park && survey && speciesData.length > 0 ? (
                <PDFDownloadLink
                  document={<ManaPoolsReportPDF park={park} survey={survey} speciesData={speciesData} />}
                  fileName={`WEZ_${park.name.replace(/\s+/g, '_')}_Report_${survey.year}.pdf`}
                  style={{ textDecoration: 'none' }}
                >
                  {(( { loading: pdfLoading }: any ) => (
                    <button 
                      className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none active:scale-95 ${pdfLoading ? 'cursor-wait' : 'cursor-pointer'}`}
                      disabled={pdfLoading}
                    >
                      <FileDown size={18} />
                      {pdfLoading ? 'Compiling Matrix...' : 'Download Intel Report'}
                    </button>
                  )) as any}
                </PDFDownloadLink>
              ) : (
                <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-slate-600 text-[10px] font-black uppercase tracking-widest cursor-not-allowed border border-white/5" disabled>
                  Data Stream Empty
                </button>
              )}

                  <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">
                <FileText size={18} /> Preview Analytics
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Metadata Registry</p>
              <div className="space-y-3">
                {[
                  { label: 'Standard', value: 'ZEWC Protocol' },
                  { label: 'Format', value: 'PDF/A4' },
                  { label: 'Version', value: 'v1.1.0 Stable', isStatus: true }
                ].map(m => (
                  <div key={m.label} className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">{m.label}</span>
                    <span className={m.isStatus ? 'text-emerald-600' : 'text-slate-900'}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4"
          >
            <div className="p-2 bg-amber-100 rounded-xl border border-amber-200 shadow-sm">
              <Info size={16} className="text-amber-600" />
            </div>
            <p className="text-[10px] text-amber-700/70 font-black uppercase tracking-[0.2em] leading-relaxed">
              Reports are cached for 24 hours. Use 'Refresh Node' to force current parity.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
