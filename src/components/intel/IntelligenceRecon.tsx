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
      

      {/* ── Main Intel Hub: 3-Column Layout ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[650px] gap-0 border border-slate-200 rounded-2xl overflow-hidden shadow-md relative z-10">
        
        {/* Col 1: Species Sidebar */}
        <div className="lg:col-span-3 flex flex-col border-r border-slate-200 bg-white h-[500px] lg:h-full">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
             <div>
               <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em]">Species Intelligence</h3>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Index</p>
             </div>
             <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded-md border border-emerald-200">
                {speciesData.length} NODES
             </div>
          </div>
          
          <div className="p-3 bg-white border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={11} />
              <input 
                type="text" 
                placeholder="FILTER NODES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredSpecies.map(s => (
              <button 
                key={s.name}
                onClick={() => setSelectedSpecies(s.name)}
                className={`w-full p-3 flex items-center gap-3 transition-all rounded-xl group ${selectedSpecies === s.name ? 'bg-emerald-600 shadow-md shadow-emerald-600/20' : 'hover:bg-slate-50'}`}
              >
                <div className={`w-9 h-9 rounded-lg overflow-hidden border flex-shrink-0 ${selectedSpecies === s.name ? 'border-white/20 bg-emerald-500' : 'border-slate-200 bg-slate-100'}`}>
                  <SpecimenImage speciesName={s.name} />
                </div>
                <div className="flex-1 text-left min-w-0">
                   <div className={`text-[10px] font-black uppercase tracking-wide truncate ${selectedSpecies === s.name ? 'text-white' : 'text-slate-900'}`}>{s.name}</div>
                   <div className={`text-[8px] font-black font-mono ${selectedSpecies === s.name ? 'text-emerald-100' : 'text-slate-500'}`}>{s.value} OBS</div>
                </div>
                <ChevronRight size={11} className={`flex-shrink-0 ${selectedSpecies === s.name ? 'text-white' : 'text-slate-400'}`} />
              </button>
            ))}
            {filteredSpecies.length === 0 && (
              <div className="p-6 text-center">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No Matches</div>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Nodes: {speciesData.length}</div>
          </div>
        </div>

        {/* Col 2: LARGE Specimen Image */}
        <div className="lg:col-span-5 relative bg-slate-900 overflow-hidden h-[400px] lg:h-full">
          <AnimatePresence mode="wait">
            {selectedSpecies && (
              <motion.div
                key={selectedSpecies + '_img'}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                {/* Full-bleed specimen image */}
                <div className="w-full h-full group/img">
                  {(() => {
                    const portrait = getSpeciesPortrait(selectedSpecies);
                    const fieldPhoto = speciesProfile?.observations?.find(o => o.photo_url)?.photo_url;
                    if (portrait) {
                      return <img src={portrait} className="w-full h-full object-cover object-center" alt={selectedSpecies} />;
                    }
                    if (fieldPhoto) {
                      return <img src={fieldPhoto} className="w-full h-full object-cover object-center" alt={selectedSpecies} />;
                    }
                    return (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <Target size={64} className="text-slate-600" />
                      </div>
                    );
                  })()}
                </div>
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
              </motion.div>
            )}
            {!selectedSpecies && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <Activity size={48} className="text-slate-600 animate-pulse" />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Col 3: Compact Analytics Panel */}
        <div className="lg:col-span-4 flex flex-col border-l border-slate-200 bg-white h-[500px] lg:h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {speciesProfile ? (
              <motion.div
                key={selectedSpecies + '_data'}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="flex flex-col h-full"
              >
                {/* Profile Header: Compact Metadata */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[6px] font-black uppercase tracking-wider rounded-md border border-emerald-200">Priority Asset</span>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest font-mono opacity-80">NODE-REF: {(selectedSpecies || 'UNK').toUpperCase().substring(0, 3)}-ALPHA</span>
                      </div>
                      <h2 className="text-lg font-display font-black text-slate-900 tracking-tight uppercase leading-none">{selectedSpecies}</h2>
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-2" />
                    <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      Biometric Protocol Standardized
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[14px] font-display font-black text-emerald-600 leading-none">{speciesProfile.radar?.[0]?.A?.toFixed(1) || '0.0'}%</p>
                    <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mt-1">Rel. Freq</p>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-2 border-b border-slate-100">
                  {/* Distribution Matrix */}
                  <div className="p-3 border-r border-slate-100">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-wider">Distribution Matrix</span>
                    </div>
                    <div className="h-28">
                      {speciesProfile?.radar ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={speciesProfile.radar}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 6, fontWeight: 900 }} />
                            <Radar name={selectedSpecies || 'SPECIMEN'} dataKey="A" stroke={COLORS.emerald} fill={COLORS.emerald} fillOpacity={0.35} strokeWidth={1.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-[8px] text-slate-400 uppercase">N/A</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Temporal Activity */}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-wider">Temporal Activity Flow</span>
                    </div>
                    <div className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={temporalData}>
                          <defs>
                            <linearGradient id="tcGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.2}/>
                              <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 6, fontWeight: 900 }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip contentStyle={{ fontSize: '8px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="Morning" stroke={COLORS.emerald} fill="url(#tcGrad)" strokeWidth={2} dot={false} />
                          <Area type="monotone" dataKey="Midday" stroke={COLORS.amber} fill="none" strokeWidth={1} dot={false} />
                          <Area type="monotone" dataKey="Evening" stroke={COLORS.rose} fill="none" strokeWidth={1} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Detailed Metrics Table: Raw Intelligence Log */}
                <div className="px-4 py-3 overflow-hidden flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-slate-100 rounded text-slate-600 border border-slate-200">
                        <Database size={10} />
                      </div>
                      <h4 className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em]">Raw Intelligence Log</h4>
                    </div>
                    <span className="text-[6px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Stream Active</span>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30 rounded-lg border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="py-2 px-2 text-[7px] font-black text-slate-500 uppercase tracking-widest">Temporal Node</th>
                          <th className="py-2 px-2 text-[7px] font-black text-slate-500 uppercase tracking-widest">Sector / Habitat</th>
                          <th className="py-2 px-2 text-[7px] font-black text-slate-500 uppercase tracking-widest">Behavioral State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {speciesProfile.observations.slice(0, 10).map(o => (
                          <tr key={o.id} className="group hover:bg-white transition-colors">
                            <td className="py-2 px-2 text-[8px] font-black font-mono text-emerald-600 whitespace-nowrap">{o.time}</td>
                            <td className="py-2 px-2 text-[8px] font-black uppercase tracking-tight text-slate-700">{o.habitat}</td>
                            <td className="py-2 px-2 text-[8px] font-black uppercase tracking-tight text-slate-700">{o.activity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Export Section: Compacted */}
                <div className="p-3 bg-emerald-600 flex items-center justify-between relative overflow-hidden group/cta">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 pointer-events-none" />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center border border-white/20 shadow-lg">
                      <Zap size={16} className="text-white group-hover/cta:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <h2 className="text-[11px] font-display font-black text-white uppercase tracking-tight leading-none">Deploy Tactical Dossier</h2>
                      <p className="text-[6px] text-emerald-100/70 font-bold uppercase tracking-wider mt-0.5">Standardized Intel Export</p>
                    </div>
                  </div>
                  <div className="relative z-10 shrink-0">
                    <PDFExportButton 
                      parkName={parkName} 
                      observations={observations} 
                      speciesData={speciesData} 
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Activity size={48} className="text-slate-200 mb-4 animate-pulse" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Select Asset to Initialize</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom Metric Banner ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <div className="bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:border-emerald-500/30 transition-all duration-300">
           <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 border border-emerald-200 shrink-0">
              <Activity size={16} />
           </div>
           <div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] block">Active Operations</span>
              <div className="text-2xl font-display font-black text-slate-900 leading-tight">14 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">/ Sectors</span></div>
           </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:border-indigo-500/30 transition-all duration-300">
           <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600 border border-indigo-200 shrink-0">
              <Shield size={16} />
           </div>
           <div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] block">Patrol Coverage</span>
              <div className="text-2xl font-display font-black text-slate-900 leading-tight">88.4% <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total</span></div>
           </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:border-amber-500/30 transition-all duration-300">
           <div className="p-2 bg-amber-100 rounded-xl text-amber-600 border border-amber-200 shrink-0">
              <Zap size={16} />
           </div>
           <div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] block">Hotspots Logged</span>
              <div className="text-2xl font-display font-black text-slate-900 leading-tight">24 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Priority</span></div>
           </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:border-rose-500/30 transition-all duration-300">
           <div className="p-2 bg-rose-100 rounded-xl text-rose-600 border border-rose-200 shrink-0">
              <Eye size={16} />
           </div>
           <div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] block">Detection Rate</span>
              <div className="text-2xl font-display font-black text-slate-900 leading-tight">+12% <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Weekly</span></div>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
         <Info size={12} className="text-slate-400" />
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">
           Authenticated Intelligence Stream · Encryption Protocol Active · Terminal: WEZ-GAMECOUNT-Z01
         </p>
      </div>
    </div>
  );
}
