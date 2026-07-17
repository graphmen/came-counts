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
            if (!parkId) return;
            
            try {
                let resolvedParkId = parkId;
                
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parkId);
                
                if (!isUUID) {
                    const { data: parkData } = await supabase
                        .from('parks')
                        .select('id')
                        .filter('name', 'ilike', `%${parkId.replace(/-/g, ' ')}%`)
                        .single();
                    
                    if (parkData) {
                        resolvedParkId = parkData.id;
                    } else {
                        return;
                    }
                }

                const { data } = await supabase
                    .from('surveys')
                    .select('year')
                    .eq('park_id', resolvedParkId)
                    .order('year', { ascending: false });

                if (data) {
                    setYears(data.map(d => d.year));
                }
            } catch (err) {
                console.error('Error fetching years:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchYears();
    }, [parkId]);

    if (isLoading) return <div className="h-9 w-36 bg-wez-stone-100 animate-pulse rounded-sm" />;

    return (
        <div className="flex items-center gap-2.5">
            <label className="label-muted flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
                Survey year
            </label>
            <select
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="bg-white border border-[var(--wez-border)] text-wez-ink text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--wez-green-glow)] focus:border-wez-green-mid px-3 py-2 font-semibold min-w-[5.5rem] shadow-card"
            >
                {years.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
        </div>
    );
}
