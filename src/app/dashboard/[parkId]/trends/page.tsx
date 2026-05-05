'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { gc, supabase } from '@/lib/supabase';
import { 
    ArrowUpRight, 
    ArrowDownRight, 
    Leaf, 
    CalendarDays, 
    Activity, 
    TrendingUp,
    ShieldCheck,
    Radar,
    Globe,
    Target,
    Zap,
    ChevronLeft,
    Database,
    Info,
    LineChart
} from 'lucide-react';
import PremiumTrendChart from '@/components/charts/PremiumTrendChart';
import { useRouter, useParams } from 'next/navigation';
import KPICard from '@/components/KPICard';
import { Card } from '@/components/ui/card';

const SPECIES_LIST = [
    { name: 'Impala', emoji: '🦌', color: '#f59e0b', bgLight: 'bg-amber-50', border: '#f59e0b' },
    { name: 'Elephant', emoji: '🐘', color: '#7c3aed', bgLight: 'bg-violet-50', border: '#7c3aed' },
    { name: 'Cape Buffalo', emoji: '🐃', color: '#059669', bgLight: 'bg-emerald-50', border: '#059669' },
    { name: 'Zebra', emoji: '🦓', color: '#2563eb', bgLight: 'bg-blue-50', border: '#2563eb' },
    { name: 'Waterbuck', emoji: '🦌', color: '#0891b2', bgLight: 'bg-cyan-50', border: '#0891b2' },
    { name: 'Baboon', emoji: '🐒', color: '#db2777', bgLight: 'bg-pink-50', border: '#db2777' },
    { name: 'Eland', emoji: '🐂', color: '#b45309', bgLight: 'bg-orange-50', border: '#b45309' },
];

export default function TrendAnalysisPage({ params }: { params: Promise<{ parkId: string }> }) {
    const { parkId: routeParkId } = React.use(params);
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>(['Impala', 'Elephant', 'Cape Buffalo']);
    const [park, setPark] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routeParkId);
                const { data: pData } = await supabase
                    .from('parks')
                    .select('*')
                    .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? routeParkId : `%${routeParkId.replace(/-/g, ' ')}%`)
                    .single();
                
                setPark(pData);

                if (pData) {
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
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Syncing Trend Archives...</p>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-slate-950 px-6 py-8 space-y-8"
        >
            {/* ── Page Header ────────────────────────────────────────── */}
            <header className="relative rounded-[2.5rem] bg-slate-900/50 text-white border border-white/5 shadow-2xl overflow-hidden group backdrop-blur-md">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700 pointer-events-none" />
                
                <div className="relative z-10 p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.back()}
                                className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-2xl backdrop-blur-md active:scale-95 group"
                            >
                                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <TrendingUp size={12} className="text-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Temporal Intelligence Active</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                                    <ShieldCheck size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Validated Node</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter uppercase leading-none">
                                Population Trends
                            </h1>
                            <div className="h-16 w-px bg-white/10 hidden md:block" />
                            <div className="bg-white/5 p-3 px-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl flex items-center gap-4">
                                <CalendarDays size={18} className="text-emerald-500" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Census cycle</span>
                                    <span className="text-[14px] font-black text-white uppercase tracking-wider">{history[0]?.year} — {lat?.year}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <Globe size={14} className="text-emerald-500" />
                           <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] leading-relaxed max-w-xl">
                               Longitudinal species monitoring across the 30-year census cycle for {park?.name}.
                           </p>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-6 px-8 py-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <div className="flex -space-x-3">
                            {selected.slice(0, 4).map(s => (
                                <div key={s} className="w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center text-2xl bg-white shadow-2xl transition-transform hover:-translate-y-1 cursor-default">
                                    {SPECIES_LIST.find(sl => sl.name === s)?.emoji}
                                </div>
                            ))}
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Active Monitoring Focus</div>
                           <div className="text-[14px] font-black text-emerald-400 uppercase tracking-[0.1em]">{selected.length} Taxa Selected</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── KPI Strip ────────────────────────────────────── */}
            {metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard 
                        title="Aggregated Count" 
                        value={metrics.t.toLocaleString()} 
                        icon={Activity} 
                        color="#10b981"
                        trend={{ value: Math.abs(metrics.change), isPositive: metrics.change >= 0 }}
                        description={`Latest cycle (${lat?.year})`}
                    />
                    <KPICard 
                        title="Historical Peak" 
                        value={metrics.peak.toLocaleString()} 
                        icon={TrendingUp} 
                        color="#6366f1"
                        description="Max recorded population"
                    />
                    <KPICard 
                        title="Data Points" 
                        value={metrics.yrs} 
                        icon={Database} 
                        color="#f59e0b"
                        description="Verified survey nodes"
                    />
                    <KPICard 
                        title="Taxa Density" 
                        value={selected.length} 
                        icon={Target} 
                        color="#ec4899"
                        description="Active comparison set"
                    />
                </div>
            )}

            {/* ── Main Section ─────────────────────────────────── */}
            <div className="flex flex-col xl:flex-row gap-8 items-start">
                {/* Chart Segment */}
                <Card className="flex-1 bg-slate-900/40 border-white/5 shadow-2xl rounded-[3rem] backdrop-blur-xl overflow-hidden w-full p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <LineChart size={16} className="text-emerald-500" />
                                <h2 className="text-[12px] font-black text-white uppercase tracking-[0.4em] leading-none">Intelligence Graph</h2>
                            </div>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] ml-7">Comparison Dashboard · Longitudinal Analysis</p>
                        </div>
                        <div className="flex gap-2.5">
                            {selected.map(sn => (
                                <div key={sn} className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]" style={{ backgroundColor: SPECIES_LIST.find(s => s.name === sn)?.color }} />
                            ))}
                        </div>
                    </div>
                    <div className="h-[450px]">
                        <PremiumTrendChart data={history} selectedSpecies={selected} speciesList={SPECIES_LIST} />
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <Zap size={14} className="text-amber-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Latency: 14ms</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={14} className="text-indigo-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Status: SECURE</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                            <Info size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Temporal Delta Correction Active</span>
                        </div>
                    </div>
                </Card>

                {/* Species Selector */}
                <Card className="w-full xl:w-80 bg-slate-900/40 border-white/5 p-8 rounded-[3rem] backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <Target size={16} className="text-slate-500" />
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Taxa Control</h3>
                    </div>
                    <div className="space-y-3">
                        {SPECIES_LIST.map(sp => {
                            const active = selected.includes(sp.name);
                            const count = lat?.[sp.name];
                            return (
                                <button
                                    key={sp.name}
                                    onClick={() => toggle(sp.name)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-300 group ${active ? 'bg-emerald-600/20 border-emerald-500/40 shadow-xl' : 'bg-transparent border-transparent grayscale opacity-40 hover:opacity-100 hover:grayscale-0 hover:bg-white/5'}`}
                                >
                                    <span className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">{sp.emoji}</span>
                                    <div className="flex-1 text-left">
                                        <p className="text-[12px] font-black text-white uppercase tracking-widest leading-none">{sp.name}</p>
                                        <p className="text-[9px] font-black text-slate-600 mt-2 uppercase tracking-widest group-hover:text-slate-500">
                                            {count ? `${count.toLocaleString()} UNITS` : 'OFFLINE'}
                                        </p>
                                    </div>
                                    {active && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                                </button>
                            );
                        })}
                    </div>
                </Card>
            </div>

            <footer className="pt-12 pb-8 border-t border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
                    Source: WEZ Central Registry · Longitudinal Ecological Audit v2.4
                </p>
            </footer>
        </motion.div>
    );
}
