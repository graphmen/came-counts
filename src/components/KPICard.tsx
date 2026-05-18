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

export default function KPICard({ title, value, icon: Icon, trend, color = '#22c55e' }: KPICardProps) {
    return (
        <div className="kpi-card glass-card relative overflow-hidden group p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg transition-all group-hover:scale-105" style={{ backgroundColor: `${color}10`, border: `1px solid ${color}20` }}>
                    <Icon size={14} style={{ color }} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${trend.isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}%
                    </div>
                )}
            </div>
            
            <div className="relative z-10">
                <div className="text-2xl font-mono font-black text-slate-900 tracking-tighter leading-none flex items-baseline gap-1 drop-shadow-sm">
                  {value}
                </div>
                <div className="mt-1.5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</div>
                </div>
            </div>
        </div>
    );
}
