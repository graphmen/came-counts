'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { gc, supabase } from '@/lib/supabase';
import { 
  ChevronRight, 
  Map as MapIcon, 
  Database, 
  Users, 
  ShieldCheck,
  Globe,
  ArrowUpRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { WEZ_NEWS, WEZ_DIRECTIVES } from '@/lib/wez-news';

const PARKS = [
  { id: 'mana-pools-national-park', name: 'Mana Pools', icon: '🏕️', latest: 2025, sightings: 18853, status: 'active', area: '219,600 ha' },
  { id: 'hwange-national-park', name: 'Hwange', icon: '🐘', latest: null, sightings: null, status: 'coming-soon', area: '1,465,100 ha' },
  { id: 'gonarezhou-national-park', name: 'Gonarezhou', icon: '🦏', latest: null, sightings: null, status: 'coming-soon', area: '506,400 ha' },
];

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [sightingsCount, setSightingsCount] = useState('18,853');

  useEffect(() => {
    async function fetchStats() {
      const { data: totalSightings } = await supabase.from('v_survey_species_totals').select('total_count');
      const total = totalSightings?.reduce((acc, curr) => acc + curr.total_count, 0) || 18853;
      setSightingsCount(total.toLocaleString());
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-12">
      
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative overflow-hidden topographic-bg rounded-[2rem] p-8 md:p-12 text-slate-900 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
        {/* Dynamic Background */}
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-5 pointer-events-none">
          <Globe className="w-full h-full transform translate-x-1/4 -translate-y-1/4 text-emerald-900" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-slate-50/80 to-emerald-50/50 backdrop-blur-sm" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Operational Intelligence Grid
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight leading-[0.9] text-slate-900">
            Game Counts <br/>
            <span className="text-emerald-600 text-3xl md:text-5xl">Conservation.</span>
          </h1>

          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-xl">
            Modernizing Zimbabwe's game count ecosystem with elite digital intelligence, AI-validated census data, and production-grade reporting for WEZ.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link 
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-emerald-600 hover:bg-emerald-700 h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 text-white shadow-xl shadow-emerald-600/20"
              )}
            >
              National Dashboard <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── National KPI Matrix ────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Sectors', value: '06', icon: MapIcon, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Verified Sightings', value: sightingsCount, icon: ShieldCheck, color: 'bg-sky-50 text-sky-600' },
          { label: 'Expert Observers', value: '142', icon: Users, color: 'bg-amber-50 text-amber-600' },
          { label: 'Species Cataloged', value: '31', icon: Database, color: 'bg-rose-50 text-rose-600' },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, duration: 0.4 }}>
            <Card className="p-4 border-slate-200 glass-card bg-white/80 hover:shadow-lg transition-all rounded-2xl group">
               <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 shrink-0 ${stat.color} shadow-sm`}>
                    <stat.icon size={16} />
                  </div>
                  <div>
                    <div className="text-xl font-mono font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">{loading ? '...' : stat.value}</div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
               </div>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* ── Main Intel Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Jurisdictions (2/3) */}
        <section className="xl:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="space-y-0.5">
              <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Conservation Jurisdictions</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Centralized monitoring nodes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {PARKS.map((park, idx) => (
              <motion.div key={park.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}>
                <Card className={`group h-full overflow-hidden border-slate-200 rounded-2xl transition-all hover:ring-2 hover:ring-emerald-500/20 glass-card bg-white/90`}>
                   <div className="p-4 space-y-4 relative z-10">
                      <div className="flex justify-between items-center">
                        <div className="text-2xl p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-emerald-50 transition-colors shrink-0">{park.icon}</div>
                        <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm ${park.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {park.status === 'active' ? 'Operational' : 'Sync Pending'}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="text-lg font-display font-black text-slate-900 tracking-tight leading-none">{park.name}</h3>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none">{park.area} · Node {park.id.split('-')[0].toUpperCase()}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/50 p-3 rounded-xl border border-slate-200/60 shadow-sm">
                            <div className="text-xl font-mono font-black text-emerald-700 tracking-tighter leading-none">{(park.sightings || 0).toLocaleString()}</div>
                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1.5 leading-none">Sightings</div>
                          </div>
                          <div className="bg-white/50 p-3 rounded-xl border border-slate-200/60 shadow-sm">
                            <div className="text-xl font-mono font-black text-slate-900 tracking-tighter leading-none">{park.latest || 0}</div>
                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1.5 leading-none">Cycle</div>
                          </div>
                      </div>

                    <Link href={park.status === 'active' ? `/dashboard/${park.id}` : '#'} className="block relative z-10">
                      <Button 
                        disabled={park.status !== 'active'}
                        className={cn(
                          "w-full h-10 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 transition-all shadow-md",
                          park.status === 'active' 
                            ? "bg-slate-900 hover:bg-emerald-700 text-white hover:shadow-emerald-700/20" 
                            : "bg-slate-100 text-slate-400"
                        )}
                      >
                        Enter Node <ArrowUpRight size={14} />
                      </Button>
                    </Link>
                 </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Intelligence Feed (1/3) */}
        <aside className="space-y-6">
          <div className="space-y-0.5 border-b border-slate-100 pb-2">
            <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Intelligence Feed</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">wezmat.org integration</p>
          </div>

          <div className="space-y-3 pt-2">
            {WEZ_NEWS.map((news) => (
              <a 
                key={news.id} 
                href={news.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors shrink-0">
                    {news.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
                        {news.category}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 uppercase">
                        {news.date}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                      {news.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                      {news.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* National Directive Card */}
          <Card className="p-6 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={60} className="text-emerald-600" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <Info size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">National Directive</span>
              </div>
              <p className="text-sm font-display italic leading-relaxed text-slate-600">
                "{WEZ_DIRECTIVES.mission}"
              </p>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Official Registration</p>
                  <p className="text-[10px] font-mono font-bold text-emerald-600">{WEZ_DIRECTIVES.registration}</p>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="pt-12 pb-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-display font-black text-slate-900 uppercase tracking-tight">Wildlife & Environment Zimbabwe</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Game Count Authority · PVO 204/68</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Network Secure</span>
            </div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-50">ELITE-GRID-NODE-01</p>
          </div>
      </footer>
    </div>
  );
}
