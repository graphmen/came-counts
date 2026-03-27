'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Park } from '@/types';
import { MapPin, ChevronRight, PlusCircle } from 'lucide-react';

export default function DataEntryPortal() {
    const [parks, setParks] = useState<Park[]>([]);
    const router = useRouter();

    useEffect(() => {
        supabase.from('parks').select('*').then(({ data }) => setParks(data || []));
    }, []);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-emerald-50 rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-500/5">
                        <PlusCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-slate-900 font-outfit mb-3">Survey Portal</h1>
                <p className="text-slate-500 font-bold max-w-md mx-auto">Select a conservation area to begin digitizing field records with the Elite Survey system.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {parks.map((park, index) => {
                    const slug = park.name.toLowerCase().replace(/\s+/g, '-');
                    return (
                        <motion.button
                            key={park.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => router.push(`/dashboard/${slug}/surveys/new`)}
                            className="glass-card p-8 flex flex-col items-center text-center group relative overflow-hidden active:scale-95 transition-all"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                            
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                {park.id.includes('mana') ? '🏕️' : park.id.includes('hwange') ? '🐘' : '🦁'}
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-900 font-outfit mb-2">{park.name}</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6 flex items-center gap-1.5">
                                <MapPin size={10} className="text-emerald-500" />
                                Interactive Metadata Hub
                            </p>

                            <div className="w-full h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 group-hover:bg-emerald-700 transition-colors font-black text-xs uppercase tracking-widest px-4">
                                Launch Elite Form <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
