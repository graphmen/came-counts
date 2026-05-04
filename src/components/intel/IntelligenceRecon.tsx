'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Shield, 
  Zap, 
  Target, 
  Flame, 
  Eye, 
  ChevronRight,
  Info,
  TrendingUp
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
  observer?: string;
}

const COLORS = {
  emerald: '#10b981',
  indigo: '#4f46e5',
  amber: '#f59e0b',
  rose: '#f43f5e',
  slate: '#64748b',
  background: '#f8fafc',
  border: '#e2e8f0',
  text: '#0f172a'
};

const SPECIES_PORTRAITS: Record<string, string> = {
  'elephant': '/images/species/elephant.png',
  'lion': '/images/species/lion.png',
  'hippo': '/images/species/hippo.png',
  'buffalo': '/images/species/buffalo.png',
  'zebra': '/images/species/zebra.png',
  'eland': '/images/species/eland.png',
  'warthog': '/images/species/warthog.png',
  'crocodile': '/images/species/crocodile.png',
  'martial eagle': '/images/species/martial-eagle.png',
  'impala': '/images/species/impala.png',
  'skimmer': '/images/species/skimmer.png',
  'monitor': '/images/species/monitor.png',
  'bateleur': '/images/species/bateleur.png',
  'mamba': '/images/species/mamba.png',
  'python': '/images/species/python.png',
  'heron': '/images/species/heron.png',
  'sable': '/images/species/sable.png',
  'fish eagle': '/images/species/fish-eagle.png',
  'roan': '/images/species/roan.png',
  'puff adder': '/images/species/puff-adder.png',
  'giraffe': '/images/species/giraffe.png',
  'leopard': '/images/species/leopard.png',
  'cheetah': '/images/species/cheetah.png',
  'wild dog': '/images/species/wild-dog.png',
  'hyena': '/images/species/hyena.png',
  'kudu': '/images/species/kudu.png',
  'waterbuck': '/images/species/waterbuck.png',
  'baboon': '/images/species/baboon.png',
  'vervet': '/images/species/vervet.png',
  'bushbuck': '/images/species/bushbuck.png',
  'nyala': '/images/species/nyala.png',
  'grysbok': '/images/species/grysbok.png',
  'honey badger': '/images/species/honey-badger.png',
  'carmine bee-eater': '/images/species/carmine-bee-eater.png',
  'fishing owl': '/images/species/pels-fishing-owl.png',
  'ground hornbill': '/images/species/ground-hornbill.png',
  'goliath heron': '/images/species/goliath-heron.png',
};

const getSpeciesPortrait = (speciesName: string | null) => {
  if (!speciesName) return null;
  const normalized = speciesName.toLowerCase().trim();
  for (const [key, value] of Object.entries(SPECIES_PORTRAITS)) {
    if (normalized.includes(key)) return value;
  }
  return null;
};

const SpecimenImage = ({ speciesName, fieldPhotoUrl }: { speciesName: string, fieldPhotoUrl?: string | null }) => {
  const [error, setError] = useState(false);
  const portrait = getSpeciesPortrait(speciesName);

  if (portrait && !error) {
    return (
      <img 
        src={portrait} 
        className="w-full h-full object-cover transition-transform group-hover/img:scale-110 relative z-20" 
        alt={speciesName}
        onError={() => setError(true)}
      />
    );
  }

  if (fieldPhotoUrl) {
    return (
      <img 
        src={fieldPhotoUrl} 
        className="w-full h-full object-cover transition-transform group-hover/img:scale-110 relative z-20" 
        alt={speciesName}
      />
    );
  }

  return (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center relative z-20">
      <Target size={48} className="text-slate-300" />
    </div>
  );
};

