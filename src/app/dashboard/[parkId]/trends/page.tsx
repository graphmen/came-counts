'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { gc, supabase } from '@/lib/supabase';
import { ArrowUpRight, ArrowDownRight, Leaf, CalendarDays, Activity, TrendingUp } from 'lucide-react';
import PremiumTrendChart from '@/components/charts/PremiumTrendChart';
import { useRouter, useParams } from 'next/navigation';
import KPICard from '@/components/KPICard';

const SPECIES_LIST = [
    { name: 'Impala', emoji: '🦌', color: '#f59e0b', bgLight: 'bg-amber-50', border: '#f59e0b' },
    { name: 'Elephant', emoji: '🐘', color: '#7c3aed', bgLight: 'bg-violet-50', border: '#7c3aed' },
    { name: 'Cape Buffalo', emoji: '🐃', color: '#059669', bgLight: 'bg-emerald-50', border: '#059669' },
    { name: 'Zebra', emoji: '🦓', color: '#2563eb', bgLight: 'bg-blue-50', border: '#2563eb' },
    { name: 'Waterbuck', emoji: '🦌', color: '#0891b2', bgLight: 'bg-cyan-50', border: '#0891b2' },
    { name: 'Baboon', emoji: '🐒', color: '#db2777', bgLight: 'bg-pink-50', border: '#db2777' },
    { name: 'Eland', emoji: '🐂', color: '#b45309', bgLight: 'bg-orange-50', border: '#b45309' },
];

const fadeUp: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export default function TrendAnalysisPage({ params }: { params: Promise<{ parkId: string }> }) {
    const { parkId: routeParkId } = React.use(params);
    const [history, setHistory] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>(['Impala', 'Elephant', 'Cape Buffalo']);
    const [park, setPark] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                // Fetch park metadata first
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routeParkId);
                const { data: pData } = await supabase
                    .from('parks')
                    .select('*')
                    .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? routeParkId : `%${routeParkId.replace(/-/g, ' ')}%`)
                    .single();
                
                setPark(pData);

                if (pData) {
                    // Fetch species totals specifically for this park's surveys
                    // Joining surveys to ensure we only get this park's data
                    const { data } = await supabase
                        .from('v_survey_species_totals')
                        .select('year, species, total_count, survey_id')
                        .eq('park_id', pData.id)
                        .order('year', { ascending: true });

                    const map: Record<number, any> = {};
                    data?.forEach(d => {
                        if (!map[d.year]) map[d.year] = { year: d.year };
                        map[d.year][d.species] = (map[d.year][d.species] || 0) + d.total_count;
                    });
                    setHistory(Object.values(map).sort((a, b) => a.year - b.year));
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        })();
    }, [routeParkId]);

    const metrics = useMemo(() => {
        if (history.length < 2) return null;
        const cur = history[history.length - 1];
        const prev = history[history.length - 2];
        const t = selected.reduce((s, n) => s + (cur[n] || 0), 0);
        const pt = selected.reduce((s, n) => s + (prev[n] || 0), 0);
        const peak = Math.max(...history.map(h => selected.reduce((s, n) => s + (h[n] || 0), 0)));
        return { t, pt, peak, change: pt ? ((t - pt) / pt) * 100 : 0, yrs: history.length };
    }, [history, selected]);

    const toggle = (n: string) =>
        setSelected(p => p.includes(n) ? p.filter(s => s !== n) : [...p, n]);

    const lat = history.at(-1);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
                    style={{ borderColor: '#1a7a4a', borderTopColor: 'transparent' }} />
                <p style={{ color: '#64748b', fontWeight: 600, fontSize: 14 }}>Loading 30-year trends…</p>
            </div>
        </div>
    );

    return (
        <div className="fade-in">
            {/* ── Header ───────────────────────────────────────── */}
            <header className="relative p-6 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden group mb-6">
                {/* Decorative Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-md border border-emerald-100">
                                <TrendingUp size={14} className="text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Temporal Intelligence</span>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Integrity: Verified</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight leading-none uppercase">
                                Population Trends
                            </h1>
                            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 hidden sm:block flex items-center gap-2 text-xs font-bold text-slate-600">
                                <CalendarDays size={16} className="text-emerald-600" />
                                {history[0]?.year} – {lat?.year}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                           <Leaf size={16} className="text-emerald-600" />
                           Longitudinal species monitoring across the 30-year census cycle for {park?.name}.
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex -space-x-2">
                            {selected.slice(0, 3).map(s => (
                                <div key={s} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm bg-white shadow-sm">
                                    {SPECIES_LIST.find(sl => sl.name === s)?.emoji}
                                </div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-2">{selected.length} Taxa Active</span>
                    </div>
                </div>
            </header>

            {/* ── KPI Strip ────────────────────────────────────── */}
            {metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard 
                        title="Latest Count" 
                        value={metrics.t.toLocaleString()} 
                        icon={Activity} 
                        color="#10b981"
                        trend={{ value: Math.abs(metrics.change), isPositive: metrics.change >= 0 }}
                        description={`Aggregated from ${selected.length} taxa`}
                    />
                    <KPICard 
                        title="Historical Peak" 
                        value={metrics.peak.toLocaleString()} 
                        icon={TrendingUp} 
                        color="#3b82f6"
                        description="Max recorded in cycle"
                    />
                    <KPICard 
                        title="Survey Years" 
                        value={metrics.yrs} 
                        icon={CalendarDays} 
                        color="#f59e0b"
                        description="Continuous data nodes"
                    />
                    <KPICard 
                        title="Monitoring Density" 
                        value={selected.length} 
                        icon={Leaf} 
                        color="#8b5cf6"
                        description="Active taxa selection"
                    />
                </div>
            )}

            {/* ── Main Section ─────────────────────────────────── */}
            <div className="flex flex-col xl:flex-row gap-6 items-start">
                {/* Chart Segment */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider leading-none">Intelligence Graph</h2>
                            <p className="text-xs text-slate-500 font-semibold mt-1.5 uppercase hover:text-emerald-700 transition-colors cursor-default">Comparison Dashboard · Multi-Taxa</p>
                        </div>
                        <div className="flex gap-2">
                            {selected.map(sn => (
                                <div key={sn} className="w-2 h-2 rounded-full" style={{ backgroundColor: SPECIES_LIST.find(s => s.name === sn)?.color }} />
                            ))}
                        </div>
                    </div>
                    <div className="p-4 h-[360px]">
                        <PremiumTrendChart data={history} selectedSpecies={selected} speciesList={SPECIES_LIST} />
                    </div>
                </div>

                {/* Compact Species Selector */}
                <div className="w-full xl:w-64 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Taxa Comparison</h3>
                    <div className="space-y-2">
                        {SPECIES_LIST.map(sp => {
                            const active = selected.includes(sp.name);
                            const count = lat?.[sp.name];
                            return (
                                <button
                                    key={sp.name}
                                    onClick={() => toggle(sp.name)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${active ? 'bg-white border-none shadow-sm ring-2 ring-emerald-500/30' : 'bg-transparent border-transparent grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:bg-white/60'}`}
                                >
                                    <span className="text-2xl flex-shrink-0">{sp.emoji}</span>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-bold text-slate-900 leading-none">{sp.name}</p>
                                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                                            {count ? `${count.toLocaleString()} CNT` : 'NO DATA'}
                                        </p>
                                    </div>
                                    {active && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <footer className="pt-6 border-t border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Source: WEZ Central Registry · Longitudinal Ecological Audit
                </p>
            </footer>
        </div>
    );
}
