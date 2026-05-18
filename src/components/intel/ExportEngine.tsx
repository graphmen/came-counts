'use client';

import React, { useState } from 'react';
import { Download, FileText, FileJson, ShieldCheck, FileSpreadsheet, CheckCircle2, Loader2, FileType, Database, Globe, Info, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import nextDynamic from 'next/dynamic';

const PDFExportButton = nextDynamic(
  () => import('@/components/intel/PDFExportButton'),
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

  const downloadKML = () => {
    const placemarks = observations
      .filter(obs => obs.lat && obs.lng && !isNaN(parseFloat(obs.lat)))
      .map(obs => `
        <Placemark>
          <name>${obs.species} (${obs.count})</name>
          <description>
            <![CDATA[
              <h3>Observation Details</h3>
              <p><b>Observer:</b> ${obs.observer}</p>
              <p><b>Date:</b> ${obs.date} ${obs.time}</p>
              <p><b>Location:</b> ${obs.location}</p>
              <p><b>Activity:</b> ${obs.activity}</p>
              <p><b>Habitat:</b> ${obs.habitat}</p>
            ]]>
          </description>
          <Point>
            <coordinates>${parseFloat(obs.lng)},${parseFloat(obs.lat)},0</coordinates>
          </Point>
        </Placemark>
      `).join('\n');

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>WEZ GIS Export - ${parkName}</name>
    ${placemarks}
  </Document>
</kml>`;
    
    const href = 'data:application/vnd.google-earth.kml+xml;charset=utf-8,' + encodeURIComponent(kml);
    const filename = `WEZ_GIS_${(parkName || 'export').replace(/\s+/g, '_')}.kml`;
    triggerDownload(href, filename, 'kml');
  };

  const formats = [
    {
      id: 'csv',
      label: 'CSV Data Stream',
      sub: 'Excel & Spreadsheet Compatible',
      icon: FileText,
      ext: '.CSV',
      action: downloadCSV,
      bg: 'hover:bg-emerald-50 hover:border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      id: 'json',
      label: 'JSON Intelligence',
      sub: 'API & Developer Ready',
      icon: FileJson,
      ext: '.JSON',
      action: downloadJSON,
      bg: 'hover:bg-indigo-50 hover:border-indigo-200',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      id: 'geojson',
      label: 'GeoJSON / Shapefile',
      sub: 'QGIS · ArcGIS · GIS Ready',
      icon: FileSpreadsheet,
      ext: '.GEOJSON',
      action: downloadGeoJSON,
      bg: 'hover:bg-blue-50 hover:border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'kml',
      label: 'Google Earth KML',
      sub: '3D Mapping & Visualization',
      icon: Globe,
      ext: '.KML',
      action: downloadKML,
      bg: 'hover:bg-amber-50 hover:border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      id: 'pdf',
      label: 'Tactical Intel Report',
      sub: 'Professional PDF Summary',
      icon: FileType,
      ext: '.PDF',
      isPdf: true,
      bg: 'hover:bg-rose-50 hover:border-rose-200',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
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
    <div className="p-10 space-y-12">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-4">
           <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-slate-200" />
              <Download size={16} className="text-emerald-600" />
              <div className="h-px w-12 bg-slate-200" />
           </div>
          <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight uppercase">Intelligence Export Engine</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Generate secure archives for external analysis & GIS integration</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          {[
            { label: 'Records', val: summary.records, icon: Database, color: 'text-emerald-600' },
            { label: 'Species', val: summary.species, icon: Globe, color: 'text-indigo-600' },
            { label: 'Animals', val: summary.total, icon: Activity, color: 'text-blue-600' },
            { label: 'With GPS', val: summary.withGps, icon: ShieldCheck, color: 'text-amber-600' },
            { label: 'With Photo', val: summary.withPhoto, icon: FileText, color: 'text-rose-600' },
          ].map(s => (
            <div key={s.label} className="text-center space-y-2">
              <div className="text-2xl font-black text-slate-900 leading-none font-mono tracking-tighter">{s.val}</div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                 <s.icon size={10} className={s.color} /> {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {formats.map(fmt => {
            const Icon = fmt.icon;
            const isLoading = loading === fmt.id;
            const isDone = exported === fmt.id;

            const buttonContent = (
              <div className="flex flex-col items-center gap-6">
                <div className={`w-16 h-16 ${fmt.iconBg} rounded-[1.5rem] flex items-center justify-center border shadow-sm group-hover:scale-110 transition-all duration-500`}>
                  {isLoading ? <Loader2 size={32} className="animate-spin" /> :
                   isDone ? <CheckCircle2 size={32} className="text-emerald-600 animate-bounce" /> :
                   <Icon size={32} />}
                </div>
                <div className="text-center space-y-1">
                  <div className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em]">{fmt.label}</div>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{fmt.sub}</p>
                </div>
                <div className={`w-full py-3 ${isDone ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-slate-50 border border-slate-200'} ${isDone ? 'text-white' : 'text-slate-900'} rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all`}>
                  {isDone ? <CheckCircle2 size={12} /> : <Download size={12} className="text-emerald-600" />}
                  {isDone ? 'COMPLETED' : `EXPORT ${fmt.ext}`}
                </div>
              </div>
            );

            if ('isPdf' in fmt && fmt.isPdf) {
              return (
                <div key={fmt.id} className="w-full">
                  <PDFExportButton 
                    parkName={parkName} 
                    observations={observations} 
                    speciesData={speciesSummary}
                    isFullWidth={true}
                  />
                </div>
              );
            }

            return (
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                key={fmt.id}
                onClick={fmt.action}
                disabled={observations.length === 0 || isLoading}
                className={`p-8 bg-white border border-slate-200 rounded-[2rem] transition-all group disabled:opacity-40 shadow-sm ${fmt.bg}`}
              >
                {buttonContent}
              </motion.button>
            );
          })}
        </div>

        {observations.length === 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center backdrop-blur-md">
            <p className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
               <Info size={16} /> NO INTELLIGENCE RECORDS IN CURRENT BUFFER — ADJUST FILTERS OR SYNC NODES.
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-slate-50 text-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden border border-slate-100 shadow-sm group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"><ShieldCheck size={120} /></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 text-emerald-600">
              <ShieldCheck size={18} />
              <span className="text-[12px] font-black uppercase tracking-[0.4em]">Secure Export Protocol</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-black uppercase tracking-[0.1em] border-l-2 border-emerald-500/30 pl-6">
              Archives generated through this engine are linked to the WEZ National Registry. All records include observer attribution and timestamp metadata for chain-of-custody compliance and multi-node verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
