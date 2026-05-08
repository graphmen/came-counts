'use client';

import React, { useState, useEffect } from 'react';
import { Download, Loader2, FileCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TacticalIntelReport } from '@/components/pdf/TacticalIntelReport';

interface Props {
  parkName: string;
  observations: any[];
  speciesData: any[];
  isFullWidth?: boolean;
}

/**
 * PDFExportButton - Stable "Lazy" Implementation
 * Prevents client-side crashes by only initializing the PDF engine on user request.
 */
export default function PDFExportButton({ parkName, observations, speciesData, isFullWidth = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // ── Step 0: No Data State ──────────────────────────────────────────────
  if (!observations || observations.length === 0) {
    return (
      <div className={`${isFullWidth ? 'w-full' : ''} px-10 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 flex items-center justify-center gap-2 opacity-50`}>
        <Download size={14} />
        <span>No Records Found</span>
      </div>
    );
  }

  // ── Step 1: Inactive State (Safe Mode) ──────────────────────────────────
  if (!isActivated) {
    return (
      <button
        onClick={() => setIsActivated(true)}
        className={`${isFullWidth ? 'w-full' : ''} px-4 py-3 bg-white text-emerald-600 border border-emerald-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:border-emerald-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 group`}
      >
        <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
        <span>Initialize Dossier</span>
      </button>
    );
  }

  // ── Step 2: Active PDF Generation ───────────────────────────────────────
  return (
    <div className={isFullWidth ? 'w-full' : ''}>
      <PDFDownloadLink
        document={<TacticalIntelReport parkName={parkName || 'Unknown'} observations={observations || []} speciesSummary={speciesData || []} />}
        fileName={`WEZ_Intel_Report_${(parkName || 'Park').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
        style={{ width: '100%', textDecoration: 'none' }}
      >
        {({ loading, error }) => {
          if (error) {
            return (
              <button
                onClick={() => setIsActivated(false)}
                className={`${isFullWidth ? 'w-full' : ''} px-4 py-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2`}
              >
                <AlertCircle size={14} />
                <span>Error · Retry</span>
              </button>
            );
          }

          return (
            <button
              disabled={loading}
              className={`${isFullWidth ? 'w-full' : ''} px-4 py-3 ${loading
                  ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-wait'
                  : 'bg-emerald-600 text-white border border-emerald-500 shadow-xl shadow-emerald-600/10 hover:bg-emerald-500'
                } rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2`}
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileCheck size={14} className="animate-bounce" />
              )}
              <span>
                {loading ? 'Compiling...' : 'Download Dossier'}
              </span>
            </button>
          );
        }}
      </PDFDownloadLink>

      {/* Reset switch removed for space efficiency in V3.6 */}
    </div>
  );
}
