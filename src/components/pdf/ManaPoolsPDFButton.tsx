'use client';

import React, { useState, useEffect } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ManaPoolsReportPDF } from '@/components/pdf/ManaPoolsReport';
import { Park, Survey, SpeciesSummaryRow } from '@/types';

interface Props {
  park: Park;
  survey: Survey;
  speciesData: SpeciesSummaryRow[];
}

/**
 * ManaPoolsPDFButton - Client-only component to handle PDF generation.
 * This isolates @react-pdf/renderer from SSR/Pre-rendering.
 */
export default function ManaPoolsPDFButton({ park, survey, speciesData }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest cursor-wait border border-slate-700">
        <Loader2 size={18} className="animate-spin" />
        Initializing Engine...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ManaPoolsReportPDF park={park} survey={survey} speciesData={speciesData} />}
      fileName={`WEZ_${park.name.replace(/\s+/g, '_')}_Report_${survey.year}.pdf`}
      style={{ textDecoration: 'none', width: '100%' }}
    >
      {({ loading: pdfLoading, error }) => {
        if (error) {
          return (
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
              Engine Error · Retry
            </button>
          );
        }

        return (
          <button 
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none active:scale-95 ${pdfLoading ? 'cursor-wait' : 'cursor-pointer'}`}
            disabled={pdfLoading}
          >
            <FileDown size={18} />
            {pdfLoading ? 'Compiling Matrix...' : 'Download Intel Report'}
          </button>
        );
      }}
    </PDFDownloadLink>
  );
}
