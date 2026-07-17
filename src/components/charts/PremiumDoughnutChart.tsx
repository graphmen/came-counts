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

const COLORS = ['#0f4c3a', '#1a6b52', '#b45309', '#0e7490', '#5c6b64'];

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
                    font: { family: 'Outfit, sans-serif', size: 12, weight: 500 },
                    color: '#5c6b64'
                }
            },
            tooltip: {
                backgroundColor: '#1a2420',
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: 'Outfit, sans-serif', size: 13, weight: 600 },
                bodyFont: { family: 'Outfit, sans-serif', size: 12, weight: 500 },
                callbacks: {
                    label: (item: any) => `  ${item.raw.toLocaleString()} individuals`,
                }
            }
        }
    };

    return <Doughnut data={chartData} options={options} />;
}
