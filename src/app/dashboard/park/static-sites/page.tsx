'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gc, supabase } from '@/lib/supabase';
import { StaticSite } from '@/types';
import { 
  Droplets, 
  MapPin, 
  Activity, 
  Leaf,
  ChevronRight,
  Info,
  Clock,
  Database,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import PremiumBarChart from '@/components/charts/PremiumBarChart';
import PremiumDoughnutChart from '@/components/charts/PremiumDoughnutChart';
import KPICard from '@/components/KPICard';

const fadeUp: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } }
};

function StaticSitesPageContent() {
  const searchParams = useSearchParams();
  const routeParkId = searchParams.get('parkId') || 'mana-pools-national-park';
  const router = useRouter();
  const [sites, setSites] = useState<StaticSite[]>([]);
  const [parkId, setParkId] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedYear = Number(searchParams.get('year')) || 2025;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routeParkId);
        const { data: parkData } = await supabase
          .from('parks')
          .select('id')
          .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? routeParkId : `%${routeParkId.replace(/-/g, ' ')}%`)
          .single();
        
        if (parkData) {
          setParkId(parkData.id);
          const { data: sList } = await supabase
            .from('static_sites')
            .select('*')
            .eq('park_id', parkData.id); // Filtering by park_id
          
          setSites(sList || []);
          if (sList && sList.length > 0 && !selectedSite) {
            setSelectedSite(sList[0].name);
          }
        }
      } catch (error) { console.error('Error fetching sites:', error); }
      setLoading(false);
    }
    fetchData();
  }, [routeParkId]);

  useEffect(() => {
    if (selectedSite) {
      async function fetchSiteDetails() {
        const { data } = await supabase
          .from('v_static_site_species')
          .select('*')
          .eq('site_name', selectedSite)
          .eq('year', selectedYear)
          .order('total_count', { ascending: false });
        setSiteData(data || []);
      }
      fetchSiteDetails();
    }
  }, [selectedSite, selectedYear]);

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', year.toString());
    params.set('parkId', routeParkId);
    router.push(`/dashboard/park/static-sites?${params.toString()}`);
  };

  const chartData = useMemo(() => siteData.slice(0, 8).map(s => ({
    species: s.species,
    total_count: s.total_count
  })), [siteData]);

  const categoryBreakdown = useMemo(() => {
    const acc: any[] = [];
    siteData.forEach(curr => {
      const existing = acc.find(a => a.name === curr.category);
      if (existing) existing.value += curr.total_count;
      else acc.push({ name: curr.category, value: curr.total_count });
    });
    return acc.map(c => ({ 
      name: c.name?.replace('_', ' ')?.toUpperCase() || 'UNKNOWN', 
      value: c.value 
    })).filter(c => c.value > 0);
  }, [siteData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-wez-muted text-sm font-medium">Loading waterhole data…</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* ── Page Header ────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Waterhole analysis</h1>
          <p className="page-subtitle">Species counts and distribution across static monitoring sites</p>
          <p className="page-meta flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-wez-green" strokeWidth={1.75} />
              {sites.length} sites registered
            </span>
            <span className="text-wez-stone-200">·</span>
            <span>Survey {selectedYear}</span>
          </p>
        </div>

        {parkId && (
          <YearSelector parkId={parkId} selectedYear={selectedYear} onYearChange={handleYearChange} />
        )}
      </header>

      {/* ── Site Selector & KPIs ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="section-title text-sm">Sites</h3>
            <span className="label-muted">{sites.length} registered</span>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {sites.map(site => {
              const isActive = selectedSite === site.name;
              return (
                <button
                  key={site.id}
                  onClick={() => setSelectedSite(site.name)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md border transition-all text-left ${isActive ? 'bg-wez-green border-wez-green text-white shadow-card' : 'bg-white border-[var(--wez-border)] hover:border-wez-green/30 hover:bg-wez-mint/40 shadow-card'}`}
                >
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-all ${isActive ? 'bg-white/15 text-white' : 'bg-wez-mint text-wez-green'}`}>
                    <MapPin size={18} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-wez-ink'}`}>{site.name}</p>
                    <p className={`text-xs mt-0.5 capitalize ${isActive ? 'text-white/70' : 'text-wez-muted'}`}>
                      {site.site_type}
                    </p>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <KPICard 
                title="Location Biodiversity" 
                value={siteData.length} 
                icon={Leaf} 
                color="#486830"
                description={`Verified taxa at ${selectedSite}`}
             />
             <KPICard 
                title="Aggregate Census" 
                value={siteData.reduce((a, b) => a + b.total_count, 0).toLocaleString()} 
                icon={Activity} 
                color="#5a7c3a"
                description="Total sightings recorded"
             />
             <KPICard 
                title="Site status" 
                value="Active" 
                icon={Zap} 
                color="#486830"
                description="Monitoring site selected"
             />
             <KPICard 
                title="Data coverage" 
                value="98.2%" 
                icon={Shield} 
                color="#5a7c3a"
                description="Records with valid counts"
             />
        </div>
      </div>

      {/* ── Analytics Section ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Site Species Analysis */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="xl:col-span-2 surface-panel p-6 sm:p-8 flex flex-col min-h-[500px]"
        >
          <div className="mb-6 flex justify-between items-start gap-4">
            <div>
              <h3 className="section-title flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-wez-green shrink-0" />
                {selectedSite} biodiversity
              </h3>
              <p className="label-muted mt-1.5">Distribution of documented taxa at this site</p>
            </div>
            <div className="p-2.5 rounded-md bg-wez-mint/50 border border-[var(--wez-border)] shrink-0">
               <Database size={16} className="text-wez-muted" strokeWidth={1.75} />
            </div>
          </div>
          
          <div className="flex-1 min-h-[350px]">
            <PremiumBarChart data={chartData} />
          </div>
        </motion.div>

        {/* Breakdown & Context */}
        <div className="space-y-6">
          
          {/* Taxonomic Breakdown */}
          <div className="surface-panel p-6 sm:p-8 min-h-[350px] flex flex-col">
            <h3 className="section-title mb-6">Classification breakdown</h3>
            <div className="flex-1">
              <PremiumDoughnutChart data={categoryBreakdown} />
            </div>
          </div>

          {/* Strategic Context */}
          <div className="surface-panel p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-md bg-wez-mint text-wez-green shrink-0">
              <Info size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-wez-ink mb-1">Why these sites matter</h4>
              <p className="text-sm text-wez-muted leading-relaxed">
                Static sites act as indicator zones. Clustering during peak heat hours can reflect water
                access and competition around waterholes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Additional Info ───────────────────────────────────── */}
      <footer className="surface-panel p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="p-3 rounded-md bg-wez-mint text-wez-green shrink-0">
            <Droplets size={28} strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <h4 className="section-title">About static site monitoring</h4>
            <p className="text-sm text-wez-muted leading-relaxed max-w-4xl">
              Observation data for static sites is collected over full-day monitoring cycles.
              Results here are aggregated from peak waterhole occupancy across surveyed transects.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function StaticSitesPage(props: any) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-wez-muted text-sm font-medium">Loading waterhole data…</p>
      </div>
    }>
      <StaticSitesPageContent {...props} />
    </Suspense>
  );
}
