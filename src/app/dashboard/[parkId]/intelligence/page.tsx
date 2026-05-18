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
  Camera
} from 'lucide-react';
import KPICard from '@/components/KPICard';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import DataLedger from '@/components/intel/DataLedger';
import ExportEngine from '@/components/intel/ExportEngine';
import dynamic from 'next/dynamic';
import LiveTicker from '@/components/intel/LiveTicker';

const IntelligenceRecon = dynamic(() => import('@/components/intel/IntelligenceRecon'), { ssr: false });

const SurveyMap = dynamic(() => import('@/components/intel/SurveyMap'), { 
  ssr: false,
  loading: () => <div className="h-[500px] bg-slate-50 rounded-2xl flex items-center justify-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing Map Node...</div>
});

/**
 * Normalizes a route param like "mana-pools-national-park" → "mana-pools"
 * to match the park_id values stored by the mobile app.
 */
function routeParamToParkId(routeParam: string): string {
  // The mobile static lookup uses short slugs: 'mana-pools', 'hwange', 'hurungwe' etc.
  // The route param is the full URL-friendly park name. Map the known ones.
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
    // If it's a local file path from mobile, extract the filename to try and find it in our cloud storage
    if (payload.photo_uri.includes('ImagePicker') || payload.photo_uri.startsWith('file://')) {
       const fileName = payload.photo_uri.split('/').pop();
       url = fileName;
    } else {
       url = payload.photo_uri;
    }
  }
  
  if (!url) return null;
  
  // If it's already a full URL, return it
  if (url.startsWith('http')) return url;
  
  // If it's a relative path (e.g. obs_123.jpg), prepend the Supabase public storage URL
  // Project ID: pqfbcvxisrmtmhmuxbjk
  const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
  
  // Clean up the URL - remove leading slashes or 'photos/' if it's already there
  let cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  if (cleanUrl.startsWith('photos/')) {
    cleanUrl = cleanUrl.replace('photos/', '');
  }
  
  return `${supabaseUrl}/storage/v1/object/public/photos/${cleanUrl}`;
}

