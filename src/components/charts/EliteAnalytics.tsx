'use client';

import { Card } from '@/components/ui/card';
import { Leaf, Users, Map as MapIcon, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import KPICard from '@/components/KPICard';

interface StatsProps {
  parkName: string;
  totalSightings: number;
  observerCount: number;
  speciesCount: number;
  dataPointGrowth: number;
  speciesData?: any[];
}

export default function EliteAnalytics({ stats }: { stats: StatsProps }) {
  const chartData = stats.speciesData?.length 
    ? stats.speciesData.slice(0, 6).map(s => ({ 
        name: (s.species && s.species !== 'undefined') ? s.species : 'Unidentified', 
        count: s.total_count 
      }))
    : [];

  const hasData = stats.totalSightings > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight">Intelligence Operational Center</h3>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">Real-time Conservation KPI Pipeline v15</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
           <Activity size={14} className="text-emerald-600 animate-pulse" />
           <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest">{hasData ? 'LIVE_LINK' : 'OFFLINE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard 
          title="Verified Sightings" 
          value={stats.totalSightings.toLocaleString()} 
          icon={Activity}
          color="#10b981"
          trend={hasData ? { value: 12, isPositive: true } : undefined}
        />
        <KPICard 
          title="Active Observers" 
          value={hasData ? stats.observerCount : 0} 
          icon={Users}
          color="#3b82f6"
        />
        <KPICard 
          title="Species Catalog" 
          value={stats.speciesCount} 
          icon={Leaf}
          color="#f59e0b"
        />
        <KPICard 
          title="Metric Density" 
          value={hasData ? `+${stats.dataPointGrowth}%` : '0%'} 
          icon={TrendingUp}
          color="#8b5cf6"
          trend={hasData ? { value: 4, isPositive: true } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 glass-card p-6 border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 relative z-10 gap-4">
              <div>
                  <h4 className="text-lg font-display font-bold text-slate-900 tracking-tight">Species Distribution Network</h4>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Census density by taxonomic classification</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-md shadow-sm border border-slate-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Density</span>
                  </div>
              </div>
          </div>
          
          <div className="h-48 w-full font-mono text-xs">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={(val) => Intl.NumberFormat('us').format(val)} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#10b981" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-100 rounded-xl">
                 <Activity size={24} className="opacity-20" />
                 <p className="font-bold text-[10px] uppercase tracking-widest">No Ecological Data for this Node</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="glass-card p-6 border-slate-200 shadow-sm relative overflow-hidden group">
            <h4 className="text-lg font-display font-bold text-slate-900 tracking-tight mb-1">Gender Analysis</h4>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">Demographic breakdown</p>
            
            <div className="space-y-6">
                {hasData ? (() => {
                    const males = stats.speciesData?.reduce((acc, s) => acc + (s.male_count || 0), 0) || 0;
                    const females = stats.speciesData?.reduce((acc, s) => acc + (s.female_count || 0), 0) || 0;
                    const unknown = stats.totalSightings - males - females;
                    const total = stats.totalSightings || 1;

                    return (
                        <>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                <div style={{ width: `${(males/total)*100}%` }} className="bg-blue-500 h-full" title="Males" />
                                <div style={{ width: `${(females/total)*100}%` }} className="bg-pink-500 h-full" title="Females" />
                                <div style={{ width: `${(unknown/total)*100}%` }} className="bg-slate-300 h-full" title="Unknown" />
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Male Population</span>
                                    </div>
                                    <span className="text-xs font-bold text-blue-700">{males.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 bg-pink-50/50 rounded-xl border border-pink-100/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Female Population</span>
                                    </div>
                                    <span className="text-xs font-bold text-pink-700">{females.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Unidentified Sex</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">{unknown.toLocaleString()}</span>
                                </div>
                            </div>
                        </>
                    );
                })() : (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-50 rounded-xl">
                        <Users size={20} className="opacity-20" />
                    </div>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
}
