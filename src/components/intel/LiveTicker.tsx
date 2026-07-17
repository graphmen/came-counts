'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Observation {
  id: string;
  species: string;
  count: number;
  location: string;
  time: string;
  observer: string;
}

export default function LiveTicker({ observations }: { observations: Observation[] }) {
  const tickerItems = [...observations].slice(0, 10);

  if (tickerItems.length === 0) return null;

  return (
    <div className="bg-white border border-[var(--wez-border)] rounded-md py-2.5 overflow-hidden relative shadow-card">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />

      <motion.div
        className="flex gap-10 whitespace-nowrap px-4"
        animate={{ x: [0, -1000] }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-wez-green-light" />
            <span className="text-xs text-wez-muted">
              <span className="font-medium text-wez-faint">{item.time}</span>
              {' · '}
              <span className="font-semibold text-wez-ink">{item.species}</span>
              {' '}({item.count}) at{' '}
              <span className="text-wez-green">{item.location}</span>
              {' · '}
              <span className="text-wez-faint">{item.observer}</span>
            </span>
            <div className="w-px h-3 bg-wez-stone-200" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
