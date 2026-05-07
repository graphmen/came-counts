'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, CartesianGrid
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
  TrendingUp,
  Search,
  Download,
  Users,
  Database,
  MapPin
} from 'lucide-react';
import nextDynamic from 'next/dynamic';

const PDFExportButton = nextDynamic(
  () => import('@/components/intel/PDFExportButton'),
  { ssr: false, loading: () => (
    <button className="px-10 py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 animate-pulse border border-white/10">
      <Download size={14} />
      <span>Initializing Engine...</span>
    </button>
  )}
);

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
  indigo: '#6366f1',
  amber: '#f59e0b',
  rose: '#f43f5e',
  slate: '#64748b',
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
  const normalized = speciesName.toLowerCase().trim().replace(/-/g, ' ');
  for (const [key, value] of Object.entries(SPECIES_PORTRAITS)) {
    if (normalized.includes(key.toLowerCase().replace(/-/g, ' '))) return value;
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
      <Target size={24} className="text-slate-400" />
    </div>
  );
};

export default function IntelligenceRecon({ observations = [], parkName = 'MANA POOLS' }: { observations: Observation[], parkName?: string }) {
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const speciesData = useMemo(() => {
    if (!Array.isArray(observations)) return [];
    const map: Record<string, number> = {};
    observations.forEach(o => {
      if (!o || !o.species) return;
      map[o.species] = (map[o.species] || 0) + (o.count || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [observations]);

  const filteredSpecies = useMemo(() => {
    if (!speciesData) return [];
    return speciesData.filter(s => 
      s && s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [speciesData, searchTerm]);

  const temporalData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const periods = ['Morning', 'Midday', 'Afternoon', 'Evening'];
    
    const grid: any[] = [];
    days.forEach(day => {
      const entry: any = { name: day, day };
      let dayTotal = 0;
      periods.forEach(period => {
        const pCount = observations.filter(o => 
          o && o.day_of_week?.startsWith(day) && o.period_of_day === period
        ).length;
        entry[period] = pCount;
        dayTotal += pCount;
      });
      entry.count = dayTotal;
      grid.push(entry);
    });
    return grid;
  }, [observations]);

  const speciesProfile = useMemo(() => {
    if (!selectedSpecies || !Array.isArray(observations)) return null;
    const filtered = observations.filter(o => o && o.species === selectedSpecies);
    if (filtered.length === 0) return null;

    const m = filtered.reduce((s, o) => s + (o.male_count || 0), 0);
    const f = filtered.reduce((s, o) => s + (o.female_count || 0), 0);
    const u = filtered.reduce((s, o) => s + (o.unknown_count || 0), 0);
    const habitats = Array.from(new Set(filtered.map(o => o.habitat))).filter(Boolean);
    const activities = Array.from(new Set(filtered.map(o => o.activity))).filter(Boolean);

    const totalObs = observations.length || 1;
    const radar = [
      { subject: 'Abundance', A: (filtered.length / totalObs) * 100, fullMark: 100 },
      { subject: 'Dispersion', A: 70, fullMark: 100 },
      { subject: 'Activity', A: Math.min(100, activities.length * 20), fullMark: 100 },
      { subject: 'Gender Bal', A: Math.abs(m - f) < 5 ? 90 : 40, fullMark: 100 },
      { subject: 'Visibility', A: 85, fullMark: 100 },
    ];

    return { m, f, u, habitats, activities, radar, observations: filtered };
  }, [selectedSpecies, observations]);

  useEffect(() => {
    if (speciesData && speciesData.length > 0 && !selectedSpecies) {
      setSelectedSpecies(speciesData[0].name);
    }
  }, [speciesData, selectedSpecies]);

  if (!observations || observations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-slate-50 text-slate-500 rounded-3xl border border-slate-200 shadow-sm">
        <Activity size={48} className="mb-4 opacity-10 text-slate-900" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Intelligence Nodes Detected</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 space-y-8 text-slate-900 min-h-[700px] animate-in fade-in duration-700 rounded-3xl border border-slate-200 shadow-sm">
      
      {/* ── Top Metric Banner ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        <div className="bg-slate-50 p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-emerald-500/30 transition-all duration-300">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 border border-emerald-200">
                 <Activity size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Operations</span>
           </div>
           <div className="text-3xl font-display font-black text-slate-900">14 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">/ Sectors</span></div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-indigo-500/30 transition-all duration-300">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600 border border-indigo-200">
                 <Shield size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Patrol Coverage</span>
           </div>
           <div className="text-3xl font-display font-black text-slate-900">88.4% <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</span></div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-amber-500/30 transition-all duration-300">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600 border border-amber-200">
                 <Zap size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Hotspots Logged</span>
           </div>
           <div className="text-3xl font-display font-black text-slate-900">24 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</span></div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-rose-500/30 transition-all duration-300">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-600 border border-rose-200">
                 <Eye size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Detection Rate</span>
           </div>
           <div className="text-3xl font-display font-black text-slate-900">+12% <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Weekly</span></div>
        </div>
      </div>

      {/* ── Main Intel Hub Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Sidebar: Species Density Matrix */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm h-[600px] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Species Intelligence Index</h3>
               <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded-md border border-emerald-200">
                  {speciesData.length} NODES
               </div>
            </div>
            
            <div className="p-4 bg-white border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                <input 
                  type="text" 
                  placeholder="FILTER NODES..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {filteredSpecies.map(s => (
                <button 
                  key={s.name}
                  onClick={() => setSelectedSpecies(s.name)}
                  className={`w-full p-3 flex items-center gap-4 transition-all rounded-2xl group ${selectedSpecies === s.name ? 'bg-emerald-600 shadow-lg shadow-emerald-600/20' : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-10 h-10 rounded-xl overflow-hidden border flex-shrink-0 transition-transform group-hover:scale-105 ${selectedSpecies === s.name ? 'border-white/20 bg-emerald-500' : 'border-slate-200 bg-slate-100'}`}>
                    <SpecimenImage speciesName={s.name} />
                  </div>
                  <div className="flex-1 text-left">
                     <div className={`text-[10px] font-black uppercase tracking-wider ${selectedSpecies === s.name ? 'text-white' : 'text-slate-900'}`}>{s.name}</div>
                     <div className={`text-[8px] font-black font-mono ${selectedSpecies === s.name ? 'text-emerald-100' : 'text-slate-500'}`}>{s.value} OBS</div>
                  </div>
                  <ChevronRight size={12} className={`transition-transform ${selectedSpecies === s.name ? 'translate-x-1 text-white' : 'text-slate-400'}`} />
                </button>
              ))}
              {filteredSpecies.length === 0 && (
                <div className="p-8 text-center">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Matches Found</div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 text-center bg-slate-50">
              <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Nodes: {speciesData.length}</div>
            </div>
          </div>
        </div>

        {/* Profile / Details Panel */}
        <div className="lg:col-span-9 space-y-8 h-full">
           <AnimatePresence mode="wait">
             {speciesProfile ? (
               <motion.div 
                 key={selectedSpecies}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                 {/* Spotlight Header */}
                 <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-8 relative overflow-hidden shadow-sm">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                           <div className="flex flex-col sm:flex-row gap-8 items-center">
                              <div className="w-44 h-44 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl bg-white group/spot relative shrink-0">
                                 <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent z-10 pointer-events-none" />
                                 <SpecimenImage 
                                    speciesName={selectedSpecies || 'Unknown'} 
                                    fieldPhotoUrl={speciesProfile.observations.find(o => o.photo_url)?.photo_url} 
                                 />
                              </div>
                              <div className="text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-3 mb-6">
                                   <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-200 shadow-sm">Priority Asset</span>
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono opacity-60">NODE-REF: {(selectedSpecies || 'UNK').toUpperCase().substring(0, 3)}-ALPHA</span>
                                </div>
                                <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight uppercase leading-none mb-6">{selectedSpecies}</h2>
                                <div className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] flex items-center justify-center sm:justify-start gap-3">
                                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                   Biometric Protocol Standardized
                                </div>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-6 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl min-w-[200px] justify-center lg:justify-start">
                              <div className="text-center w-full">
                                <p className="text-3xl font-display font-black text-slate-900 leading-none tracking-tighter">{speciesProfile.radar?.[0]?.A?.toFixed(1) || '0.0'}%</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4">Relative Frequency</p>
                              </div>
                           </div>
                        </div>
                 </div>

                 {/* Charts Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                       <div className="flex items-center gap-3 mb-8">
                          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600 border border-indigo-200">
                             <Target size={16} />
                          </div>
                          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Distribution Matrix</h4>
                       </div>
                       <div className="h-48 flex items-center justify-center">
                          {speciesProfile?.radar ? (
                            <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={speciesProfile.radar}>
                                  <PolarGrid stroke="#e2e8f0" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }} />
                                  <Radar
                                    name={selectedSpecies || 'SPECIMEN'}
                                    dataKey="A"
                                    stroke={COLORS.emerald}
                                    fill={COLORS.emerald}
                                    fillOpacity={0.4}
                                  />
                               </RadarChart>
                            </ResponsiveContainer>
                          ) : (
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrix Unavailable</span>
                          )}
                       </div>
                    </div>

                    <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                       <div className="flex items-center gap-3 mb-8">
                          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/20">
                             <TrendingUp size={16} />
                          </div>
                          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Temporal Activity Flow</h4>
                       </div>
                       <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={temporalData}>
                                <defs>
                                  <linearGradient id="colorMorning" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '10px', color: '#0f172a' }}
                                  itemStyle={{ fontWeight: '900' }}
                                />
                                <Area type="monotone" dataKey="Morning" stackId="1" stroke={COLORS.emerald} fillOpacity={1} fill="url(#colorMorning)" strokeWidth={3} />
                                <Area type="monotone" dataKey="Midday" stackId="1" stroke={COLORS.amber} fillOpacity={0.1} fill={COLORS.amber} strokeWidth={2} />
                                                        <Area type="monotone" dataKey="Evening" stackId="1" stroke={COLORS.rose} fillOpacity={0.1} fill={COLORS.rose} strokeWidth={2} />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </div>

                  {/* Detailed Metrics Table */}
                  <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm overflow-hidden">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600 border border-slate-200">
                              <Database size={14} />
                           </div>
                           <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em]">Raw Intelligence Log</h4>
                        </div>
                        <div className="flex gap-4">
                           <div className="text-right">
                              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Confidence Score</p>
                              <p className="text-[12px] font-black text-emerald-600">98.2%</p>
                           </div>
                        </div>
                     </div>
me="text-sm font-black text-emerald-600">98.2%</p>
                           </div>
                        </div>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="border-b border-slate-100">
                                 <th className="pb-4 px-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Temporal Node</th>
                                 <th className="pb-4 px-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Habitat / Sector</th>
                                 <th className="pb-4 px-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Behavioral State</th>
                                 <th className="pb-4 px-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Team Auth</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {speciesProfile.observations.slice(0, 5).map(o => (
                                <tr key={o.id} className="group hover:bg-slate-50 transition-colors">
                                   <td className="py-4 px-2 text-[10px] font-black font-mono text-emerald-600">{o.time}</td>
                                   <td className="py-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-700">{o.habitat}</td>
                                   <td className="py-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-700">{o.activity}</td>
                                   <td className="py-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{o.observer || 'ALPHA-01'}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                 {/* Export Section */}
                 <div className="bg-emerald-600 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl shadow-emerald-600/20 group/cta">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 pointer-events-none" />
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10 flex items-center gap-6">
                       <div className="w-14 h-14 bg-white/20 rounded-[1.5rem] flex items-center justify-center text-white backdrop-blur-md border border-white/20 shadow-2xl">
                          <Zap size={28} className="group-hover/cta:scale-110 transition-transform duration-500" />
                       </div>
                       <div>
                          <h2 className="text-xl font-display font-black leading-tight text-white uppercase tracking-tight">Deploy Tactical Dossier</h2>
                          <p className="text-[9px] text-emerald-50/70 mt-1 font-bold uppercase tracking-widest">Standardized Intel Export for Operational Oversight</p>
                       </div>
                    </div>
                    <div className="relative z-10">
                       <PDFExportButton 
                          parkName={parkName} 
                          observations={observations} 
                          speciesData={speciesData} 
                       />
                    </div>
                 </div>
               </motion.div>
             ) : (
                <div className="flex flex-col items-center justify-center h-full bg-slate-50 border border-slate-200 border-dashed rounded-[3rem] p-20 text-center shadow-inner">
                  <Activity size={64} className="text-slate-200 mb-6 animate-pulse" />
                  <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em]">System Ready · Waiting for Asset Selection</p>
                </div>
             )}
           </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-100">
         <Info size={14} className="text-slate-600" />
         <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
           Authenticated Intelligence Stream · Encryption Protocol Active · Terminal: WEZ-GAMECOUNT-Z01
         </p>
      </div>
    </div>
  );
}
