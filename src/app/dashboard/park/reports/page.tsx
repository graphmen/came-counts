'use client';

import React, { useEffect, useState, Suspense } from 'react';
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
import { normalizeParkId } from '@/lib/park-routes';
// Client-only dynamic import for PDF components
const ManaPoolsPDFButton = dynamic(
  () => import('@/components/pdf/ManaPoolsPDFButton'),
  { ssr: false }
);

const fadeUp: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

function ReportsPageContent() {
  const searchParams = useSearchParams();
  const routeParkId = normalizeParkId(searchParams.get('parkId'));
  const router = useRouter();
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
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', year.toString());
    params.set('parkId', routeParkId);
    router.push(`/dashboard/park/reports?${params.toString()}`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-wez-muted text-sm font-medium">Preparing report…</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Report generator</h1>
          <p className="page-subtitle">
            Build official ecological census reports for {park?.name || 'this park'}
          </p>
          <p className="page-meta flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <FileText size={13} className="text-wez-green" strokeWidth={1.75} />
              Annual game count PDF
            </span>
            <span className="text-wez-stone-200">·</span>
            <span>Survey {selectedYear}</span>
          </p>
        </div>

        {park && (
          <YearSelector parkId={park.id} selectedYear={selectedYear} onYearChange={handleYearChange} />
        )}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Document Preview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 surface-panel overflow-hidden"
        >
          <div className="px-6 py-5 bg-wez-mint/40 border-b border-[var(--wez-border)] flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-md shadow-card border border-[var(--wez-border)] flex items-center justify-center text-wez-green">
              <FileText size={22} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="section-title">
                {survey?.year || selectedYear} Annual game count
              </h3>
              <p className="label-muted mt-0.5">
                Official ecological report · {park?.name}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={15} className="text-wez-green" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-wez-ink">Included sections</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  'Executive Summary', 'Transect Methodology', 'Species Disaggregation', 
                  'Sex & Age Analysis', 'Static Site Summary', 'Historical Trends', 
                  'Volunteer Log', 'Spatial Analytics'
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-[var(--wez-border)] bg-wez-stone/30 text-xs font-medium text-wez-ink hover:bg-wez-mint/50 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-wez-green shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--wez-border)]">
              <div className="flex items-start gap-3 bg-wez-mint/50 p-4 rounded-md border border-[var(--wez-border)]">
                <ShieldCheck size={18} className="text-wez-green flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-sm text-wez-muted leading-relaxed">
                  Reports are assembled from the live survey database and formatted for stakeholder presentations.
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
            className="surface-panel p-6"
          >
            <h4 className="section-title mb-4">Actions</h4>
            
            <div className="space-y-3">
              {park && survey && speciesData.length > 0 ? (
                <ManaPoolsPDFButton park={park} survey={survey} speciesData={speciesData} />
              ) : (
                <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-wez-stone/40 text-wez-muted text-sm font-medium cursor-not-allowed border border-[var(--wez-border)]" disabled>
                  No survey data available
                </button>
              )}

              <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-white border border-[var(--wez-border)] text-wez-ink text-sm font-semibold hover:bg-wez-mint/40 transition-colors shadow-card">
                <FileText size={16} strokeWidth={1.75} /> Preview analytics
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--wez-border)] space-y-3">
              <p className="label-muted">Document details</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Standard', value: 'ZEWC Protocol' },
                  { label: 'Format', value: 'PDF/A4' },
                  { label: 'Version', value: 'v1.1.0', isStatus: true }
                ].map(m => (
                  <div key={m.label} className="flex justify-between text-sm">
                    <span className="text-wez-muted">{m.label}</span>
                    <span className={m.isStatus ? 'text-wez-green font-semibold' : 'text-wez-ink font-medium'}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md border border-[var(--wez-border)] bg-wez-mint/40 p-4 flex items-start gap-3"
          >
            <div className="p-2 rounded-md bg-white border border-[var(--wez-border)] shadow-card shrink-0">
              <Info size={14} className="text-wez-green" strokeWidth={1.75} />
            </div>
            <p className="text-sm text-wez-muted leading-relaxed">
              Reports may be cached for up to 24 hours. Refresh the page if you need the latest survey figures.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage(props: any) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-wez-muted text-sm font-medium">Preparing report…</p>
      </div>
    }>
      <ReportsPageContent {...props} />
    </Suspense>
  );
}
