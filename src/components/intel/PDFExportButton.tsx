'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TacticalIntelReport } from '@/components/pdf/TacticalIntelReport';

interface Props {
  parkName: string;
  observations: any[];
  speciesData: any[];
  isFullWidth?: boolean;
}

export default function PDFExportButton({ parkName, observations, speciesData, isFullWidth = false }: Props) {
  if (observations.length === 0) return null;

  return (
    <PDFDownloadLink
      document={<TacticalIntelReport parkName={parkName} observations={observations} speciesSummary={speciesData} />}
      fileName={`WEZ_Intel_Report_${parkName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
      style={{ width: '100%', textDecoration: 'none' }}
    >
      {({ loading }: { loading: boolean }) => (
        <button 
          disabled={loading}
          className={`${isFullWidth ? 'w-full' : ''} px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download size={14} />
          )}
          <span>{loading ? 'Compiling Intel...' : 'Generate Intel Report'}</span>
        </button>
      )}
    </PDFDownloadLink>
  );
}
