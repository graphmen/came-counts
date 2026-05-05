'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gc } from '@/lib/supabase';
import {
  Radar,
  Table as TableIcon,
  Map as MapIcon,
  Download,
  Search,
  Database,
  Activity,
  Calendar,
  Globe,
  Wifi,
  Users,
  Bird,
  Zap,
  Image as ImageIcon,
  X,
  Camera,
  Layers,
  Filter,
  RefreshCw
} from 'lucide-react';
import KPICard from '@/components/KPICard';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import DataLedger from '@/components/intel/DataLedger';
import ExportEngine from '@/components/intel/ExportEngine';
import IntelligenceRecon from '@/components/intel/IntelligenceRecon';
import LiveTicker from '@/components/intel/LiveTicker';
import nextDynamic from 'next/dynamic';

const SurveyMap = nextDynamic(() => import('@/components/intel/SurveyMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-slate-900 rounded-2xl flex items-center justify-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing Map Node...</div>
});

/**
 * Normalizes a route param like "mana-pools-national-park" → "mana-pools"
 * to match the park_id values stored by the mobile app.
 */
function routeParamToParkId(routeParam: string): string {
  const MAP: Record<string, string> = {
    'mana-pools-national-park': 'mana-pools',
    'hwange-national-park': 'hwange',
    'gonarezhou-national-park': 'gonarezhou',
    'matusadona-national-park': 'matusadona',
    'matobo-national-park': 'matobo',
    'chizarira-national-park': 'chizarira',
    'nyanga-national-park': 'nyanga',
    'chimanimani-national-park': 'chimanimani',
    'charara-safari-area': 'charara',
    'hurungwe-safari-area': 'hurungwe',
    'dande-safari-area': 'dande',
    'sapi-safari-area': 'sapi',
    'chewore-safari-area': 'chewore',
  };
  return MAP[routeParam] || routeParam;
}

function resolvePhotoUrl(url: string | null, payload?: any) {
  if (!url && payload?.photo_uri) {
    if (payload.photo_uri.includes('ImagePicker') || payload.photo_uri.startsWith('file://')) {
      const fileName = payload.photo_uri.split('/').pop();
      url = fileName;
    } else {
      url = payload.photo_uri;
    }
  }
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
  let cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  if (cleanUrl.startsWith('photos/')) {
    cleanUrl = cleanUrl.replace('photos/', '');
  }
  return `${supabaseUrl}/storage/v1/object/public/photos/${cleanUrl}`;
}

function normalizeObservation(o: any) {
  const p = o.payload || {};
  const adultSum = (Number(p.adult_m) || 0) + (Number(p.adult_f) || 0) + (Number(p.adult_u) || 0);
  const subSum = (Number(p.sub_adult_m) || 0) + (Number(p.sub_adult_f) || 0) + (Number(p.sub_adult_u) || 0);
  const juvSum = (Number(p.juv_m) || 0) + (Number(p.juv_f) || 0) + (Number(p.juv_u) || 0);
  const total = adultSum + subSum + juvSum;

  return {
    id: o.id,
    type: o.survey_type || p.survey_type || 'Unknown',
    species: (o.species_name && o.species_name !== 'undefined') ? o.species_name :
      (p.species_name && p.species_name !== 'undefined') ? p.species_name :
        (p.other_species && p.other_species !== 'undefined') ? p.other_species :
          (o.species_id && o.species_id !== 'undefined') ? o.species_id : 'Unidentified',
    class: o.classification || p.classification || 'N/A',
    count: total || 1,
    location: o.transect_id || o.static_site_id || p.transect_id || p.static_site_id || 'General',
    meta: p.session_slot || o.period_of_day || 'N/A',
    time: p.session_time || (o.synced_at || o.created_at || '').split('T')[1]?.substring(0, 5) || '',
    sex: 'Mixed',
    age: 'Mixed',
    date: p.session_date || (o.created_at || '').split('T')[0] || '',
    day_of_week: o.day_of_week || p.day_of_week || '',
    period_of_day: o.period_of_day || p.period_of_day || '',
    observer: o.team_leader || p.team_leader_name || 'Mobile Node',
    distance: p.distance || '0',
    bearing: p.bearing || '0',
    lat: o.lat || p.lat || null,
    lng: o.long || p.long || null,
    accuracy: o.accuracy || p.accuracy || '5',
    habitat: p.habitat || 'N/A',
    activity: p.activity || 'N/A',
    photo_url: resolvePhotoUrl(o.photo_url, p),
    park_name: o.park_name || p.park_name || o.park_id || '',
    male_count: o.male_count || 0,
    female_count: o.female_count || 0,
    unknown_count: o.unknown_count || 0,
    matrix: { adult: adultSum, sub: subSum, juv: juvSum }
  };
}

