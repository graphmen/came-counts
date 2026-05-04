'use client';

import React, { useState } from 'react';
import { Download, FileText, FileJson, ShieldCheck, FileSpreadsheet, CheckCircle2, Loader2, FileType } from 'lucide-react';
import nextDynamic from 'next/dynamic';

const PDFDownloadLink = nextDynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const TacticalIntelReport = nextDynamic(
  () => import('@/components/pdf/TacticalIntelReport').then((mod) => mod.TacticalIntelReport),
  { ssr: false }
);

interface Observation {
  id: string; type: string; species: string; class: string; count: number;
  location: string; meta: string; time: string; sex: string; age: string;
  date: string; observer: string; distance: string; bearing: string;
  lat: string; lng: string; habitat: string; activity: string; photo_url?: string;
  day_of_week: string; period_of_day: string;
  male_count: number; female_count: number; unknown_count: number;
  matrix: { adult: number; sub: number; juv: number };
}

export default function ExportEngine({ observations, parkName }: { observations: Observation[], parkName: string }) {
  const [exported, setExported] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const triggerDownload = (href: string, filename: string, type: string) => {
    setLoading(type);
    setTimeout(() => {
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(null);
      setExported(type);
      setTimeout(() => setExported(null), 3000);
    }, 600);
  };

  const downloadCSV = () => {
    if (observations.length === 0) return;
    const headers = [
      'ID','Date','Day','Period','Time','Park','Observer','SurveyType','Location',
      'Species','Class','TotalCount','Male','Female','Unknown','Adult','SubAdult','Juvenile',
      'Latitude','Longitude','Distance_m','Bearing_deg','Activity','Habitat','HasPhoto'
    ];
    const rows = observations.map(obs => [
      obs.id, obs.date, obs.day_of_week, obs.period_of_day, obs.time, parkName, obs.observer, obs.type, obs.location,
      obs.species, obs.class, obs.count, obs.male_count, obs.female_count, obs.unknown_count, 
      obs.matrix.adult, obs.matrix.sub, obs.matrix.juv,
      obs.lat || '', obs.lng || '', obs.distance || '0', obs.bearing || '0',
      obs.activity, obs.habitat, obs.photo_url ? 'Yes' : 'No'
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
    const filename = `WEZ_Intel_${(parkName || 'export').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    triggerDownload(href, filename, 'csv');
  };

  const downloadJSON = () => {
    const payload = {
      export_metadata: {
        generated_at: new Date().toISOString(),
        park: parkName,
        record_count: observations.length,
        platform: 'WEZ Game Counts v2',
      },
      observations
    };
    const href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const filename = `WEZ_Intel_${(parkName || 'export').replace(/\s+/g, '_')}.json`;
    triggerDownload(href, filename, 'json');
  };

  const downloadGeoJSON = () => {
    const features = observations
      .filter(obs => obs.lat && obs.lng && !isNaN(parseFloat(obs.lat)))
      .map(obs => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [parseFloat(obs.lng), parseFloat(obs.lat)] },
        properties: {
          id: obs.id, species: obs.species, class: obs.class, count: obs.count,
          type: obs.type, observer: obs.observer, date: obs.date, time: obs.time,
          day_of_week: obs.day_of_week, period_of_day: obs.period_of_day,
          habitat: obs.habitat, activity: obs.activity,
          male: obs.male_count, female: obs.female_count, unknown: obs.unknown_count,
          adult: obs.matrix.adult, sub_adult: obs.matrix.sub, juvenile: obs.matrix.juv,
          photo_url: obs.photo_url || null
        }
      }));
    const geojson = { type: 'FeatureCollection', features };
    const href = 'data:application/geo+json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const filename = `WEZ_GIS_${(parkName || 'export').replace(/\s+/g, '_')}.geojson`;
    triggerDownload(href, filename, 'geojson');
  };

  const formats = [
    {
      id: 'csv',
      label: 'CSV Data Stream',
      sub: 'Excel & Spreadsheet Compatible',
      icon: FileText,
      color: 'emerald',
      ext: '.CSV',
      action: downloadCSV,
      bg: 'hover:bg-emerald-50 hover:border-emerald-200',
      iconBg: 'text-emerald-600',
    },
    {
      id: 'json',
      label: 'JSON Intelligence',
      sub: 'API & Developer Ready',
      icon: FileJson,
      color: 'sky',
      ext: '.JSON',
      action: downloadJSON,
      bg: 'hover:bg-sky-50 hover:border-sky-200',
      iconBg: 'text-sky-600',
    },
    {
      id: 'geojson',
      label: 'GeoJSON Spatial',
      sub: 'QGIS · ArcGIS · GIS Ready',
      icon: FileSpreadsheet,
      color: 'violet',
      ext: '.GEOJSON',
      action: downloadGeoJSON,
      bg: 'hover:bg-violet-50 hover:border-violet-200',
      iconBg: 'text-violet-600',
    },
    {
      id: 'pdf',
      label: 'Tactical Intel Report',
      sub: 'Professional PDF Summary',
      icon: FileType,
      color: 'rose',
      ext: '.PDF',
      isPdf: true,
      bg: 'hover:bg-rose-50 hover:border-rose-200',
      iconBg: 'text-rose-600',
    },
  ];

  const speciesSummary = React.useMemo(() => {
    const map: Record<string, number> = {};
    observations.forEach(o => {
      map[o.species] = (map[o.species] || 0) + o.count;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [observations]);

  const summary = {
    records: observations.length,
    species: new Set(observations.map(o => o.species)).size,
    total: observations.reduce((a, o) => a + (o.count || 0), 0),
    withGps: observations.filter(o => o.lat && o.lng).length,
    withPhoto: observations.filter(o => o.photo_url).length,
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Intelligence Export Engine</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest font-display">Generate secure archives for external analysis & GIS integration</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
          {[
            { label: 'Records', val: summary.records },
            { label: 'Species', val: summary.species },
            { label: 'Animals', val: summary.total },
            { label: 'With GPS', val: summary.withGps },
            { label: 'With Photo', val: summary.withPhoto },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-black text-slate-900 leading-none font-mono">{s.val}</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1 font-display">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formats.map(fmt => {
            const Icon = fmt.icon;
            const isLoading = loading === fmt.id;
            const isDone = exported === fmt.id;

            const buttonContent = (
              <>
                <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center ${fmt.iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
                  {isLoading ? <Loader2 size={28} className="animate-spin" /> :
                   isDone ? <CheckCircle2 size={28} className="text-emerald-600" /> :
                   <Icon size={28} />}
                </div>
                <div className="text-center">
                  <div className="text-sm font-black text-slate-900 uppercase tracking-widest font-display">{fmt.label}</div>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 font-sans">{fmt.sub}</p>
                </div>
                <div className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  {isDone ? <CheckCircle2 size={12} /> : <Download size={12} />}
                  {isDone ? 'DOWNLOADED!' : `EXPORT ${fmt.ext}`}
                </div>
              </>
            );

            if ('isPdf' in fmt && fmt.isPdf) {
              return (
                <div key={fmt.id} className="w-full">
                  <PDFDownloadLink
                    document={<TacticalIntelReport parkName={parkName} observations={observations} speciesSummary={speciesSummary} />}
                    fileName={`WEZ_Intel_Report_${(parkName || 'export').replace(/\s+/g, '_')}.pdf`}
                    style={{ width: '100%', textDecoration: 'none' }}
                  >
                    {({ loading: pdfLoading }) => (
                      <button
                        disabled={observations.length === 0 || pdfLoading}
                        className={`w-full flex flex-col items-center gap-4 p-6 bg-slate-50 border border-slate-200 rounded-3xl transition-all group disabled:opacity-40 ${fmt.bg}`}
                      >
                        <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center ${fmt.iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
                          {pdfLoading ? <Loader2 size={28} className="animate-spin" /> :
                           <Icon size={28} />}
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-black text-slate-900 uppercase tracking-widest font-display">{fmt.label}</div>
                          <p className="text-[9px] text-slate-400 font-bold mt-1 font-sans">{fmt.sub}</p>
                        </div>
                        <div className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          {pdfLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                          {pdfLoading ? 'COMPILING...' : `EXPORT ${fmt.ext}`}
                        </div>
                      </button>
                    )}
                  </PDFDownloadLink>
                </div>
              );
            }

            return (
              <button
                key={fmt.id}
                onClick={fmt.action}
                disabled={observations.length === 0 || isLoading}
                className={`flex flex-col items-center gap-4 p-6 bg-slate-50 border border-slate-200 rounded-3xl transition-all group disabled:opacity-40 ${fmt.bg}`}
              >
                {buttonContent}
              </button>
            );
          })}
        </div>

        {observations.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">⚠️ No Intelligence Records in Current Buffer — Adjust filters or sync from the field first.</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={60} /></div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-display">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Export Protocol</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic font-sans">
              "Archives generated through this engine are linked to the WEZ National Registry. All records include observer attribution and timestamp metadata for chain-of-custody compliance."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
