'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { gc } from '@/lib/supabase';
import { ArrowUpRight, ArrowDownRight, Leaf, CalendarDays } from 'lucide-react';
import PremiumTrendChart from '@/components/charts/PremiumTrendChart';

const SPECIES_LIST = [
    { name: 'Impala', emoji: '🦌', color: '#f59e0b', bgLight: '#fffbeb', border: '#f59e0b' },
    { name: 'Elephant', emoji: '🐘', color: '#7c3aed', bgLight: '#f5f3ff', border: '#7c3aed' },
    { name: 'Cape Buffalo', emoji: '🐃', color: '#059669', bgLight: '#ecfdf5', border: '#059669' },
    { name: 'Zebra', emoji: '🦓', color: '#2563eb', bgLight: '#eff6ff', border: '#2563eb' },
    { name: 'Waterbuck', emoji: '🦬', color: '#0891b2', bgLight: '#ecfeff', border: '#0891b2' },
    { name: 'Baboon', emoji: '🐒', color: '#db2777', bgLight: '#fdf2f8', border: '#db2777' },
    { name: 'Eland', emoji: '🦣', color: '#b45309', bgLight: '#fef3c7', border: '#b45309' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

export default function TrendAnalysisPage({ params }: { params: { parkId: string } }) {
    const { parkId: routeParkId } = params;
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
                const { data: pData } = await gc
                    .from('parks')
                    .select('*')
                    .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? routeParkId : `%${routeParkId.replace(/-/g, ' ')}%`)
                    .single();
                
                setPark(pData);

                if (pData) {
                    // Fetch species totals specifically for this park's surveys
                    // Joining surveys to ensure we only get this park's data
                    const { data } = await gc
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
            <motion.div initial="hidden" animate="show" variants={fadeUp} style={{ marginBottom: 28 }}>
                <p style={{
                    display: 'flex', alignItems: 'center', gap: 6, color: '#1a7a4a', fontWeight: 700,
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10
                }}>
                    <Leaf size={12} /> Wildlife &amp; Environment Zimbabwe · {park?.name || 'Loading...'}
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.1 }}>
                            Population Trends
                        </h1>
                        <p style={{ color: '#64748b', marginTop: 8, fontSize: 14, maxWidth: 500, lineHeight: 1.6 }}>
                            Longitudinal species monitoring across the 1993–2025 census cycle.
                            Select species to compare population dynamics side-by-side.
                        </p>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, fontSize: 13,
                        fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                        <CalendarDays size={15} color="#1a7a4a" />
                        {history[0]?.year} – {lat?.year}
                    </div>
                </div>
            </motion.div>

            {/* ── KPI Strip ────────────────────────────────────── */}
            {metrics && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24
                }}>
                    {[
                        { label: 'Latest Count', value: metrics.t.toLocaleString(), sub: `vs ${metrics.pt.toLocaleString()} prior`, trend: metrics.change },
                        { label: 'Historical Peak', value: metrics.peak.toLocaleString(), sub: 'selected taxa', trend: null },
                        { label: 'Survey Years', value: `${metrics.yrs}`, sub: 'continuous records', trend: null },
                        { label: 'Taxa Monitored', value: `${SPECIES_LIST.length}`, sub: `${selected.length} active`, trend: null },
                    ].map((k, i) => (
                        <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            style={{
                                background: '#fff', border: '1px solid #f1f5f9', borderLeft: '4px solid #1a7a4a',
                                borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                            }}>
                            <p style={{
                                fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase',
                                letterSpacing: '0.14em', marginBottom: 6
                            }}>{k.label}</p>
                            <p style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: 0 }}>{k.value}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: 0 }}>{k.sub}</p>
                                {k.trend !== null && (
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700,
                                        padding: '2px 8px', borderRadius: 20,
                                        background: k.trend >= 0 ? '#f0fdf4' : '#fff1f2',
                                        color: k.trend >= 0 ? '#16a34a' : '#e11d48'
                                    }}>
                                        {k.trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                        {Math.abs(k.trend).toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ── Main Section ─────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>

                {/* Chart Card */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.18 }}
                    style={{
                        flex: 1, minWidth: 0, background: '#fff', border: '1px solid #f1f5f9',
                        borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden'
                    }}>
                    {/* Card header */}
                    <div style={{ padding: '22px 28px 18px', borderBottom: '1px solid #f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <h2 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: 0 }}>Multi-Species Overview</h2>
                                <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginTop: 3 }}>
                                    Hover chart for exact counts · 5-year x-axis
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {selected.map(sn => {
                                    const sp = SPECIES_LIST.find(s => s.name === sn);
                                    return sp ? (
                                        <span key={sn} style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                                            borderRadius: 20, fontSize: 12, fontWeight: 700,
                                            color: sp.color, border: `1.5px solid ${sp.color}50`, background: sp.bgLight
                                        }}>
                                            {sp.emoji} {sp.name}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '20px 24px', height: 480 }}>
                        <PremiumTrendChart data={history} selectedSpecies={selected} speciesList={SPECIES_LIST} />
                    </div>
                </motion.div>

                {/* Species Selector */}
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.26 }}
                    style={{
                        width: 240, flexShrink: 0, background: '#fff', border: '1px solid #f1f5f9',
                        borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: 16
                    }}>
                    <div style={{ padding: '6px 8px 14px', borderBottom: '1px solid #f8fafc', marginBottom: 10 }}>
                        <h3 style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', margin: 0 }}>Select Species</h3>
                        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 3 }}>Tap to toggle on chart</p>
                    </div>

                    {SPECIES_LIST.map(sp => {
                        const active = selected.includes(sp.name);
                        const count = lat?.[sp.name];
                        return (
                            <motion.button
                                key={sp.name}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => toggle(sp.name)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 14px', borderRadius: 16, marginBottom: 6, cursor: 'pointer',
                                    background: active ? sp.bgLight : '#f8fafc',
                                    border: `2px solid ${active ? sp.color : 'transparent'}`,
                                    boxShadow: active ? `0 2px 12px ${sp.color}25` : 'none',
                                    textAlign: 'left', transition: 'all 0.18s ease',
                                }}
                            >
                                <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{sp.emoji}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        fontWeight: 800, color: '#0f172a', fontSize: 13, margin: 0,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}>
                                        {sp.name}
                                    </p>
                                    <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, margin: '2px 0 0' }}>
                                        {count ? `${count.toLocaleString()} · 2025` : '—'}
                                    </p>
                                </div>
                                {/* Checkmark */}
                                <div style={{
                                    width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? sp.color : '#cbd5e1'}`,
                                    background: active ? sp.color : '#fff', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s ease',
                                }}>
                                    {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>

            {/* ── Footnote ─────────────────────────────────────── */}
            <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 24 }}>
                Source: WEZ standardised aerial &amp; ground transect protocols · Gaps indicate years with no recorded survey
            </p>
        </div>
    );
}
