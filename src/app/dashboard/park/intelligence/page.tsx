'use client';



import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
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
  loading: () => <div className="h-[500px] bg-wez-stone/40 rounded-md flex items-center justify-center animate-pulse text-wez-muted text-sm font-medium">Loading map…</div>
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

function IntelligenceHubPageContent() {
  const searchParams = useSearchParams();
  const routeParkId = searchParams.get('parkId') || 'mana-pools-national-park';
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
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-wez-muted text-sm font-medium">Loading intelligence hub…</p>
    </div>
  );

  if (syncError && observations.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-5 text-center px-4">
      <div className="w-14 h-14 bg-rose-50 rounded-md flex items-center justify-center text-rose-500 border border-rose-100">
        <Wifi size={28} className="opacity-60" />
      </div>
      <div className="space-y-2">
        <h3 className="page-title text-xl">Connection interrupted</h3>
        <p className="page-subtitle max-w-sm mx-auto mt-0">
          Could not reach the field data source. Some records may be incomplete.
        </p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="btn-primary px-6 py-2.5 text-sm"
      >
        Retry sync
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 min-h-screen">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="surface-panel rounded-md border-[var(--wez-border)] p-5 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="page-title">Intelligence hub</h1>
            <p className="page-subtitle">
              Field-verified sightings from WEZ-Mobile survey nodes.
            </p>
            <p className="page-meta flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <Radar size={13} className="text-wez-green" strokeWidth={1.75} />
                Field intelligence
              </span>
              <span className="text-wez-stone-200">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Globe size={13} className="text-wez-muted" strokeWidth={1.75} />
                {parkName || mobileParkId}
              </span>
              {liveCount > 0 && (
                <>
                  <span className="text-wez-stone-200">·</span>
                  <span className="inline-flex items-center gap-1.5 text-wez-green">
                    <Wifi size={13} strokeWidth={1.75} />
                    +{liveCount} live
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
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
                className={"flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all " + (mode === btn.id ? "bg-wez-green text-white" : "bg-white border border-[var(--wez-border)] text-wez-ink hover:border-wez-green/30")}
              >
                <btn.icon size={14} strokeWidth={1.75} />
                <span className="whitespace-nowrap">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Ticker integration in header area or just below */}
        <div className="mt-5 -mx-5 -mb-5 border-t border-[var(--wez-border)]">
           <LiveTicker observations={observations} />
        </div>
      </header>

      {/* ── Stats Strip ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Sightings" value={observations.length.toLocaleString()} icon={Activity} color="#486830" />
        <KPICard title="Total animals" value={totalAnimals.toLocaleString()} icon={Zap} color="#5a7c3a" />
        <KPICard
          title="Male aggregation"
          value={observations.reduce((s, o) => s + (o.male_count || 0), 0).toLocaleString()}
          icon={Users}
          color="#486830"
        />
        <KPICard
          title="Female aggregation"
          value={observations.reduce((s, o) => s + (o.female_count || 0), 0).toLocaleString()}
          icon={Users}
          color="#5a7c3a"
        />
      </div>

      {/* ── Filters ───────────────────────────────────────── */}
      <div className="surface-panel rounded-md border-[var(--wez-border)] p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-wez-muted" size={14} />
            <input
              type="text"
              placeholder="Search sightings, locations, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-wez-stone/40 border border-[var(--wez-border)] rounded-md text-sm text-wez-ink focus:ring-2 focus:ring-wez-green/20 focus:border-wez-green outline-none transition"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="space-y-1">
              <label className="label-muted px-1">Species</label>
              <select 
                value={filters.species}
                onChange={(e) => setFilters(prev => ({ ...prev, species: e.target.value }))}
                className="block w-32 px-3 py-2 text-sm bg-white border border-[var(--wez-border)] rounded-md outline-none focus:ring-2 focus:ring-wez-green/20 focus:border-wez-green"
              >
                {filterOptions.species.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="label-muted px-1">Observer</label>
              <select 
                value={filters.observer}
                onChange={(e) => setFilters(prev => ({ ...prev, observer: e.target.value }))}
                className="block w-32 px-3 py-2 text-sm bg-white border border-[var(--wez-border)] rounded-md outline-none focus:ring-2 focus:ring-wez-green/20 focus:border-wez-green"
              >
                {filterOptions.observers.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="label-muted px-1">Survey type</label>
              <select 
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="block w-32 px-3 py-2 text-sm bg-white border border-[var(--wez-border)] rounded-md outline-none focus:ring-2 focus:ring-wez-green/20 focus:border-wez-green"
              >
                {filterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="label-muted px-1">Classification</label>
              <select 
                value={filters.class}
                onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                className="block w-32 px-3 py-2 text-sm bg-white border border-[var(--wez-border)] rounded-md outline-none focus:ring-2 focus:ring-wez-green/20 focus:border-wez-green"
              >
                {filterOptions.classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="label-muted px-1">Habitat</label>
              <select 
                value={filters.habitat}
                onChange={(e) => setFilters(prev => ({ ...prev, habitat: e.target.value }))}
                className="block w-32 px-3 py-2 text-sm bg-white border border-[var(--wez-border)] rounded-md outline-none focus:ring-2 focus:ring-wez-green/20 focus:border-wez-green"
              >
                {filterOptions.habitats.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="label-muted px-1">Activity</label>
              <select 
                value={filters.activity}
                onChange={(e) => setFilters(prev => ({ ...prev, activity: e.target.value }))}
                className="block w-32 px-3 py-2 text-sm bg-white border border-[var(--wez-border)] rounded-md outline-none focus:ring-2 focus:ring-wez-green/20 focus:border-wez-green"
              >
                {filterOptions.activities.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <button 
              onClick={() => {
                setSearch('');
                setFilters({ species: 'All', observer: 'All', type: 'All', class: 'All', habitat: 'All', activity: 'All' });
              }}
              className="mt-4 px-3 py-2 label-muted hover:text-rose-600 transition-colors"
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
          className="surface-panel rounded-md border-[var(--wez-border)] overflow-hidden min-h-[500px]"
        >
          {mode === 'table'  && <DataLedger observations={filteredObservations} onViewPhoto={setLightboxUrl} />}
          {mode === 'gallery' && (
            <div className="p-5 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredObservations.filter(o => o.photo_url).length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <Camera size={36} className="mx-auto text-wez-faint mb-3" strokeWidth={1.5} />
                  <p className="label-muted">No field evidence photos found</p>
                </div>
              ) : (
                filteredObservations.filter(o => o.photo_url).map(obs => (
                  <button 
                    key={obs.id} 
                    onClick={() => setLightboxUrl(obs.photo_url!)}
                    className="group relative bg-wez-stone/30 rounded-md overflow-hidden border border-[var(--wez-border)] hover:border-wez-green/25 transition-all aspect-square text-left"
                  >
                    <img 
                      src={obs.photo_url} 
                      alt={obs.species} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wez-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                      <p className="text-sm font-semibold text-white truncate">{obs.species}</p>
                      <p className="text-xs text-wez-mint">{obs.observer}</p>
                      <p className="text-xs text-white/60 mt-0.5">{obs.date}</p>
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
          className="fixed inset-0 z-[100] bg-wez-ink/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={22} className="text-white" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => handleDownloadImage(lightboxUrl)}
              className="absolute -top-12 right-14 px-4 h-10 bg-wez-green hover:bg-wez-green/90 rounded-full flex items-center justify-center gap-2 transition-colors text-white text-sm font-medium"
            >
              <Download size={14} strokeWidth={1.75} /> Download
            </button>
            <img src={lightboxUrl} alt="Field Evidence" className="max-w-full max-h-[80vh] rounded-md shadow-2xl border border-white/10 object-contain" />
            <div className="mt-5 text-center space-y-1">
              <p className="text-white text-sm font-semibold">Field evidence</p>
              <p className="text-wez-mint text-xs">Authenticated WEZ Mobile sighting</p>
            </div>
          </div>
        </div>
      )}

      <footer className="pt-4 pb-2 border-t border-[var(--wez-border)] text-center">
        <p className="label-muted">
          WEZ Field Intelligence · Live data from gamecount.field_observations
        </p>
      </footer>
    </div>
  );
}

export default function IntelligenceHubPage(props: any) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-wez-muted text-sm font-medium">Loading intelligence hub…</p>
      </div>
    }>
      <IntelligenceHubPageContent {...props} />
    </Suspense>
  );
}
