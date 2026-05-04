'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Activity, MapPin, Database } from 'lucide-react';

interface Observation {
  species: string;
  count: number;
  day_of_week: string;
  period_of_day: string;
  male_count: number;
  female_count: number;
  unknown_count: number;
  habitat: string;
  activity: string;
}

const COLORS = {
  emerald: '#10b981',
  indigo: '#6366f1',
  amber: '#f59e0b',
  rose: '#f43f5e',
  pink: '#ec4899',
  blue: '#3b82f6',
  slate: '#64748b',
};

export default function IntelligenceAnalytics({ observations }: { observations: Observation[] }) {
  
  // 1. Species Distribution
  const speciesData = useMemo(() => {
    const map: Record<string, number> = {};
    observations.forEach(o => {
      map[o.species] = (map[o.species] || 0) + o.count;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [observations]);

  // 2. Temporal Distribution (Day/Slot)
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

  // 3. Overall Gender Ratio
  const genderData = useMemo(() => {
    let m = 0, f = 0, u = 0;
    observations.forEach(o => {
      m += o.male_count || 0;
      f += o.female_count || 0;
      u += o.unknown_count || 0;
    });
    return [
      { name: 'Male', value: m, color: COLORS.blue },
      { name: 'Female', value: f, color: COLORS.pink },
      { name: 'Unknown', value: u, color: COLORS.slate }
    ].filter(g => g.value > 0);
  }, [observations]);

  // 4. Habitat usage
  const habitatData = useMemo(() => {
    const map: Record<string, number> = {};
    observations.forEach(o => {
      map[o.habitat] = (map[o.habitat] || 0) + o.count;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [observations]);

  if (observations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-slate-600 bg-slate-950/50 rounded-3xl border border-white/5 backdrop-blur-sm">
        <Activity size={48} className="mb-4 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Insufficient Intelligence for Analytics</p>
      </div>
    );
  }

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/30 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl">
      
      {/* Species Distribution */}
      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-md group hover:border-emerald-500/20 transition-all">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <BarChart3 size={16} />
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-display">Species Density Matrix</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={speciesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80} 
                fontSize={9} 
                fontWeight={900} 
                tick={{ fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold' }}
                itemStyle={{ color: COLORS.emerald }}
              />
              <Bar dataKey="value" fill={COLORS.emerald} radius={[0, 6, 6, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temporal Trends */}
      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-md group hover:border-indigo-500/20 transition-all">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
            <TrendingUp size={16} />
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-display">Survey Temporal Flow</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={temporalData}>
              <defs>
                <linearGradient id="colorCountAnalytic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis 
                dataKey="name" 
                fontSize={8} 
                fontWeight={900} 
                tick={{ fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis fontSize={8} fontWeight={900} tick={{ fill: '#94a3b8', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold' }}
                itemStyle={{ color: COLORS.indigo }}
              />
              <Area type="monotone" dataKey="count" stroke={COLORS.indigo} strokeWidth={4} fillOpacity={1} fill="url(#colorCountAnalytic)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Balance */}
      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-md group hover:border-pink-500/20 transition-all">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400 border border-pink-500/20">
            <PieChartIcon size={16} />
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-display">Population Gender Split</h3>
        </div>
        <div className="h-72 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="middle" 
                align="right" 
                layout="vertical"
                formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-display">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habitat Usage */}
      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-md group hover:border-amber-500/20 transition-all">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <MapPin size={16} />
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-display">Habitat Preference Intelligence</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={habitatData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis 
                dataKey="name" 
                fontSize={8} 
                fontWeight={900} 
                tick={{ fill: '#94a3b8', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis fontSize={8} fontWeight={900} tick={{ fill: '#94a3b8', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold' }}
                itemStyle={{ color: COLORS.amber }}
              />
              <Bar dataKey="value" fill={COLORS.amber} radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
