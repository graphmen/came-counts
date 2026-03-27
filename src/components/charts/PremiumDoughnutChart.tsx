'use client';

import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
    data: { name: string; value: number }[];
}

const COLORS = ['#1a7a4a', '#3b82f6', '#d97706', '#a855f7', '#06b6d4'];

export default function PremiumDoughnutChart({ data }: Props) {
    const chartData = {
        labels: data.map(d => d.name),
        datasets: [
            {
                data: data.map(d => d.value),
                backgroundColor: COLORS,
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 12,
                cutout: '72%',
            }
        ]
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 24,
                    font: { family: 'Outfit, sans-serif', size: 12, weight: '700' },
                    color: '#64748b'
                }
            },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 14,
                cornerRadius: 16,
                titleFont: { family: 'Outfit, sans-serif', size: 13, weight: '800' },
                bodyFont: { family: 'Inter, sans-serif', size: 12, weight: '600' },
                callbacks: {
                    label: (item: any) => `  ${item.raw.toLocaleString()} individuals`,
                }
            }
        }
    };

    return <Doughnut data={chartData} options={options} />;
}
