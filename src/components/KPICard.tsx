import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: string;
}

export default function KPICard({ title, value, icon: Icon, description, trend, color = '#22c55e' }: KPICardProps) {
    return (
        <div className="kpi-card glass-card">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                    <Icon size={24} style={{ color }} />
                </div>
                {trend && (
                    <div className={`text-xs font-bold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}%
                    </div>
                )}
            </div>
            <div>
                <div className="text-3xl font-extrabold font-outfit text-slate-900">{value}</div>
                <div className="text-sm font-semibold mt-1 text-slate-500 uppercase tracking-wide">{title}</div>
                {description && (
                    <div className="text-xs mt-2 text-slate-400 font-medium">{description}</div>
                )}
            </div>
        </div>
    );
}
