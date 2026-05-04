'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { gc, supabase } from '@/lib/supabase';
import { Park } from '@/types';
import { 
  Globe, 
  Map as MapIcon, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Database,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Zap,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import EliteAnalytics from '@/components/charts/EliteAnalytics';

export default function NationalDashboard() {
  const [parks, setParks] = useState<Park[]>([]);
  const [allSightings, setAllSightings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNationalData() {
      setLoading(true);
      try {
        const { data: pData } = await supabase.from('parks').select('*').order('name');
        setParks(pData || []);

        const { data: sData } = await supabase
          .from('v_survey_species_totals')
          .select('year, total_count, species, park_id');
        
        setAllSightings(sData || []);
      } catch (e) {
        console.error('National data fetch error:', e);
      }
      setLoading(false);
    }
    fetchNationalData();
  }, []);

  const nationalStats = useMemo(() => {
    const totalSightings = allSightings.reduce((acc, curr) => acc + (curr.total_count || 0), 0);
    const totalArea = parks.reduce((acc, curr) => acc + (curr.area_ha || 0), 0);
    const uniqueSpecies = new Set(allSightings.map(s => s.species)).size;
    
    return {
      totalSightings,
      totalArea,
      uniqueSpecies,
      activeNodes: parks.length
    };
  }, [allSightings, parks]);

  const speciesDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    allSightings.forEach(s => {
      map[s.species] = (map[s.species] || 0) + s.total_count;
    });
    return Object.entries(map)
      .map(([species, total_count]) => ({ species, total_count }))
      .sort((a, b) => b.total_count - a.total_count);
  }, [allSightings]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm tracking-wide">Syncing National Registry...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-6xl mx-auto px-4 py-4 space-y-6"
    >
      {/* -- National Header -- */}
      <header className="relative rounded-[2rem] bg-slate-950 text-white border border-slate-800 shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />
        
        <div className="relative z-10 p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <ShieldCheck size={10} className="text-emerald-400" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">National Grid Active</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-[0.2em]">HUB_ZIM_CENTRAL</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight leading-none text-white">
              Zimbabwe <span className="text-emerald-500">Game Counts.</span>
            </h1>

            <p className="text-slate-400 font-bold max-w-lg text-[10px] uppercase tracking-widest leading-relaxed opacity-70">
              Aggregated longitudinal wildlife intelligence across all operational sectors.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl min-w-[140px]">
              <div className="text-3xl font-display font-black text-emerald-400">{nationalStats.totalSightings.toLocaleString()}</div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Verified Sightings</div>
            </div>
            <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl min-w-[140px]">
              <div className="text-3xl font-display font-black text-white">{(nationalStats.totalArea / 1000).toFixed(0)}k</div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Hectares Managed</div>
            </div>
          </div>
        </div>

        {/* -- Status Bar -- */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-10 py-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Activity size={10} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Status</span>
            <span className="text-[9px] font-mono font-bold text-emerald-400">OPERATIONAL</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-amber-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nodes Sync</span>
            <span className="text-[9px] font-mono font-bold text-amber-400">{nationalStats.activeNodes} Sectors</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <div className="flex items-center gap-2">
            <Lock size={10} className="text-blue-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol</span>
            <span className="text-[9px] font-mono font-bold text-blue-400">WEZ-SECURE</span>
          </div>
        </div>
      </header>

      {/* -- Global Analytics -- */}
      <section className="bg-white rounded-3xl border border-slate-100 p-1">
        <EliteAnalytics stats={{
          parkName: 'National Overview',
          totalSightings: nationalStats.totalSightings,
          observerCount: 142,
          speciesCount: nationalStats.uniqueSpecies,
          dataPointGrowth: 8.5,
          speciesData: speciesDistribution
        }} />
      </section>

      {/* -- Jurisdictions Grid -- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-lg font-display font-black text-slate-900 tracking-tight leading-none">Regional Node Distribution</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
            <Database size={10} className="text-emerald-500" />
            Verified Registry
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {parks.map((park) => {
            const parkSightings = allSightings.filter(s => s.park_id === park.id).reduce((acc, curr) => acc + curr.total_count, 0);
            return (
              <Link key={park.id} href={`/dashboard/${park.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-emerald-50 transition-colors">
                      {park.name.includes('Elephant') ? '??' : park.name.includes('Pools') ? '???' : '??'}
                    </div>
                    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>

                  <div className="space-y-0.5 mb-4">
                    <h3 className="text-base font-display font-black text-slate-900 leading-tight">{park.name}</h3>
                    <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <MapIcon size={10} className="text-emerald-500" />
                      {park.region || 'Zimbabwe Central'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-50 group-hover:bg-white transition-colors">
                      <div className="text-sm font-display font-black text-emerald-600 leading-none">{parkSightings.toLocaleString()}</div>
                      <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Sightings</div>
                    </div>
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-50 group-hover:bg-white transition-colors">
                      <div className="text-sm font-display font-black text-slate-900 leading-none">{park.area_ha ? (park.area_ha / 1000).toFixed(0) + 'k' : '0k'}</div>
                      <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Ha</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="pt-6 pb-4 border-t border-slate-100 text-center">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
          National Wildlife Intelligence Grid - Zimbabwe Authority
        </p>
      </footer>
    </motion.div>
  );
}