function normalizeObservation(o: any) {
  const p = o.payload || {};
  const adultSum = (Number(p.adult_m)||0) + (Number(p.adult_f)||0) + (Number(p.adult_u)||0);
  const subSum   = (Number(p.sub_adult_m)||0) + (Number(p.sub_adult_f)||0) + (Number(p.sub_adult_u)||0);
  const juvSum   = (Number(p.juv_m)||0) + (Number(p.juv_f)||0) + (Number(p.juv_u)||0);
  const total    = adultSum + subSum + juvSum;

  return {
    id:         o.id,
    type:       o.survey_type   || p.survey_type   || 'Unknown',
    species:    (o.species_name && o.species_name !== 'undefined') ? o.species_name : 
                (p.species_name && p.species_name !== 'undefined') ? p.species_name : 
                (p.other_species && p.other_species !== 'undefined') ? p.other_species : 
                (o.species_id && o.species_id !== 'undefined') ? o.species_id : 'Unidentified',
    class:      o.classification || p.classification || 'N/A',
    count:      total || 1,
    location:   o.transect_id  || o.static_site_id || p.transect_id || p.static_site_id || 'General',
    meta:       p.session_slot || o.period_of_day || 'N/A',
    time:       p.session_time || (o.synced_at || o.created_at || '').split('T')[1]?.substring(0, 5) || '',
    sex:        'Mixed',
    age:        'Mixed',
    date:       p.session_date || (o.created_at || '').split('T')[0] || '',
    day_of_week:   o.day_of_week   || p.day_of_week   || '',
    period_of_day: o.period_of_day || p.period_of_day || '',
    observer:   o.team_leader   || p.team_leader_name || 'Mobile Node',
    distance:   p.distance || '0',
    bearing:    p.bearing  || '0',
    lat:        o.lat  || p.lat  || null,
    lng:        o.long || p.long || null,
    accuracy:   o.accuracy || p.accuracy || '5',
    habitat:    p.habitat  || 'N/A',
    activity:   p.activity || 'N/A',
    photo_url:  resolvePhotoUrl(o.photo_url, p),
    park_name:  o.park_name || p.park_name || o.park_id || '',
    male_count:    o.male_count    || 0,
    female_count:  o.female_count  || 0,
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
  const [syncError, setSyncError] = useState(false);
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

  const handleDownloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `WEZ_Evidence_${new Date().getTime()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    async function fetchIntel() {
      if (!mobileParkId) return;
      
      setLoading(true);
      setSyncError(false);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn('[Intel] Sync timeout - resolving with cached/empty state');
        setLoading(false);
      }, 10000);

      try {
        const { data: fieldObs, error } = await gc
          .from('field_observations')
          .select('*')
          .eq('park_id', mobileParkId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const normalized = (fieldObs || [])
          .filter(Boolean)
          .map(o => {
            try {
              return normalizeObservation(o);
            } catch (e) {
              console.error('[Intel] Normalization failed for record:', o.id, e);
              return null;
            }
          })
          .filter(Boolean) as any[];

        setObservations(normalized);

        if (normalized.length > 0) {
          setParkName(normalized[0].park_name || mobileParkId);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.warn('[Intel] Fetch aborted');
        } else {
          console.error('[Intel] Fetch error:', err);
          setSyncError(true);
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
    fetchIntel();
  }, [mobileParkId]);

  // ── Real-Time Listener (gamecount schema) ──────────────────────
  useEffect(() => {
    const channel = gc
      .channel('field_obs_live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'gamecount',
          table: 'field_observations',
        },
        (payload: any) => {
          const o = payload.new;
          // Only show records for this park
          if (o.park_id !== mobileParkId) return;
          setObservations(prev => [normalizeObservation(o), ...prev]);
          setLiveCount(c => c + 1);
        }
      )
      .subscribe();

    return () => { gc.removeChannel(channel); };
  }, [mobileParkId]);
  // ────────────────────────────────────────────────────────────────

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

  // ── Unique Filter Options ──────────────────────────────────────
  const filterOptions = useMemo(() => ({
    species: ['All', ...Array.from(new Set(observations.map(o => o.species))).filter(Boolean).sort()],
    observers: ['All', ...Array.from(new Set(observations.map(o => o.observer))).filter(Boolean).sort()],
    types: ['All', ...Array.from(new Set(observations.map(o => o.type))).filter(Boolean).sort()],
    classes: ['All', ...Array.from(new Set(observations.map(o => o.class))).filter(Boolean).sort()],
    habitats: ['All', ...Array.from(new Set(observations.map(o => o.habitat))).filter(Boolean).sort()],
    activities: ['All', ...Array.from(new Set(observations.map(o => o.activity))).filter(Boolean).sort()]
  }), [observations]);

  // ── Computed stats ─────────────────────────────────────────────
  const totalAnimals = useMemo(() => observations.reduce((s, o) => s + (o.count || 0), 0), [observations]);
  const uniqueSpecies = useMemo(() => new Set(observations.map(o => o.species)).size, [observations]);
  const uniqueObservers = useMemo(() => new Set(observations.map(o => o.observer)).size, [observations]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Syncing Intelligence Hub...</p>
    </div>
  );

  if (syncError && observations.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center px-4">
      <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
        <Wifi size={32} className="opacity-50" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-display font-black text-slate-900 uppercase">Synchronisation Interrupted</h3>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest max-w-xs mx-auto">
          Connection to the field node timed out. Registry verification may be incomplete.
        </p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all"
      >
        Retry Registry Sync
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 topographic-bg min-h-screen">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="glass-card bg-white/80 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-700 group-hover:scale-150" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                <Radar size={10} className="text-emerald-600 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Field Intelligence Hub</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100">
                <Globe size={10} className="text-slate-400" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{parkName || mobileParkId}</span>
              </div>
              {liveCount > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200 animate-pulse">
                  <Wifi size={10} className="text-emerald-500" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">+{liveCount} Live</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight leading-none uppercase">
              Raw Intelligence <span className="text-emerald-600 underline decoration-emerald-600/30 decoration-4 underline-offset-8">Reception.</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium max-w-lg leading-relaxed font-sans">
              Field-verified sightings from WEZ-Mobile survey nodes. Live longitudinal audit of jurisdictional sectors.
            </p>
          </div>

            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200 shadow-inner">
            {[
              { id: 'table', label: 'Data Ledger', icon: TableIcon },
              { id: 'gallery', label: 'Evidence Gallery', icon: ImageIcon },
              { id: 'analytics', label: 'Tactical Recon', icon: Activity },
              { id: 'map',   label: 'Geospatial',  icon: MapIcon },
              { id: 'export', label: 'Export Data', icon: Download },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setMode(btn.id as any)}
                className={"flex items-center gap-2 px-4 py-2 rounded-xl transition-all " + (mode === btn.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50")}
              >
                <btn.icon size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap font-display">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Ticker integration in header area or just below */}
        <div className="mt-6 -mx-6 -mb-6">
           <LiveTicker observations={observations} />
        </div>
      </header>

      {/* ── Stats Strip ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-lg font-mono font-black text-slate-900 leading-none">{observations.length.toLocaleString()}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 font-display">Sightings</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <div className="text-lg font-mono font-black text-slate-900 leading-none">{totalAnimals.toLocaleString()}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 font-display">Total Animals</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="text-lg font-mono font-black text-slate-900 leading-none">
                {observations.reduce((s, o) => s + (o.male_count || 0), 0).toLocaleString()}
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 font-display">Male Aggregation</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="text-lg font-mono font-black text-slate-900 leading-none">
                {observations.reduce((s, o) => s + (o.female_count || 0), 0).toLocaleString()}
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 font-display">Female Aggregation</div>
          </div>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search sightings, locations, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Species</label>
              <select 
                value={filters.species}
                onChange={(e) => setFilters(prev => ({ ...prev, species: e.target.value }))}
                className="block w-32 px-3 py-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {filterOptions.species.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Observer</label>
              <select 
                value={filters.observer}
                onChange={(e) => setFilters(prev => ({ ...prev, observer: e.target.value }))}
                className="block w-32 px-3 py-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {filterOptions.observers.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Survey Type</label>
              <select 
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="block w-32 px-3 py-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {filterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Classification</label>
              <select 
                value={filters.class}
                onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                className="block w-32 px-3 py-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {filterOptions.classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Habitat</label>
              <select 
                value={filters.habitat}
                onChange={(e) => setFilters(prev => ({ ...prev, habitat: e.target.value }))}
                className="block w-32 px-3 py-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {filterOptions.habitats.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Activity</label>
              <select 
                value={filters.activity}
                onChange={(e) => setFilters(prev => ({ ...prev, activity: e.target.value }))}
                className="block w-32 px-3 py-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {filterOptions.activities.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <button 
              onClick={() => {
                setSearch('');
                setFilters({ species: 'All', observer: 'All', type: 'All', class: 'All', habitat: 'All', activity: 'All' });
              }}
              className="mt-4 px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Main View ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm min-h-[500px]"
        >
          {mode === 'table'  && <DataLedger observations={filteredObservations} onViewPhoto={setLightboxUrl} />}
          {mode === 'gallery' && (
            <div className="p-6 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredObservations.filter(o => o.photo_url).length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <Camera size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No Field Evidence Photos Found</p>
                </div>
              ) : (
                filteredObservations.filter(o => o.photo_url).map(obs => (
                  <button 
                    key={obs.id} 
                    onClick={() => setLightboxUrl(obs.photo_url!)}
                    className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all aspect-square text-left"
                  >
                    <img 
                      src={obs.photo_url} 
                      alt={obs.species} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-[10px] font-black text-white uppercase truncate">{obs.species}</p>
                      <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">{obs.observer}</p>
                      <p className="text-[7px] text-slate-300 mt-1">{obs.date}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
          {mode === 'analytics' && <IntelligenceRecon observations={filteredObservations} parkName={parkName} />}
          {mode === 'map'    && <SurveyMap  observations={filteredObservations} />}
          {mode === 'export' && <ExportEngine observations={filteredObservations} parkName={parkName} />}
        </motion.div>
      </AnimatePresence>

      {/* ── Photo Lightbox ───────────────────────────────────── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
            <button
              onClick={() => handleDownloadImage(lightboxUrl)}
              className="absolute -top-12 right-14 px-4 h-10 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center gap-2 transition-colors text-white font-black text-[10px] uppercase tracking-widest"
            >
              <Download size={14} /> Download Asset
            </button>
            <img src={lightboxUrl} alt="Field Evidence" className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl border border-white/10 object-contain" />
            <div className="mt-6 text-center space-y-1">
              <p className="text-white font-black text-xs uppercase tracking-[0.3em]">Field Intelligence Evidence</p>
              <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">Authenticated WEZ Mobile Node Sighting</p>
            </div>
          </div>
        </div>
      )}

      <footer className="pt-4 pb-2 border-t border-slate-100 text-center">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">
          WEZ FIELD INTELLIGENCE · LIVE DATA FROM gamecount.field_observations
        </p>
      </footer>
    </div>
  );
}
