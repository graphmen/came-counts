'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { gc, supabase } from '@/lib/supabase';
import { ArrowUpRight, ArrowDownRight, Leaf, CalendarDays, Activity, TrendingUp } from 'lucide-react';
import PremiumTrendChart from '@/components/charts/PremiumTrendChart';
import { useRouter, useSearchParams } from 'next/navigation';
import KPICard from '@/components/KPICard';

const SPECIES_LIST = [
    { name: 'Impala', emoji: '🦌', color: '#f59e0b', bgLight: 'bg-amber-50', border: '#f59e0b' },
    { name: 'Elephant', emoji: '🐘', color: '#7c3aed', bgLight: 'bg-violet-50', border: '#7c3aed' },
    { name: 'Cape Buffalo', emoji: '🐃', color: '#059669', bgLight: 'bg-emerald-50', border: '#059669' },
    { name: 'Zebra', emoji: '🦓', color: '#2563eb', bgLight: 'bg-blue-50', border: '#2563eb' },
    { name: 'Waterbuck', emoji: '🦌', color: '#0891b2', bgLight: 'bg-cyan-50', border: '#0891b2' },
    { name: 'Baboon', emoji: '🐒', color: '#db2777', bgLight: 'bg-pink-50', border: '#db2777' },
    { name: 'Eland', emoji: '🐂', color: '#c46a14', bgLight: 'bg-orange-50', border: '#c46a14' },
];

const fadeUp: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

function TrendAnalysisPageContent() {
    const searchParams = useSearchParams();
    const routeParkId = searchParams.get('parkId') || 'mana-pools-national-park';
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
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
            <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
            <p className="text-wez-muted text-sm font-medium">Loading population trends…</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h1 className="page-title">Population trends</h1>
                    <p className="page-subtitle">
                        Species monitoring across the census cycle for {park?.name}
                    </p>
                    <p className="page-meta flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} className="text-wez-green" strokeWidth={1.75} />
                            {history[0]?.year} – {lat?.year}
                        </span>
                        <span className="text-wez-stone-200">·</span>
                        <span>{selected.length} species selected</span>
                    </p>
                </div>

                <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--wez-border)] bg-white shadow-card">
                    <div className="flex -space-x-2">
                        {selected.slice(0, 3).map(s => (
                            <div key={s} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm bg-wez-stone shadow-sm">
                                {SPECIES_LIST.find(sl => sl.name === s)?.emoji}
                            </div>
                        ))}
                    </div>
                    <span className="label-muted ml-1">{selected.length} active</span>
                </div>
            </header>

            {metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard 
                        title="Latest count" 
                        value={metrics.t.toLocaleString()} 
                        icon={Activity} 
                        color="#486830"
                        trend={{ value: Math.abs(metrics.change), isPositive: metrics.change >= 0 }}
                        description={`From ${selected.length} species`}
                    />
                    <KPICard 
                        title="Historical peak" 
                        value={metrics.peak.toLocaleString()} 
                        icon={TrendingUp} 
                        color="#5a7c3a"
                        description="Max recorded in cycle"
                    />
                    <KPICard 
                        title="Survey years" 
                        value={metrics.yrs} 
                        icon={CalendarDays} 
                        color="#486830"
                        description="Years with data"
                    />
                    <KPICard 
                        title="Species tracked" 
                        value={selected.length} 
                        icon={Leaf} 
                        color="#5a7c3a"
                        description="Current selection"
                    />
                </div>
            )}

            <div className="flex flex-col xl:flex-row gap-6 items-start">
                <div className="flex-1 surface-panel overflow-hidden w-full">
                    <div className="px-5 py-4 border-b border-[var(--wez-border)] flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-wez-ink">Trend comparison</h2>
                            <p className="label-muted mt-1">Multi-species population over time</p>
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

                <div className="w-full xl:w-64 surface-panel p-4">
                    <h3 className="label-muted mb-3 px-1">Compare species</h3>
                    <div className="space-y-1.5">
                        {SPECIES_LIST.map(sp => {
                            const active = selected.includes(sp.name);
                            const count = lat?.[sp.name];
                            return (
                                <button
                                    key={sp.name}
                                    onClick={() => toggle(sp.name)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md border transition-all ${active ? 'bg-white border-wez-green/30 shadow-card' : 'bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-wez-stone'}`}
                                >
                                    <span className="text-2xl flex-shrink-0">{sp.emoji}</span>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-wez-ink leading-none">{sp.name}</p>
                                        <p className="label-muted mt-1">
                                            {count ? count.toLocaleString() : 'No data'}
                                        </p>
                                    </div>
                                    {active && <div className="w-2 h-2 rounded-full bg-wez-green" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <footer className="pt-4 border-t border-[var(--wez-border)] text-center">
                <p className="label-muted">
                    Source: WEZ Central Registry
                </p>
            </footer>
        </div>
    );
}

export default function TrendAnalysisPage(props: any) {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
                <p className="text-wez-muted text-sm font-medium">Loading population trends…</p>
            </div>
        }>
            <TrendAnalysisPageContent {...props} />
        </Suspense>
    );
}
