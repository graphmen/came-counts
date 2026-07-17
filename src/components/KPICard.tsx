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

export default function KPICard({ title, value, icon: Icon, trend, color = '#0f4c3a' }: KPICardProps) {
    return (
        <div className="kpi-card group p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
                <div
                    className="p-2 rounded-sm shrink-0"
                    style={{ backgroundColor: `${color}14` }}
                >
                    <Icon size={18} strokeWidth={1.75} style={{ color }} />
                </div>
                {trend && (
                    <div className={`text-xs font-semibold tabular-nums ${trend.isPositive ? 'text-wez-green-mid' : 'text-rose-600'}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}%
                    </div>
                )}
            </div>

            <div className="mt-3">
                <div className="kpi-value">{value}</div>
                <div className="label-muted mt-1.5">{title}</div>
            </div>
        </div>
    );
}
