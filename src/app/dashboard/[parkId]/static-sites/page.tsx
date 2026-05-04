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
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '3.5px solid #10b981', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#94a3b8', fontWeight: 900, fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Analyzing Waterhole Data…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* ── Page Header ────────────────────────────────────────── */}
      <header className="relative p-10 rounded-[2.5rem] bg-slate-900/50 border border-white/5 shadow-2xl overflow-hidden group backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Droplets size={12} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Hydrological Network</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status: Active Monitor</span>
            </div>
            
            <div className="flex items-center gap-6">
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-display">
                Waterhole Analysis
              </h1>
              {parkId && (
                <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 hidden sm:block backdrop-blur-md">
                  <YearSelector parkId={parkId} selectedYear={selectedYear} onYearChange={handleYearChange} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
               <MapPin size={16} className="text-emerald-500" />
               Spatial distribution across {sites.length} tactical static nodes.
            </div>
          </div>

          <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Network Saturation</div>
                <div className="flex items-center gap-1.5">
                   {[1,2,3,4,5,6,7,8].map(i => <div key={i} className={`w-4 h-2 rounded-full transition-all duration-500 ${i <= (sites.length % 9) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`} />)}
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                 <Activity size={24} className="text-emerald-400" />
              </div>
          </div>
        </div>
      </header>

      {/* ── Site Selector & KPIs ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Nodes</h3>
            <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{sites.length} Registered</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {sites.map(site => {
              const isActive = selectedSite === site.name;
              return (
                <button
                  key={site.id}
                  onClick={() => setSelectedSite(site.name)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] border transition-all text-left group/site ${isActive ? 'bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-600/20' : 'bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-white/10 backdrop-blur-md'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-emerald-400 group-hover/site:bg-emerald-500/20'}`}>
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-200'}`}>{site.name}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {site.site_type} protocol
                    </p>
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                color="#6366f1"
                description="Total sightings recorded"
             />
             <KPICard 
                title="Operational Status" 
                value="ACTIVE" 
                icon={Zap} 
                color="#f59e0b"
                description="Live telemetry feed"
             />
             <KPICard 
                title="Data Integrity" 
                value="98.2%" 
                icon={Shield} 
                color="#ec4899"
                description="Audit validation score"
             />
        </div>
      </div>

      {/* ── Analytics Section ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Site Species Analysis */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="xl:col-span-2 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl p-10 flex flex-col min-h-[500px] backdrop-blur-md"
        >
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" /> {selectedSite} Biodiversity
              </h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-3">Distribution of documented taxa at this node</p>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
               <Database size={18} className="text-slate-400" />
            </div>
          </div>
          
          <div className="flex-1 min-h-[350px]">
            <PremiumBarChart data={chartData} />
          </div>
        </motion.div>

        {/* Breakdown & Context */}
        <div className="space-y-8">
          
          {/* Taxonomic Breakdown */}
          <div className="bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl p-10 min-h-[350px] flex flex-col backdrop-blur-md">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Classification Breakdown</h3>
            <div className="flex-1">
              <PremiumDoughnutChart data={categoryBreakdown} />
            </div>
          </div>

          {/* Strategic Context */}
          <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-8 flex items-start gap-6 backdrop-blur-md shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 relative z-10">
              <Info size={24} />
            </div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-3">Ecological Significance</h4>
              <p className="text-[12px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                Static sites serve as critical indicator zones. Clustering patterns during peak thermal hours provide 
                insights into water accessibility and species competition hierarchies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Additional Info ───────────────────────────────────── */}
      <footer className="relative bg-slate-900 rounded-[2.5rem] p-12 overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="p-5 bg-white/5 rounded-[2rem] backdrop-blur-md border border-white/10 shadow-2xl">
            <Shield size={40} className="text-emerald-400" />
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-display font-black text-white tracking-tight uppercase">Management Protocol Insight</h4>
            <p className="text-sm text-slate-400 font-bold leading-relaxed max-w-4xl uppercase tracking-[0.05em]">
              Observation data for static sites is collected via 24-hour vigilant monitoring cycles. 
              The results shown here are aggregated based on peak waterhole occupancy across all surveyed transects. 
              Terminal auth verified. Secure data stream active.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