export default function IntelligenceRecon({ observations }: { observations: Observation[] }) {
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);

  const speciesData = useMemo(() => {
    const map: Record<string, number> = {};
    observations.forEach(o => {
      map[o.species] = (map[o.species] || 0) + o.count;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [observations]);

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

  const speciesProfile = useMemo(() => {
    if (!selectedSpecies) return null;
    const filtered = observations.filter(o => o.species === selectedSpecies);
    const m = filtered.reduce((s, o) => s + (o.male_count || 0), 0);
    const f = filtered.reduce((s, o) => s + (o.female_count || 0), 0);
    const u = filtered.reduce((s, o) => s + (o.unknown_count || 0), 0);
    const habitats = Array.from(new Set(filtered.map(o => o.habitat))).filter(Boolean);
    const activities = Array.from(new Set(filtered.map(o => o.activity))).filter(Boolean);

    const radar = [
      { subject: 'Abundance', A: (filtered.length / observations.length) * 100, fullMark: 100 },
      { subject: 'Dispersion', A: 70, fullMark: 100 },
      { subject: 'Activity', A: Math.min(100, activities.length * 20), fullMark: 100 },
      { subject: 'Gender Bal', A: Math.abs(m - f) < 5 ? 90 : 40, fullMark: 100 },
      { subject: 'Visibility', A: 85, fullMark: 100 },
    ];

    return { m, f, u, habitats, activities, radar, observations: filtered };
  }, [selectedSpecies, observations]);

  useEffect(() => {
    if (speciesData.length > 0 && !selectedSpecies) {
      setSelectedSpecies(speciesData[0].name);
    }
  }, [speciesData, selectedSpecies]);

  if (observations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-slate-50 text-slate-400 rounded-3xl border border-slate-200 shadow-sm">
        <Activity size={48} className="mb-4 opacity-10 text-slate-900" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Intelligence Nodes Detected</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-6 space-y-8 text-slate-900 min-h-[700px] animate-in fade-in duration-700">
      
      {/* ── Top Metric Banner ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 group hover:shadow-md transition-all duration-300">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                 <Activity size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Operations</span>
           </div>
           <div className="text-3xl font-display font-black text-slate-900">14 <span className="text-sm font-bold text-slate-400">/ Sectors</span></div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 group hover:shadow-md transition-all duration-300">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                 <Shield size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Patrol Coverage</span>
           </div>
           <div className="text-3xl font-display font-black text-slate-900">88.4% <span className="text-sm font-bold text-slate-400">Total</span></div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 group hover:shadow-md transition-all duration-300">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                 <Zap size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hotspots Logged</span>
           </div>
           <div className="text-3xl font-display font-black text-slate-900">24 <span className="text-sm font-bold text-slate-400">Priority</span></div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 group hover:shadow-md transition-all duration-300">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                 <Eye size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detection Rate</span>
           </div>
           <div className="text-3xl font-display font-black text-slate-900">+12% <span className="text-sm font-bold text-slate-400">Weekly</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Sidebar: Species Density Matrix ───────────── */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Species Density Matrix</span>
                 <TrendingUp size={14} className="text-indigo-600" />
              </div>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                 {speciesData.map(s => (
                  <button 
                    key={s.name}
                    onClick={() => setSelectedSpecies(s.name)}
                    className={`w-full p-4 flex items-center gap-4 transition-all border-b border-slate-50 group hover:bg-slate-50 ${selectedSpecies === s.name ? 'bg-indigo-50' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 shadow-sm">
                      <SpecimenImage speciesName={s.name} />
                    </div>
                    <div className="flex-1 text-left">
                       <div className={`text-[11px] font-black uppercase tracking-wider ${selectedSpecies === s.name ? 'text-indigo-600' : 'text-slate-900'}`}>{s.name}</div>
                       <div className="text-[9px] font-bold text-slate-400 font-mono">{s.value} OBS</div>
                    </div>
                    <ChevronRight size={14} className={`transition-transform ${selectedSpecies === s.name ? 'translate-x-1 text-indigo-400' : 'text-slate-200 opacity-0 group-hover:opacity-100'}`} />
                  </button>
                 ))}
              </div>
           </div>
        </div>

        {/* ── Center Dashboard ────────────────────────────────── */}
        <div className="lg:col-span-9 space-y-8">
           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                    <div>
                       <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight uppercase">Operational Recon 2.0</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tactical Intelligence Dashboard</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</div>
                       <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Operational Secure</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <Activity size={20} className="text-slate-400" />
                    </div>
                 </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={temporalData}>
                    <defs>
                      <linearGradient id="reconColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}
                    />
                    <Area type="monotone" dataKey="count" stroke={COLORS.emerald} strokeWidth={3} fillOpacity={1} fill="url(#reconColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                 {temporalData.map(d => (
                  <div key={d.name} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                     <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{d.name}</div>
                     <div className="text-xl font-mono font-black text-slate-900 mt-1">{d.count}</div>
                  </div>
                 ))}
              </div>
           </div>

           {/* ── Species Spotlight ─────────────────────────────── */}
           <AnimatePresence mode="wait">
            {selectedSpecies && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                
                {/* Visual Profile */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200 shadow-sm group/img">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent z-10" />
                    <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-100">
                       <span className="text-[8px] font-black text-slate-900 uppercase tracking-widest">Identified Specimen</span>
                    </div>
                    
                    {/* Specimen Visual Hub */}
                    <SpecimenImage 
                      speciesName={selectedSpecies} 
                      fieldPhotoUrl={speciesProfile?.observations.find(o => o.photo_url)?.photo_url} 
                    />
                    
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                       <h2 className="text-4xl font-display font-black tracking-tighter uppercase text-white">{selectedSpecies}</h2>
                       <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Live Tracking Active</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
                        <div className="text-xl font-mono font-black text-slate-900">{speciesProfile?.m}</div>
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Male</div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
                        <div className="text-xl font-mono font-black text-slate-900">{speciesProfile?.f}</div>
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Female</div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
                        <div className="text-xl font-mono font-black text-slate-900">{speciesProfile?.u}</div>
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Unk</div>
                     </div>
                  </div>
                </div>

                {/* Intel Breakdown */}
                <div className="lg:col-span-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Performance Radar */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                          <Activity size={14} className="text-indigo-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sector Affinity Radar</span>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={speciesProfile?.radar}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} />
                              <Radar
                                name={selectedSpecies}
                                dataKey="A"
                                stroke={COLORS.indigo}
                                fill={COLORS.indigo}
                                fillOpacity={0.4}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Habitats & Activities */}
                      <div className="space-y-6">
                         <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <Target size={14} className="text-amber-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Habitat Intelligence</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {speciesProfile?.habitats.map(h => (
                                  <span key={h} className="px-3 py-1.5 bg-white rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-200 text-slate-600 shadow-sm">
                                    {h}
                                  </span>
                                ))}
                            </div>
                         </div>

                         <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <Flame size={14} className="text-rose-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Observed Activities</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {speciesProfile?.activities.map(a => (
                                  <span key={a} className="px-3 py-1.5 bg-white rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-200 text-slate-600 shadow-sm">
                                    {a}
                                  </span>
                                ))}
                            </div>
                         </div>

                         <div className="bg-indigo-600 rounded-2xl border border-indigo-700 p-6 flex items-center justify-between shadow-md">
                            <div>
                               <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Intelligence Confidence</div>
                               <div className="text-2xl font-display font-black text-white">94.8%</div>
                            </div>
                            <Shield size={32} className="text-white/20" />
                         </div>
                      </div>
                   </div>

                   {/* Recent Sightings Table */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Operational Sightings</span>
                        <button 
                          onClick={() => setSelectedSpecies(null)}
                          className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                        >
                          Close Profile [ESC]
                        </button>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              <th className="px-4 py-3 text-[8px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                              <th className="px-4 py-3 text-[8px] font-black text-slate-500 uppercase tracking-widest">Habitat</th>
                              <th className="px-4 py-3 text-[8px] font-black text-slate-500 uppercase tracking-widest">Activity</th>
                              <th className="px-4 py-3 text-[8px] font-black text-slate-500 uppercase tracking-widest">Team</th>
                            </tr>
                          </thead>
                          <tbody>
                            {speciesProfile?.observations.slice(0, 4).map((o, i) => (
                              <tr key={o.id} className={`border-b border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                <td className="px-4 py-3 text-[10px] font-mono font-bold text-indigo-600">{o.time}</td>
                                <td className="px-4 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider">{o.habitat}</td>
                                <td className="px-4 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider">{o.activity}</td>
                                <td className="px-4 py-3 text-[10px] font-bold text-slate-400">{o.observer || 'Alpha'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
           </AnimatePresence>

           {/* ── Operational Grid (Summary) ────────────────── */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {speciesData.slice(0, 4).map(s => {
                 const portrait = getSpeciesPortrait(s.name);
                 return (
                   <button 
                    key={s.name}
                    onClick={() => setSelectedSpecies(s.name)}
                    className="bg-white p-4 rounded-3xl border border-slate-200 hover:border-indigo-500/30 hover:shadow-lg transition-all text-left group relative overflow-hidden h-48 flex flex-col justify-end"
                   >
                     <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
                        {portrait ? (
                          <img src={portrait} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" alt="" />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                             <Target size={48} className="text-slate-200" />
                          </div>
                        )}
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                     
                     <div className="relative z-10">
                      <h3 className="text-[8px] font-black text-slate-200 uppercase tracking-widest opacity-60">Operational Species</h3>
                      <div className="text-xl font-display font-black mt-1 uppercase text-white">{s.name}</div>
                      <div className="flex items-center gap-2 mt-2">
                          <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, (s.value / speciesData[0].value) * 100)}%` }} />
                          </div>
                          <span className="text-[10px] font-mono font-black text-emerald-400">{s.value}</span>
                      </div>
                     </div>
                   </button>
                 );
              })}
              
              <div className="col-span-2 md:col-span-4 bg-indigo-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-lg">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                 <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                       <Zap size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-black leading-tight text-white uppercase">Ready for Operational Deployment?</h2>
                      <p className="text-xs text-white/70 mt-2 font-medium">Export reconnaissance data in standardized formats for tactical coordination.</p>
                    </div>
                 </div>
                 <button className="relative z-10 px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-50 active:scale-95 transition-all">
                    Generate Intel Report
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4 py-4 px-2 border-t border-slate-200">
         <Info size={14} className="text-slate-400" />
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
           Authenticated Intelligence Stream · Encryption Active · Node: WEZ-COMMAND-Z01
         </p>
      </div>

    </div>
  );
}
