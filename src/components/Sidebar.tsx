'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Park } from '@/types';
import {
    LayoutDashboard,
    BarChart3,
    TrendingUp,
    Droplets,
    FileText,
    Globe,
    PlusCircle,
    Navigation,
    MapPin,
    Radar
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const parkId = searchParams.get('parkId') || '';

    const [parks, setParks] = useState<Park[]>([]);
    const [currentPark, setCurrentPark] = useState<Park | null>(null);

    useEffect(() => {
        async function fetchParks() {
            const { data } = await supabase.from('parks').select('*').order('name');
            if (data) {
                setParks(data);
                if (parkId) {
                    const active = data.find(p =>
                        p.id === parkId ||
                        p.name.toLowerCase().replace(/\s+/g, '-') === parkId.toLowerCase()
                    );
                    setCurrentPark(active || null);
                }
            }
        }
        fetchParks();
    }, [parkId]);

    const globalNav = [
        { label: 'WEZ Overview', href: '/', icon: <Globe size={18} strokeWidth={1.75} /> },
        { label: 'All Parks', href: '/dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.75} /> },
    ];

    const parkNav = parkId ? [
        { label: 'Dashboard', href: `/dashboard/park?parkId=${parkId}`, icon: <Navigation size={18} strokeWidth={1.75} /> },
        { label: 'Operational Intel', href: `/dashboard/park/intelligence?parkId=${parkId}`, icon: <Radar size={18} strokeWidth={1.75} /> },
        { label: 'Species Analysis', href: `/dashboard/park/species?parkId=${parkId}`, icon: <BarChart3 size={18} strokeWidth={1.75} /> },
        { label: 'Trend Analysis', href: `/dashboard/park/trends?parkId=${parkId}`, icon: <TrendingUp size={18} strokeWidth={1.75} /> },
        { label: 'Static Sites', href: `/dashboard/park/static-sites?parkId=${parkId}`, icon: <Droplets size={18} strokeWidth={1.75} /> },
        { label: 'Generate Report', href: `/dashboard/park/reports?parkId=${parkId}`, icon: <FileText size={18} strokeWidth={1.75} /> },
    ] : [];

    const dataNav = [
        {
            label: 'New Survey',
            href: parkId ? `/dashboard/park/surveys/new?parkId=${parkId}` : '/dashboard/park/surveys/new?parkId=mana-pools-national-park',
            icon: <PlusCircle size={18} strokeWidth={1.75} />
        },
    ];

    return (
        <aside className="sidebar">
            <div className="relative px-4 pt-5 pb-4 overflow-hidden border-b border-[var(--wez-border)]">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'linear-gradient(135deg, var(--wez-mint) 0%, var(--wez-sunset-soft) 55%, #fff 100%)',
                    }}
                />
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-wez-green/10 blur-2xl pointer-events-none" />
                <div className="absolute -left-4 bottom-0 w-16 h-16 rounded-full bg-wez-sunset/15 blur-xl pointer-events-none" />

                <Link href="/" className="relative z-10 flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-md bg-white flex items-center justify-center overflow-hidden border-2 border-wez-green/25 shadow-card shrink-0 ring-2 ring-wez-sunset/20 group-hover:ring-wez-sunset/40 transition-all">
                        <img
                            src="/wez-logo.jpg"
                            alt="WEZ Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="font-display font-extrabold text-xl text-wez-green tracking-tight leading-none">
                            WEZ
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-wez-sunset" />
                            <span className="text-xs font-semibold text-wez-sunset tracking-wide">
                                Game Counts
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-5">
                <div className="mb-6">
                    <div className="sidebar-group-label">National</div>
                    {globalNav.map(item => (
                        <Link key={item.href} href={item.href} className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}>
                            <span className="shrink-0">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {parkId && (
                    <div className="mb-6">
                        <div className="sidebar-group-label truncate" title={currentPark?.name || 'Current Park'}>
                            {currentPark?.name || 'Current Park'}
                        </div>
                        {parkNav.map(item => {
                            const isItemActive = pathname === item.href.split('?')[0];
                            return (
                                <Link key={item.href} href={item.href} className={`sidebar-item ${isItemActive ? 'active' : ''}`}>
                                    <span className="shrink-0">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="mb-6">
                    <div className="sidebar-group-label">Parks</div>
                    {parks.filter(p => p.id !== currentPark?.id).map(p => {
                        const slug = p.name.toLowerCase().replace(/\s+/g, '-');
                        const href = `/dashboard/park?parkId=${slug}`;
                        const isExplorerActive = pathname === '/dashboard/park' && searchParams.get('parkId') === slug;
                        return (
                            <Link key={p.id} href={href} className={`sidebar-item ${isExplorerActive ? 'active' : ''}`}>
                                <MapPin size={18} strokeWidth={1.75} className="shrink-0 opacity-70" />
                                <span className="truncate" title={p.name}>{p.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="mb-6">
                    <div className="sidebar-group-label">Surveys</div>
                    {dataNav.map(item => {
                        const isItemActive = pathname === item.href.split('?')[0];
                        return (
                            <Link key={item.href} href={item.href} className={`sidebar-item ${isItemActive ? 'active' : ''}`}>
                                <span className="shrink-0">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="px-4 py-4 border-t border-[var(--wez-border)] bg-gradient-to-r from-wez-mint/80 to-wez-sunset-soft/60">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-wez-green-light" />
                    <span className="text-xs font-semibold text-wez-green">Connected</span>
                </div>
                <div className="text-xs text-wez-muted leading-snug">Wildlife & Environment Zimbabwe</div>
            </div>
        </aside>
    );
}