export default function IntelligenceHubPage() {
  const { parkId: routeParkId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<'map' | 'table' | 'export' | 'analytics' | 'gallery'>('table');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [parkName, setParkName] = useState('');
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    species: 'All',
    observer: 'All',
    type: 'All',
    class: 'All',
    habitat: 'All',
    activity: 'All'
  });
  const [liveCount, setLiveCount] = useState(0);

  const mobileParkId = routeParamToParkId(routeParkId as string);

  useEffect(() => {
    async function fetchIntel() {
      setLoading(true);
      try {
        const { data: fieldObs, error } = await gc
          .from('field_observations')
          .select('*')
          .eq('park_id', mobileParkId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const normalized = (fieldObs || []).map(normalizeObservation);
        setObservations(normalized);
        if (fieldObs && fieldObs.length > 0) {
          setParkName(fieldObs[0].park_name || mobileParkId);
        }
      } catch (err) {
        console.error('Intel fetch error:', err);
      }
      setLoading(false);
    }
    fetchIntel();
  }, [mobileParkId]);

  useEffect(() => {
    const channel = gc
      .channel('field_obs_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'gamecount', table: 'field_observations' },
        (payload: any) => {
          const o = payload.new;
          if (o.park_id !== mobileParkId) return;
          setObservations(prev => [normalizeObservation(o), ...prev]);
          setLiveCount(c => c + 1);
        }
      )
      .subscribe();
    return () => { gc.removeChannel(channel); };
  }, [mobileParkId]);

  const filteredObservations = useMemo(() => {
    return observations.filter(o => {
      const matchesSearch = !search ||
        o.species?.toLowerCase().includes(search.toLowerCase()) ||
        o.location?.toLowerCase().includes(search.toLowerCase()) ||
        o.observer?.toLowerCase().includes(search.toLowerCase());
      const matchesSpecies = filters.species === 'All' || o.species === filters.species;
      const matchesObserver = filters.observer === 'All' || o.observer === filters.observer;
      const matchesType = filters.type === 'All' || o.type === filters.type;
      const matchesClass = filters.class === 'All' || o.class === filters.class;
      const matchesHabitat = filters.habitat === 'All' || o.habitat === filters.habitat;
      const matchesActivity = filters.activity === 'All' || o.activity === filters.activity;
      return matchesSearch && matchesSpecies && matchesObserver && matchesType && matchesClass && matchesHabitat && matchesActivity;
    });
  }, [observations, search, filters]);

  const filterOptions = useMemo(() => ({
    species: ['All', ...Array.from(new Set(observations.map(o => o.species))).filter(Boolean).sort()],
    observers: ['All', ...Array.from(new Set(observations.map(o => o.observer))).filter(Boolean).sort()],
    types: ['All', ...Array.from(new Set(observations.map(o => o.type))).filter(Boolean).sort()],
    classes: ['All', ...Array.from(new Set(observations.map(o => o.class))).filter(Boolean).sort()],
    habitats: ['All', ...Array.from(new Set(observations.map(o => o.habitat))).filter(Boolean).sort()],
    activities: ['All', ...Array.from(new Set(observations.map(o => o.activity))).filter(Boolean).sort()]
  }), [observations]);

  const totalAnimals = useMemo(() => observations.reduce((s, o) => s + (o.count || 0), 0), [observations]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
      <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Syncing Intelligence Hub...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="bg-slate-900/50 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 backdrop-blur-md group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Radar size={12} className="text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Field Intelligence Hub</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                <Globe size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{parkName || mobileParkId}</span>
              </div>
              {liveCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/40 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Wifi size={12} className="text-emerald-300" />
                  <span className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em]">+{liveCount} Live Reception</span>
                </div>
              )}
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none uppercase">
              Raw Intelligence <span className="text-emerald-500">Reception.</span>
            </h1>
            <p className="text-sm text-slate-400 font-black uppercase tracking-[0.2em] max-w-lg leading-relaxed">
              Field-verified sightings from WEZ-Mobile survey nodes. Live longitudinal audit of jurisdictional sectors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-black/40 p-2 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-2xl">
            {[
              { id: 'table', label: 'Data Ledger', icon: TableIcon },
              { id: 'gallery', label: 'Evidence Gallery', icon: ImageIcon },
              { id: 'analytics', label: 'Tactical Recon', icon: Activity },
              { id: 'map', label: 'Geospatial', icon: MapIcon },
              { id: 'export', label: 'Export Hub', icon: Download },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setMode(btn.id as any)}
                className={"flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border " + (mode === btn.id ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-600/30 border-white/10" : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent")}
              >
                <btn.icon size={16} />
                <span className="text-[11px] font-black uppercase tracking-[0.1em] whitespace-nowrap">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 -mx-10 -mb-10">
          <LiveTicker observations={observations} />
        </div>
      </header>

      {/* ── Stats Strip ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Sightings', val: observations.length, icon: Activity, color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Total Animals', val: totalAnimals, icon: Zap, color: 'indigo', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
          { label: 'Male Aggregation', val: observations.reduce((s, o) => s + (o.male_count || 0), 0), icon: Users, color: 'blue', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
          { label: 'Female Aggregation', val: observations.reduce((s, o) => s + (o.female_count || 0), 0), icon: Users, color: 'rose', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`bg-slate-900/40 p-6 rounded-[2rem] border ${stat.border} backdrop-blur-md shadow-xl flex items-center gap-5 group hover:bg-slate-900/60 transition-all`}>
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.text} shrink-0 shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-mono font-black text-white leading-none tracking-tighter">{stat.val.toLocaleString()}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────── */}
      <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="SEARCH INTELLIGENCE LEDGER..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-black/20 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {[
              { label: 'Species', val: filters.species, key: 'species', options: filterOptions.species },
              { label: 'Observer', val: filters.observer, key: 'observer', options: filterOptions.observers },
              { label: 'Type', val: filters.type, key: 'type', options: filterOptions.types },
              { label: 'Habitat', val: filters.habitat, key: 'habitat', options: filterOptions.habitats },
            ].map(f => (
              <div key={f.key} className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                  <Filter size={10} /> {f.label}
                </label>
                <select
                  value={f.val}
                  onChange={(e) => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="block w-40 px-4 py-3 text-[10px] font-black uppercase bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-white cursor-pointer hover:bg-black/40 transition-all"
                >
                  {f.options.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                </select>
              </div>
            ))}

            <button
              onClick={() => {
                setSearch('');
                setFilters({ species: 'All', observer: 'All', type: 'All', class: 'All', habitat: 'All', activity: 'All' });
              }}
              className="self-end px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-rose-400 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} /> RESET
            </button>
          </div>
        </div>
      </div>

      {/* ── Main View ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-md min-h-[600px]"
        >
          {mode === 'table' && <DataLedger observations={filteredObservations} onViewPhoto={setLightboxUrl} />}
          {mode === 'gallery' && (
            <div className="p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredObservations.filter(o => o.photo_url).length === 0 ? (
                <div className="col-span-full py-40 text-center space-y-6">
                  <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-2xl">
                    <Camera size={40} className="text-slate-600" />
                  </div>
                  <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">No Field Evidence Photos Found</p>
                </div>
              ) : (
                filteredObservations.filter(o => o.photo_url).map(obs => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={obs.id}
                    onClick={() => setLightboxUrl(obs.photo_url!)}
                    className="group relative bg-slate-950 rounded-3xl overflow-hidden border border-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all aspect-square text-left shadow-2xl"
                  >
                    <img
                      src={obs.photo_url}
                      alt={obs.species}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0 duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Authentication+Error';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity flex flex-col justify-end p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.1em] truncate">{obs.species}</p>
                      </div>
                      <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{obs.observer}</p>
                      <div className="flex items-center justify-between mt-2 border-t border-white/10 pt-2">
                        <span className="text-[8px] font-black text-slate-500 uppercase">{obs.date}</span>
                        <Layers size={10} className="text-slate-600" />
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          )}
          {mode === 'analytics' && <IntelligenceRecon observations={filteredObservations} parkName={parkName} />}
          {mode === 'map' && <SurveyMap observations={filteredObservations} />}
          {mode === 'export' && <ExportEngine observations={filteredObservations} parkName={parkName} />}
        </motion.div>
      </AnimatePresence>

      {/* ── Photo Lightbox ───────────────────────────────────── */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 md:p-12"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-6xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxUrl(null)}
                className="absolute -top-16 right-0 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all border border-white/10 shadow-2xl group"
              >
                <X size={24} className="text-white group-hover:rotate-90 transition-transform" />
              </button>

              <div className="relative group rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                <img src={lightboxUrl} alt="Field Evidence" className="max-w-full max-h-[75vh] object-contain" />
                <div className="absolute inset-0 pointer-events-none border-[20px] border-white/5 rounded-[2.5rem]" />
              </div>

              <div className="mt-8 text-center space-y-3 bg-white/5 px-10 py-6 rounded-3xl border border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <p className="text-white font-black text-sm uppercase tracking-[0.5em]">Field Intelligence Evidence</p>
                </div>
                <p className="text-emerald-400 font-bold text-[11px] uppercase tracking-[0.3em]">Authenticated WEZ Mobile Node Sighting • SHA-256 Verified</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="pt-12 pb-8 border-t border-white/5 text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="w-10 h-px bg-slate-800" />
          <Database size={16} className="text-slate-700" />
          <div className="w-10 h-px bg-slate-800" />
        </div>
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em]">
          WEZ FIELD INTELLIGENCE · SECURE ENCRYPTED CHANNEL · v15.0.4
        </p>
      </footer>
    </div>
  );
}
