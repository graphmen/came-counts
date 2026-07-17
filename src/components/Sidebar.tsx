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
            <div className="px-5 pt-6 pb-5 border-b border-[var(--wez-border)]">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-wez-stone flex items-center justify-center overflow-hidden border border-[var(--wez-border)] shrink-0">
                        <img
                            src="/wez-logo.jpg"
                            alt="WEZ Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="font-display font-bold text-lg text-wez-ink tracking-tight leading-none">WEZ</div>
                        <div className="text-xs text-wez-muted mt-1 font-medium">Game Counts</div>
                    </div>
                </div>
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

            <div className="px-5 py-4 border-t border-[var(--wez-border)] bg-wez-stone/50">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-wez-green-light" />
                    <span className="text-xs font-medium text-wez-green">Connected</span>
                </div>
                <div className="text-xs text-wez-muted leading-snug">Wildlife & Environment Zimbabwe</div>
            </div>
        </aside>
    );
}
