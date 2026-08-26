'use client';

import React, { useState } from 'react';
import { Download, FileText, FileJson, ShieldCheck, FileSpreadsheet, CheckCircle2, Loader2, FileType, Database, Globe, Info, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
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
  young_count?: number;
  temperatures?: Record<string, string> | null;
  matrix: { adult: number; sub: number; juv: number; young?: number };
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
      'ID', 'Date', 'Day', 'Period', 'Time', 'Park', 'Observer', 'SurveyType', 'Location',
      'Species', 'Class', 'TotalCount', 'Male', 'Female', 'Unknown', 'Young', 'Adult', 'SubAdult', 'Juvenile',
      'Latitude', 'Longitude', 'Distance_m', 'Bearing_deg', 'Activity', 'Habitat', 'HasPhoto'
    ];
    const rows = observations.map(obs => [
      obs.id, obs.date, obs.day_of_week, obs.period_of_day, obs.time, parkName, obs.observer, obs.type, obs.location,
      obs.species, obs.class, obs.count, obs.male_count, obs.female_count, obs.unknown_count, obs.young_count || obs.matrix.young || 0,
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
          young: obs.young_count || obs.matrix.young || 0,
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
      label: 'CSV',
      sub: 'Excel & spreadsheet ready',
      icon: FileText,
      ext: '.CSV',
      action: downloadCSV,
    },
    {
      id: 'json',
      label: 'JSON',
      sub: 'API & developer ready',
      icon: FileJson,
      ext: '.JSON',
      action: downloadJSON,
    },
    {
      id: 'geojson',
      label: 'GeoJSON',
      sub: 'QGIS · ArcGIS ready',
      icon: FileSpreadsheet,
      ext: '.GEOJSON',
      action: downloadGeoJSON,
    },
    {
      id: 'kml',
      label: 'KML',
      sub: 'Google Earth mapping',
      icon: Globe,
      ext: '.KML',
      action: downloadKML,
    },
    {
      id: 'pdf',
      label: 'PDF report',
      sub: 'Summary document',
      icon: FileType,
      ext: '.PDF',
      isPdf: true,
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
    <div className="p-8 md:p-10 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-wez-green">
            <Download size={16} strokeWidth={1.75} />
            <span className="label-muted">Field archives</span>
          </div>
          <h2 className="page-title">Export data</h2>
          <p className="page-subtitle">Download secure archives for analysis and GIS integration</p>
        </div>

        {/* Summary Stats */}
        <div className="surface-panel rounded-md border-[var(--wez-border)] p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Records', val: summary.records, icon: Database },
            { label: 'Species', val: summary.species, icon: Globe },
            { label: 'Animals', val: summary.total, icon: Activity },
            { label: 'With GPS', val: summary.withGps, icon: ShieldCheck },
            { label: 'With photo', val: summary.withPhoto, icon: FileText },
          ].map(s => (
            <div key={s.label} className="text-center space-y-1.5">
              <div className="kpi-value text-xl">{s.val}</div>
              <div className="label-muted flex items-center justify-center gap-1.5">
                <s.icon size={12} className="text-wez-green" strokeWidth={1.75} /> {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {formats.map(fmt => {
            const Icon = fmt.icon;
            const isLoading = loading === fmt.id;
            const isDone = exported === fmt.id;

            const buttonContent = (
              <div className="flex flex-col items-center gap-5">
                <div className="w-14 h-14 bg-wez-mint text-wez-green rounded-md flex items-center justify-center border border-[var(--wez-border)] group-hover:bg-wez-green group-hover:text-white transition-colors">
                  {isLoading ? <Loader2 size={26} className="animate-spin" /> :
                    isDone ? <CheckCircle2 size={26} className="text-wez-green group-hover:text-white" /> :
                      <Icon size={26} strokeWidth={1.75} />}
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-semibold text-wez-ink">{fmt.label}</div>
                  <p className="label-muted">{fmt.sub}</p>
                </div>
                <div className={`w-full py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isDone
                    ? 'bg-wez-green text-white'
                    : 'bg-wez-green text-white hover:bg-wez-green-mid'
                }`}>
                  {isDone ? <CheckCircle2 size={12} /> : <Download size={12} />}
                  {isDone ? 'Downloaded' : `Export ${fmt.ext}`}
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
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                key={fmt.id}
                onClick={fmt.action}
                disabled={observations.length === 0 || isLoading}
                className="p-6 surface-panel rounded-md border-[var(--wez-border)] transition-colors group disabled:opacity-40 hover:border-wez-green/25"
              >
                {buttonContent}
              </motion.button>
            );
          })}
        </div>

        {observations.length === 0 && (
          <div className="bg-wez-stone border border-[var(--wez-border)] rounded-md p-5 text-center">
            <p className="label-muted flex items-center justify-center gap-2">
              <Info size={14} className="text-wez-green" /> No records in the current view — adjust filters to export.
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="surface-panel rounded-md border-[var(--wez-border)] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.04]"><ShieldCheck size={96} /></div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-wez-green">
              <ShieldCheck size={16} strokeWidth={1.75} />
              <span className="section-title text-base">Secure export</span>
            </div>
            <p className="text-sm text-wez-muted leading-relaxed border-l-2 border-wez-green/30 pl-4">
              Archives generated here are linked to the WEZ National Registry. Records include observer attribution and timestamp metadata for chain-of-custody compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
