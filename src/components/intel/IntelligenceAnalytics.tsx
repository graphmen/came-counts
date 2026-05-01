'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Activity } from 'lucide-react';

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
      { name: 'Male', value: m, color: '#3b82f6' },
      { name: 'Female', value: f, color: '#ec4899' },
      { name: 'Unknown', value: u, color: '#94a3b8' }
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
      <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
        <Activity size={48} className="mb-4 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest">Insufficient Intelligence for Analytics</p>
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30">
      
      {/* Species Distribution */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={14} className="text-emerald-600" />
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest font-display">Species Density Matrix</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={speciesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80} 
                fontSize={9} 
                fontWeight={900} 
                tick={{ fill: '#64748b', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temporal Trends */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={14} className="text-indigo-600" />
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest font-display">Survey Temporal Flow</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={temporalData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                fontSize={8} 
                fontWeight={900} 
                tick={{ fill: '#64748b', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis fontSize={8} fontWeight={900} tick={{ fill: '#64748b', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Balance */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <PieChartIcon size={14} className="text-pink-600" />
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest font-display">Population Gender Split</h3>
        </div>
        <div className="h-64 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="middle" 
                align="right" 
                layout="vertical"
                formatter={(value) => <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-display">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habitat Usage */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={14} className="text-amber-600" />
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest font-display">Habitat Preference Intelligence</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={habitatData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                fontSize={7} 
                fontWeight={900} 
                tick={{ fill: '#64748b', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis fontSize={8} fontWeight={900} tick={{ fill: '#64748b', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
