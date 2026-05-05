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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !observations || observations.length === 0) {
    return (
      <div className={`${isFullWidth ? 'w-full' : ''} px-10 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 flex items-center justify-center gap-2 opacity-50`}>
        <Download size={14} />
        <span>No Records to Export</span>
      </div>
    );
  }

  return (
    <PDFDownloadLink
      document={<TacticalIntelReport parkName={parkName || 'Unknown'} observations={observations || []} speciesSummary={speciesData || []} />}
      fileName={`WEZ_Intel_Report_${(parkName || 'Park').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
      style={{ width: '100%', textDecoration: 'none' }}
    >
      {({ loading, error }) => (
        <button 
          disabled={loading}
          className={`${isFullWidth ? 'w-full' : ''} px-10 py-4 ${
            error ? 'bg-rose-100 text-rose-600' : 
            loading ? 'bg-slate-100 text-slate-400 cursor-wait' : 
            'bg-white text-indigo-600 hover:bg-slate-50'
          } rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-transparent`}
        >
          {error ? (
            <X size={14} />
          ) : loading ? (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download size={14} />
          )}
          <span>
            {error ? 'Export Failed' : loading ? 'Compiling Dossier...' : 'Generate Intel Report'}
          </span>
        </button>
      )}
    </PDFDownloadLink>
  );
}
