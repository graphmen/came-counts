'use client';

import React, { useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale,
    PointElement, LineElement,
    Tooltip, Legend, Filler,
    ScriptableContext, ChartOptions, ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface SpeciesDef { name: string; emoji: string; color: string; bgLight: string; }
interface Props { data: any[]; selectedSpecies: string[]; speciesList?: SpeciesDef[]; }

// hex → r,g,b string
function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

export default function PremiumTrendChart({ data, selectedSpecies, speciesList = [] }: Props) {
    const chartRef = useRef<any>(null);

    const colorMap: Record<string, string> = {};
    speciesList.forEach(s => { colorMap[s.name] = s.color; });

    const labels = data.map(d => d.year);

    const chartData: ChartData<'line'> = {
        labels,
        datasets: selectedSpecies.map(species => {
            const hexColor = colorMap[species] || '#1a7a4a';
            const rgb = hexToRgb(hexColor);
            return {
                label: species,
                data: data.map(d => d[species] ?? null),
                borderColor: hexColor,
                backgroundColor: (context: ScriptableContext<'line'>) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
                    gradient.addColorStop(0, `rgba(${rgb}, 0.18)`);
                    gradient.addColorStop(0.6, `rgba(${rgb}, 0.05)`);
                    gradient.addColorStop(1, `rgba(${rgb}, 0)`);
                    return gradient;
                },
                borderWidth: 3.5,
                fill: true,
                tension: 0.42,
                pointRadius: 0,
                pointHoverRadius: 7,
                pointBackgroundColor: hexColor,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: hexColor,
                pointHoverBorderWidth: 3,
                spanGaps: true,
            };
        })
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#f8fafc',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                padding: 16,
                boxPadding: 8,
                cornerRadius: 16,
                usePointStyle: true,
                titleFont: { family: 'Outfit, sans-serif', size: 14, weight: 800 },
                bodyFont: { family: 'Inter, sans-serif', size: 13, weight: 600 },
                callbacks: {
                    title: (items) => `Year ${items[0].label}`,
                    label: (ctx: any) =>
                        ctx.parsed.y != null
                            ? `  ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`
                            : `  ${ctx.dataset.label}: no data`,
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    font: { family: 'Inter, sans-serif', size: 11, weight: 700 },
                    color: '#94a3b8',
                    padding: 14,
                    // Show every 5 years so it doesn't crowd
                    callback: (_, i, ticks) => {
                        const year = Number(labels[i]);
                        return year % 5 === 0 ? year : '';
                    }
                }
            },
            y: {
                beginAtZero: false,
                border: { display: false },
                grid: { color: '#f1f5f9', lineWidth: 1 },
                ticks: {
                    font: { family: 'Inter, sans-serif', size: 11, weight: 700 },
                    color: '#94a3b8',
                    padding: 14,
                    callback: (v: any) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v,
                }
            }
        },
        interaction: { mode: 'index', intersect: false },
        animation: {
            duration: 1200,
            easing: 'easeOutQuart',
        }
    };

    return <Line ref={chartRef} data={chartData} options={options} />;
}
