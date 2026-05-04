'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
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
    const params = useParams();
    const parkId = params?.parkId as string;

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
        { label: 'WEZ Overview', href: '/', icon: <Globe size={18} /> },
        { label: 'All Parks', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    ];

    const parkNav = parkId ? [
        { label: 'Dashboard', href: `/dashboard/${parkId}`, icon: <Navigation size={18} /> },
        { label: 'Operational Intel', href: `/dashboard/${parkId}/intelligence`, icon: <Radar size={18} /> },
        { label: 'Species Analysis', href: `/dashboard/${parkId}/species`, icon: <BarChart3 size={18} /> },
        { label: 'Trend Analysis', href: `/dashboard/${parkId}/trends`, icon: <TrendingUp size={18} /> },
        { label: 'Static Sites', href: `/dashboard/${parkId}/static-sites`, icon: <Droplets size={18} /> },
        { label: 'Generate Report', href: `/dashboard/${parkId}/reports`, icon: <FileText size={18} /> },
    ] : [];

    const dataNav = [
        {
            label: 'New Survey',
            href: parkId ? `/dashboard/${parkId}/surveys/new` : '/dashboard/mana-pools-national-park/surveys/new',
            icon: <PlusCircle size={18} />
        },
    ];

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        background: '#fff',
                        padding: '4px',
                        borderRadius: '14px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        <img
                            src="/wez-logo.jpg"
                            alt="WEZ Logo"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: 20, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>WEZ</div>
                        <div style={{ fontSize: 9, color: 'var(--wez-green)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800, marginTop: 4 }}>Game Counts</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
                {/* Global */}
                <div style={{ marginBottom: 28 }}>
                    <div className="sidebar-group-label">Core Systems</div>
                    {globalNav.map(item => (
                        <Link key={item.href} href={item.href} className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}>
                            <span style={{ opacity: pathname === item.href ? 1 : 0.7 }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Current Park Context */}
                {parkId && (
                    <div style={{ marginBottom: 28 }}>
                        <div className="sidebar-group-label">{currentPark?.name || 'Current Node'}</div>
                        {parkNav.map(item => (
                            <Link key={item.href} href={item.href} className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}>
                                <span style={{ opacity: pathname === item.href ? 1 : 0.7 }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Park Explorer */}
                <div style={{ marginBottom: 28 }}>
                    <div className="sidebar-group-label">Ecological Nodes</div>
                    {parks.filter(p => p.id !== currentPark?.id).map(p => {
                        const slug = p.name.toLowerCase().replace(/\s+/g, '-');
                        const href = `/dashboard/${slug}`;
                        return (
                            <Link key={p.id} href={href} className={`sidebar-item ${pathname === href ? 'active' : ''}`}>
                                <MapPin size={18} style={{ opacity: 0.6, flexShrink: 0 }} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.name}>{p.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Data Management */}
                <div style={{ marginBottom: 28 }}>
                    <div className="sidebar-group-label">Intelligence</div>
                    {dataNav.map(item => (
                        <Link key={item.href} href={item.href} className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}>
                            <span style={{ opacity: pathname === item.href ? 1 : 0.7 }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Operational Unit</div>
                <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 11 }}>Wildlife & Environment Zimbabwe</div>
                <div style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>v1.2.1 • Digital Perimeter</div>
            </div>
        </aside>
    );
}
