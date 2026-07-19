'use client';

import { Card } from '@/components/ui/card';
import { Leaf, Users, Activity, TrendingUp } from 'lucide-react';
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
    <div className="space-y-5 p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h3 className="section-title">{stats.parkName}</h3>
          <p className="label-muted mt-1">Census summary and species distribution</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-wez-muted">
           <span className={`w-1.5 h-1.5 rounded-full ${hasData ? 'bg-wez-green-light' : 'bg-wez-faint'}`} />
           {hasData ? 'Data available' : 'No data'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard 
          title="Verified sightings" 
          value={stats.totalSightings.toLocaleString()} 
          icon={Activity}
          color="#486830"
          trend={hasData ? { value: 12, isPositive: true } : undefined}
        />
        <KPICard 
          title="Active observers" 
          value={hasData ? stats.observerCount : 0} 
          icon={Users}
          color="#5a7c3a"
        />
        <KPICard 
          title="Species catalog" 
          value={stats.speciesCount} 
          icon={Leaf}
          color="#486830"
        />
        <KPICard 
          title="Metric density" 
          value={hasData ? `+${stats.dataPointGrowth}%` : '0%'} 
          icon={TrendingUp}
          color="#c46a14"
          trend={hasData ? { value: 4, isPositive: true } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-2">
              <div>
                  <h4 className="section-title">Species distribution</h4>
                  <p className="label-muted mt-1">Top species by count</p>
              </div>
          </div>
          
          <div className="h-48 w-full">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b6458', fontSize: 11, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b6458', fontSize: 11 }} tickFormatter={(val) => Intl.NumberFormat('us').format(val)} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(72, 104, 48, 0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid rgba(43,27,16,0.08)', boxShadow: '0 4px 12px rgba(43,27,16,0.06)', fontSize: '12px', fontFamily: 'Outfit, sans-serif' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 3 === 2 ? '#6b8f48' : index % 2 === 1 ? '#5a7c3a' : '#486830'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-wez-faint gap-2 border border-dashed border-[var(--wez-border)] rounded-md">
                 <Activity size={22} className="opacity-40" />
                 <p className="label-muted">No species data for this survey</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
            <h4 className="section-title mb-1">Gender analysis</h4>
            <p className="label-muted mb-5">Demographic breakdown</p>
            
            <div className="space-y-5">
                {hasData ? (() => {
                    const males = stats.speciesData?.reduce((acc, s) => acc + (s.male_count || 0), 0) || 0;
                    const females = stats.speciesData?.reduce((acc, s) => acc + (s.female_count || 0), 0) || 0;
                    const unknown = stats.totalSightings - males - females;
                    const total = stats.totalSightings || 1;

                    return (
                        <>
                            <div className="h-2.5 w-full bg-wez-stone-100 rounded-full overflow-hidden flex">
                                <div style={{ width: `${(males/total)*100}%` }} className="bg-wez-green h-full" title="Males" />
                                <div style={{ width: `${(females/total)*100}%` }} className="bg-wez-sunset h-full" title="Females" />
                                <div style={{ width: `${(unknown/total)*100}%` }} className="bg-wez-stone-200 h-full" title="Unknown" />
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center justify-between p-2.5 bg-wez-mint/70 rounded-sm border border-wez-green/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-wez-green" />
                                        <span className="text-xs font-medium text-wez-muted">Male</span>
                                    </div>
                                    <span className="text-sm font-semibold tabular-nums text-wez-green">{males.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 bg-wez-sunset-soft rounded-sm border border-wez-sunset/15">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-wez-sunset" />
                                        <span className="text-xs font-medium text-wez-muted">Female</span>
                                    </div>
                                    <span className="text-sm font-semibold tabular-nums text-wez-sunset">{females.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 bg-wez-stone/80 rounded-sm border border-[var(--wez-border)]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-wez-stone-200" />
                                        <span className="text-xs font-medium text-wez-muted">Unknown</span>
                                    </div>
                                    <span className="text-sm font-semibold tabular-nums text-wez-muted">{unknown.toLocaleString()}</span>
                                </div>
                            </div>
                        </>
                    );
                })() : (
                    <div className="h-32 flex flex-col items-center justify-center text-wez-faint border border-dashed border-[var(--wez-border)] rounded-md">
                        <Users size={20} className="opacity-40" />
                    </div>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
}
