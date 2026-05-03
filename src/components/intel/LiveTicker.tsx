'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Radar, Zap } from 'lucide-react';

interface Observation {
  id: string;
  species: string;
  count: number;
  location: string;
  time: string;
  observer: string;
}

export default function LiveTicker({ observations }: { observations: Observation[] }) {
  // Take last 10 observations for the ticker
  const tickerItems = [...observations].slice(0, 10);

  if (tickerItems.length === 0) return null;

  return (
    <div className="bg-slate-900 border-y border-white/5 py-2 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10" />
      
      <motion.div 
        className="flex gap-12 whitespace-nowrap px-4"
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              [{item.time}] <span className="text-white">{item.species}</span> ({item.count}) AT <span className="text-emerald-400">{item.location}</span> BY <span className="text-slate-500">{item.observer}</span>
            </span>
            <div className="w-px h-3 bg-white/10" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
