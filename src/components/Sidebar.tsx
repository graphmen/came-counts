'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { gc } from '@/lib/supabase';
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
    MapPin
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const params = useParams();
    const parkId = params?.parkId as string;
    
    const [parks, setParks] = useState<Park[]>([]);
    const [currentPark, setCurrentPark] = useState<Park | null>(null);

    useEffect(() => {
        async function fetchParks() {
            const { data } = await gc.from('parks').select('*').order('name');
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
        { label: 'Species Analysis', href: `/dashboard/${parkId}/species`, icon: <BarChart3 size={18} /> },
        { label: 'Trend Analysis', href: `/dashboard/${parkId}/trends`, icon: <TrendingUp size={18} /> },
        { label: 'Static Sites', href: `/dashboard/${parkId}/static-sites`, icon: <Droplets size={18} /> },
        { label: 'Generate Report', href: `/dashboard/${parkId}/reports`, icon: <FileText size={18} /> },
    ] : [];

    const dataNav = [
        { 
            label: 'New Survey', 
            href: parkId ? `/dashboard/${parkId}/surveys/new` : '/dashboard/mana-pools/surveys/new', 
            icon: <PlusCircle size={18} /> 
        },
    ];

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--wez-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 32, background: 'var(--wez-green-soft)', padding: 8, borderRadius: 12 }}>🦁</div>
                    <div>
                        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--wez-green)', lineHeight: 1.1 }}>WEZ</div>
                        <div style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Elite Analytics</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
                {/* Global */}
                <div style={{ marginBottom: 20 }}>
                    <div className="sidebar-group-label">General</div>
                    {globalNav.map(item => (
                        <Link key={item.href} href={item.href} className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}>
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Current Park Context */}
                {parkId && (
                    <div style={{ marginBottom: 20 }}>
                        <div className="sidebar-group-label">{currentPark?.name || 'Current Park'}</div>
                        {parkNav.map(item => (
                            <Link key={item.href} href={item.href} className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}>
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Park Explorer */}
                <div style={{ marginBottom: 20 }}>
                    <div className="sidebar-group-label">Conservation Areas</div>
                    {parks.filter(p => p.id !== currentPark?.id).map(p => {
                        const slug = p.name.toLowerCase().replace(/\s+/g, '-');
                        const href = `/dashboard/${slug}`;
                        return (
                            <Link key={p.id} href={href} className={`sidebar-item ${pathname === href ? 'active' : ''}`}>
                                <MapPin size={18} />
                                <span>{p.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Data Management */}
                <div style={{ marginBottom: 20 }}>
                    <div className="sidebar-group-label">Systems</div>
                    {dataNav.map(item => (
                        <Link key={item.href} href={item.href} className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}>
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--wez-border)', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                <div style={{ color: '#64748b', fontWeight: 700, marginBottom: 4 }}>Wildlife & Environment Zimbabwe</div>
                <div>© 2025 WEZ • Digital System</div>
            </div>
        </aside>
    );
}
