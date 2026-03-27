'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar } from 'lucide-react';

interface YearSelectorProps {
    parkId: string;
    selectedYear: number;
    onYearChange: (year: number) => void;
}

export default function YearSelector({ parkId, selectedYear, onYearChange }: YearSelectorProps) {
    const [years, setYears] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchYears() {
            const { data, error } = await supabase
                .from('surveys')
                .select('year')
                .eq('park_id', parkId)
                .order('year', { ascending: false });

            if (data) {
                const uniqueYears = Array.from(new Set(data.map(d => d.year)));
                setYears(uniqueYears);
            }
            setIsLoading(false);
        }

        if (parkId) fetchYears();
    }, [parkId]);

    if (isLoading) return <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-lg"></div>;

    return (
        <div className="relative inline-block text-left">
            <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Survey Year:
                </label>
                <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(Number(e.target.value))}
                    className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-wez-green focus:border-wez-green block w-full p-2.5 font-semibold transition-all hover:bg-slate-50 shadow-sm"
                >
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
