'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { gc } from '@/lib/supabase';
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
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function ReportsPage({ params }: { params: { parkId: string } }) {
  const { parkId: routeParkId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [park, setPark] = useState<Park | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [speciesData, setSpeciesData] = useState<SpeciesSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedYear = Number(searchParams.get('year')) || 2025;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routeParkId);
        const { data: parkData } = await gc
          .from('parks')
          .select('*')
          .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? routeParkId : `%${routeParkId.replace(/-/g, ' ')}%`)
          .single();
        
        if (parkData) {
          setPark(parkData);
          const { data: sLoad } = await gc
            .from('surveys')
            .select('*')
            .eq('park_id', parkData.id)
            .eq('year', selectedYear)
            .single();

          if (sLoad) {
            setSurvey(sLoad);
            const { data: spData } = await gc
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
    <div className="w-full">
      {/* ── Page Header ────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a7a4a', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
          <FileText size={12} /> Publication Engine · Official Documentation
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Report Generator</h1>
              {park && (
                <div style={{ padding: '0.25rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <YearSelector parkId={park.id} selectedYear={selectedYear} onYearChange={handleYearChange} />
                </div>
              )}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Zap size={14} style={{ color: '#1a7a4a' }} />
              Real-time generation of ecological census reports for stakeholders.
            </p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Main Document Preview Card */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '2.5rem', 
            border: '1px solid #f1f5f9', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)', 
            overflow: 'hidden' 
          }}
        >
          {/* Decorative Header Area */}
          <div style={{ 
            padding: '3rem 2.5rem', 
            backgroundColor: '#f8fafc', 
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div style={{ 
              fontSize: '48px', 
              backgroundColor: '#fff', 
              padding: '1.25rem', 
              borderRadius: '1.5rem', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9'
            }}>📄</div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                {survey?.year || selectedYear} Annual Game Count
              </h3>
              <p style={{ fontSize: '11px', fontWeight: 900, color: '#1a7a4a', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.375rem', margin: 0 }}>
                Official Ecological Report · {park?.name}
              </p>
            </div>
          </div>

          <div style={{ padding: '2.5rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <CheckCircle size={18} style={{ color: '#1a7a4a' }} />
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Document Components</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {[
                  'Executive Summary', 'Transect Methodology', 'Species Disaggregation', 
                  'Sex & Age Analysis', 'Static Site Summary', 'Historical Trends', 
                  'Volunteer Log', 'Spatial Analytics'
                ].map(item => (
                  <div key={item} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    fontSize: '13px', 
                    fontWeight: 700, 
                    color: '#475569', 
                    padding: '0.875rem 1rem', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '1rem', 
                    border: '1px solid #f1f5f9' 
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.4)' }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: '2rem', borderTop: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', backgroundColor: '#eff6ff', padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid #dbeafe' }}>
                <ShieldCheck size={24} style={{ color: '#2563eb', flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, lineHeight: 1.6, margin: 0 }}>
                  This engine synthesizes observational matrices directly from the Supabase ecosystem. 
                  Reports are digitally signed and optimized for professional stakeholder presentations.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: '2rem', 
              padding: '2rem', 
              border: '1px solid #f1f5f9', 
              boxShadow: '0 4px 25px rgba(0,0,0,0.02)' 
            }}
          >
            <h4 style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem', margin: 0 }}>Publication Actions</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {park && survey && speciesData.length > 0 ? (
                <PDFDownloadLink
                  document={<ManaPoolsReportPDF park={park} survey={survey} speciesData={speciesData} />}
                  fileName={`WEZ_${park.name.replace(/\s+/g, '_')}_Report_${survey.year}.pdf`}
                  style={{ textDecoration: 'none' }}
                >
                  {(( { loading: pdfLoading }: any ) => (
                    <button 
                      style={{ 
                        width: '100%', 
                        padding: '1.125rem', 
                        borderRadius: '1.25rem', 
                        backgroundColor: '#1a7a4a', 
                        color: '#fff', 
                        fontWeight: 900, 
                        border: 'none', 
                        cursor: pdfLoading ? 'wait' : 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.75rem',
                        boxShadow: '0 8px 24px rgba(26,122,74,0.2)',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      disabled={pdfLoading}
                    >
                      <FileDown size={20} />
                      {pdfLoading ? 'Analyzing Data...' : 'Generate PDF Report'}
                    </button>
                  )) as any}
                </PDFDownloadLink>
              ) : (
                <button style={{ width: '100%', padding: '1.125rem', borderRadius: '1.25rem', backgroundColor: '#f1f5f9', color: '#94a3b8', fontWeight: 900, border: 'none', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '14px' }} disabled>
                  Data Unavailable
                </button>
              )}

              <button style={{ width: '100%', padding: '1.125rem', borderRadius: '1.25rem', backgroundColor: '#fff', color: '#0f172a', fontWeight: 900, border: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '14px', transition: 'all 0.2s' }}>
                <FileText size={20} /> Preview Document
              </button>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #f8fafc' }}>
              <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem', margin: 0 }}>Publication Metadata</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { label: 'Standard', value: 'ZEWC Ecological Protocol' },
                  { label: 'Format', value: 'PDF/A4 Landscape' },
                  { label: 'Version', value: 'v1.1.0 Stable', color: '#1a7a4a' }
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                    <span style={{ color: '#94a3b8' }}>{m.label}</span>
                    <span style={{ color: m.color || '#334155', fontWeight: 900 }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
            style={{ 
              padding: '1.5rem', 
              backgroundColor: '#fffbeb', 
              borderRadius: '1.5rem', 
              border: '1px solid #fef3c7', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem' 
            }}
          >
            <div style={{ padding: '0.625rem', backgroundColor: '#fff', borderRadius: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <Info size={20} style={{ color: '#d97706' }} />
            </div>
            <p style={{ fontSize: '11px', color: '#92400e', fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
              Reports are cached for 24 hours. Use 'Refresh Node' to force current parity.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
