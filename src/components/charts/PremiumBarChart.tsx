'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getWildlifeMetadata } from '@/lib/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
    data: { species: string; total_count: number }[];
}

export default function PremiumBarChart({ data }: Props) {
    const labels = data.map(d => d.species);
    const values = data.map(d => d.total_count);

    const chartData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 400, 0);
                    gradient.addColorStop(0, '#0f4c3a');
                    gradient.addColorStop(1, '#1a6b52');
                    return gradient;
                },
                borderRadius: 6,
                barThickness: 28,
            }
        ]
    };

    const options: any = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1a2420',
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: 'Outfit, sans-serif', size: 13, weight: 600 },
                bodyFont: { family: 'Outfit, sans-serif', size: 12, weight: 500 },
                callbacks: {
                    label: (item: any) => `  ${item.raw.toLocaleString()} individuals`,
                    title: (items: any) => {
                        const name = items[0].label;
                        const meta = getWildlifeMetadata(name);
                        return `${meta.emoji} ${name}`;
                    }
                }
            }
        },
        scales: {
            x: {
                display: false,
                grid: { display: false }
            },
            y: {
                grid: { display: false },
                ticks: {
                    font: { family: 'Outfit, sans-serif', size: 12, weight: 800 },
                    color: '#475569',
                    padding: 10
                }
            }
        }
    };

    return <Bar data={chartData} options={options} />;
}
