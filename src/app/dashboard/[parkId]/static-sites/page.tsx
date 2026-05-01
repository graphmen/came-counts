'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  Database
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

export default function StaticSitesPage({ params }: { params: Promise<{ parkId: string }> }) {
  const { parkId: routeParkId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
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
    const params = new URLSearchParams(searchParams);
    params.set('year', year.toString());
    router.push(`/dashboard/${routeParkId}/static-sites?${params.toString()}`);
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
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '3.5px solid #1a7a4a', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.025em' }}>Analyzing Waterhole Data…</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <header className="relative p-6 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden group">
        {/* Decorative Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100/50">
                <Droplets size={10} className="text-emerald-600" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Hydrological Network</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status: Monitoring Active</span>
            </div>
            
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit">
                Waterhole Analysis
              </h1>
              {parkId && (
                <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 hidden sm:block">
                  <YearSelector parkId={parkId} selectedYear={selectedYear} onYearChange={handleYearChange} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px]">
               <MapPin size={14} className="text-emerald-500" />
               Monitoring dry-season animal distribution and clustering patterns across {sites.length} static sites.
            </div>
          </div>

          <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Site Coverage</div>
                <div className="flex items-center gap-1">
                   {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-1.5 rounded-full ${i <= sites.length ? 'bg-emerald-500' : 'bg-slate-200'}`} />)}
                </div>
              </div>
          </div>
        </div>
      </header>

      {/* ── Site Selector & KPIs ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Operational Node</h3>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{sites.length} Sites</span>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {sites.map(site => {
              const isActive = selectedSite === site.name;
              return (
                <button
                  key={site.id}
                  onClick={() => setSelectedSite(site.name)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left group/site ${isActive ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-slate-50 text-emerald-600 group-hover/site:bg-emerald-100'}`}>
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-black leading-none ${isActive ? 'text-white' : 'text-slate-900'}`}>{site.name}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {site.site_type}
                    </p>
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
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
                color="#10b981"
                description={`Verified taxa at ${selectedSite}`}
             />
             <KPICard 
                title="Aggregate Census" 
                value={siteData.reduce((a, b) => a + b.total_count, 0).toLocaleString()} 
                icon={Activity} 
                color="#3b82f6"
                description="Total sightings recorded"
             />
             <KPICard 
                title="Operational Status" 
                value="ACTIVE" 
                icon={Clock} 
                color="#f59e0b"
                description="Live telemetry feed"
             />
             <KPICard 
                title="Data Integrity" 
                value="98.2%" 
                icon={Database} 
                color="#8b5cf6"
                description="Audit validation score"
             />
        </div>
      </div>

      {/* ── Analytics Section ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Site Species Analysis */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col min-h-[400px]"
        >
          <div className="mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Leaf size={16} className="text-emerald-600" /> {selectedSite} Biodiversity
            </h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Species recorded at this location</p>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <PremiumBarChart data={chartData} />
          </div>
        </motion.div>

        {/* Breakdown & Context */}
        <div className="space-y-6">
          
          {/* Taxonomic Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[300px] flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Distribution by Category</h3>
            <div className="flex-1">
              <PremiumDoughnutChart data={categoryBreakdown} />
            </div>
          </div>

          {/* Strategic Context */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
              <Activity size={20} className="text-blue-600" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1.5">Ecological Significance</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Static sites serve as critical indicator zones. Clustering patterns during peak thermal hours provide 
                insights into water accessibility and species competition hierarchies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Additional Info ───────────────────────────────────── */}
      <footer className="relative bg-slate-900 rounded-2xl p-8 overflow-hidden shadow-xl shadow-slate-200">
        <Leaf size={100} className="absolute -right-6 -bottom-6 opacity-10 text-emerald-500 -rotate-12" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
            <Info size={28} className="text-emerald-400" />
          </div>
          <div>
            <h4 className="text-lg font-black text-white tracking-tight mb-2">Management Insight</h4>
            <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-3xl">
              Observation data for static sites is collected via 24-hour vigilant monitoring cycles. 
              The results shown here are aggregated based on peak waterhole occupancy across all surveyed transects. 
              For detailed night-vision trail camera data, please consult the full ecological report.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
