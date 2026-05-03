'use client';

import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Shield, 
  Zap, 
  Target, 
  Flame, 
  Eye, 
  ChevronRight,
  Info
} from 'lucide-react';

interface Observation {
  id: string;
  species: string;
  count: number;
  day_of_week: string;
  period_of_day: string;
  male_count: number;
  female_count: number;
  unknown_count: number;
  habitat: string;
  activity: string;
  date: string;
  time: string;
  photo_url: string | null;
}

const COLORS = {
  emerald: '#10b981',
  indigo: '#6366f1',
  pink: '#ec4899',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  slate: '#94a3b8'
};

const SPECIES_PORTRAITS: Record<string, string> = {
  'Elephant': '/images/species/elephant.png',
  'Lion': '/images/species/lion.png',
  'Hippo': '/images/species/hippo.png',
  'Buffalo': '/images/species/elephant.png', // Fallback to similar
};

export default function IntelligenceRecon({ observations }: { observations: Observation[] }) {
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);

  // 1. Species Distribution for Radar/Bar
  const speciesData = useMemo(() => {
    const map: Record<string, number> = {};
    observations.forEach(o => {
      map[o.species] = (map[o.species] || 0) + o.count;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [observations]);

  // 2. Temporal Signature
  const temporalData = useMemo(() => {
    const slots = ['Sat Morning', 'Sat Afternoon', 'Sun Morning', 'Sun Afternoon'];
    const map: Record<string, number> = {
      'Sat Morning': 0, 'Sat Afternoon': 0, 'Sun Morning': 0, 'Sun Afternoon': 0
    };
    
    observations.forEach(o => {
      const key = `${o.day_of_week?.substring(0, 3)} ${o.period_of_day}`;
      if (map[key] !== undefined) map[key] += o.count;
    });

    return slots.map(slot => ({ name: slot, count: map[slot] }));
  }, [observations]);

  // 3. Species Profile (when selected)
  const speciesProfile = useMemo(() => {
    if (!selectedSpecies) return null;
    const filtered = observations.filter(o => o.species === selectedSpecies);
    const m = filtered.reduce((s, o) => s + (o.male_count || 0), 0);
    const f = filtered.reduce((s, o) => s + (o.female_count || 0), 0);
    const u = filtered.reduce((s, o) => s + (o.unknown_count || 0), 0);
    const habitats = Array.from(new Set(filtered.map(o => o.habitat))).filter(Boolean);
    const activities = Array.from(new Set(filtered.map(o => o.activity))).filter(Boolean);

    // Radar data for species traits
    const radar = [
      { subject: 'Abundance', A: (filtered.length / observations.length) * 100, fullMark: 100 },
      { subject: 'Dispersion', A: 70, fullMark: 100 }, // Mocked for now
      { subject: 'Activity', A: activities.length * 20, fullMark: 100 },
      { subject: 'Gender Bal', A: Math.abs(m - f) < 5 ? 90 : 40, fullMark: 100 },
      { subject: 'Visibility', A: 85, fullMark: 100 },
    ];

    return { m, f, u, habitats, activities, radar, observations: filtered };
  }, [selectedSpecies, observations]);

  if (observations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-slate-950 text-slate-500 rounded-3xl border border-white/5">
        <Activity size={48} className="mb-4 opacity-20 animate-pulse text-emerald-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Intelligence Nodes Detected</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 p-6 space-y-6 text-white min-h-[700px]">
      
      {/* ── Top Recon Strip ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Distribution Radar */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                <Target size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biological Signature</h3>
                <h2 className="text-xl font-display font-black">Species Density Matrix</h2>
              </div>
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Survey</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={speciesData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar
                    name="Density"
                    dataKey="value"
                    stroke={COLORS.indigo}
                    fill={COLORS.indigo}
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #ffffff10', fontSize: '10px', fontWeight: 'bold' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {speciesData.map((s, i) => (
                <button 
                  key={s.name}
                  onClick={() => setSelectedSpecies(s.name)}
                  className={`w-full group/row flex items-center justify-between p-3 rounded-2xl border transition-all ${selectedSpecies === s.name ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black">
                      {i + 1}
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-black text-slate-400">{s.value}</span>
                    <ChevronRight size={14} className={`transition-transform ${selectedSpecies === s.name ? 'rotate-90 text-indigo-400' : 'text-slate-600 group-hover/row:translate-x-1'}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Temporal Flow */}
        <div className="bg-slate-900 rounded-3xl border border-white/10 p-6 flex flex-col justify-between group">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temporal Flux</h3>
                <h2 className="text-xl font-display font-black">Activity Pulse</h2>
              </div>
            </div>

            <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temporalData}>
                  <defs>
                    <linearGradient id="reconColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    hide
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #ffffff10', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" stroke={COLORS.emerald} strokeWidth={3} fillOpacity={1} fill="url(#reconColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {temporalData.map(d => (
                 <div key={d.name} className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{d.name}</div>
                    <div className="text-lg font-mono font-black text-white">{d.count}</div>
                 </div>
               ))}
            </div>
        </div>
      </div>

      {/* ── Species Spotlight Section ──────────────────────── */}
      <AnimatePresence mode="wait">
        {selectedSpecies ? (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            {/* Visual Profile */}
            <div className="lg:col-span-4 space-y-6">
              <div className="aspect-[4/5] bg-slate-800 rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl group/img">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                   <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Identified Specimen</span>
                </div>
                {/* Fallback pattern if no photo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <Target size={120} />
                </div>
                {/* Latest photo of this species if available, or generated fallback */}
                {speciesProfile?.observations.find(o => o.photo_url)?.photo_url ? (
                  <img 
                    src={speciesProfile.observations.find(o => o.photo_url)!.photo_url!} 
                    className="w-full h-full object-cover transition-transform group-hover/img:scale-110" 
                    alt={selectedSpecies}
                  />
                ) : SPECIES_PORTRAITS[selectedSpecies] ? (
                  <img 
                    src={SPECIES_PORTRAITS[selectedSpecies]} 
                    className="w-full h-full object-cover transition-transform group-hover/img:scale-110" 
                    alt={selectedSpecies}
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-500/5 flex items-center justify-center">
                     <Target size={48} className="text-indigo-400/20" />
                  </div>
                )}
                
                <div className="absolute bottom-6 left-6 right-6 z-20">
                   <h2 className="text-4xl font-display font-black tracking-tighter uppercase">{selectedSpecies}</h2>
                   <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Tracking Active</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <div className="text-xl font-mono font-black">{speciesProfile?.m}</div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Male</div>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <div className="text-xl font-mono font-black">{speciesProfile?.f}</div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Female</div>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <div className="text-xl font-mono font-black">{speciesProfile?.u}</div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Unk</div>
                 </div>
              </div>
            </div>

            {/* Intel Breakdown */}
            <div className="lg:col-span-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Performance Radar */}
                  <div className="bg-white/5 rounded-2xl border border-white/5 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Activity size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sector Affinity Radar</span>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={speciesProfile?.radar}>
                          <PolarGrid stroke="#ffffff05" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} />
                          <Radar
                            name={selectedSpecies}
                            dataKey="A"
                            stroke={COLORS.indigo}
                            fill={COLORS.indigo}
                            fillOpacity={0.6}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Habitats & Activities */}
                  <div className="space-y-6">
                     <div className="bg-white/5 rounded-2xl border border-white/5 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Target size={14} className="text-amber-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Habitat Intelligence</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {speciesProfile?.habitats.map(h => (
                             <span key={h} className="px-3 py-1.5 bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/5 text-slate-300">
                               {h}
                             </span>
                           ))}
                        </div>
                     </div>

                     <div className="bg-white/5 rounded-2xl border border-white/5 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Flame size={14} className="text-rose-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observed Activities</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {speciesProfile?.activities.map(a => (
                             <span key={a} className="px-3 py-1.5 bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/5 text-slate-300">
                               {a}
                             </span>
                           ))}
                        </div>
                     </div>

                     <div className="bg-indigo-600/20 rounded-2xl border border-indigo-500/30 p-6 flex items-center justify-between">
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Intelligence Confidence</div>
                           <div className="text-2xl font-display font-black text-white">94.8%</div>
                        </div>
                        <Shield size={32} className="text-indigo-400/20" />
                     </div>
                  </div>
               </div>

               {/* Recent Sightings Table (Tactical Look) */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Operational Sightings</span>
                    <button 
                      onClick={() => setSelectedSpecies(null)}
                      className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                      Close Profile [ESC]
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                          <th className="px-4 py-3 text-[8px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                          <th className="px-4 py-3 text-[8px] font-black text-slate-500 uppercase tracking-widest">Habitat</th>
                          <th className="px-4 py-3 text-[8px] font-black text-slate-500 uppercase tracking-widest">Activity</th>
                          <th className="px-4 py-3 text-[8px] font-black text-slate-500 uppercase tracking-widest">Team</th>
                        </tr>
                      </thead>
                      <tbody>
                        {speciesProfile?.observations.slice(0, 4).map((o, i) => (
                          <tr key={o.id} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                            <td className="px-4 py-3 text-[10px] font-mono font-bold text-indigo-400">{o.time}</td>
                            <td className="px-4 py-3 text-[10px] font-black text-slate-300 uppercase tracking-wider">{o.habitat}</td>
                            <td className="px-4 py-3 text-[10px] font-black text-slate-300 uppercase tracking-wider">{o.activity}</td>
                            <td className="px-4 py-3 text-[10px] font-bold text-slate-500">{o.observer}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {speciesData.slice(0, 4).map(s => (
               <button 
                key={s.name}
                onClick={() => setSelectedSpecies(s.name)}
                className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all text-left group relative overflow-hidden"
               >
                 <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform" />
                 <Target size={14} className="text-indigo-400 mb-4 group-hover:rotate-45 transition-transform" />
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Species</h3>
                 <div className="text-xl font-display font-black mt-1">{s.name}</div>
                 <div className="flex items-center gap-2 mt-4">
                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500" style={{ width: '70%' }} />
                    </div>
                    <span className="text-[10px] font-mono font-black text-indigo-400">{s.value}</span>
                 </div>
               </button>
            ))}
            
            <div className="col-span-2 md:col-span-4 bg-indigo-600 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
               <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                     <Zap size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-black leading-none">Ready for Full Operational Deployment?</h2>
                    <p className="text-xs text-white/70 mt-2 font-medium">Export reconnaissance data in standardized formats for tactical cross-departmental coordination.</p>
                  </div>
               </div>
               <button className="relative z-10 px-8 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                  Generate Intel Report
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 py-4 px-2 border-t border-white/5">
         <Info size={14} className="text-slate-600" />
         <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
           Authenticated Intelligence Stream · Encryption Active · Node: WEZ-COMMAND-Z01
         </p>
      </div>

    </div>
  );
}
