'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Zap, Leaf, Camera, X } from 'lucide-react';

interface Observation {
  id: string;
  type: string;
  species: string;
  class: string;
  count: number;
  location: string;
  meta: string;
  time: string;
  sex: string;
  age: string;
  date: string;
  observer: string;
  distance: string;
  bearing: string;
  lat: string;
  lng: string;
  accuracy?: string;
  day_of_week: string;
  period_of_day: string;
  male_count: number;
  female_count: number;
  unknown_count: number;
  habitat: string;
  activity: string;
  photo_url?: string;
  matrix: {
    adult: number;
    sub: number;
    juv: number;
  };
}

export default function DataLedger({ observations }: { observations: Observation[] }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      {/* Photo Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <X size={16} className="text-slate-700" />
            </button>
            <img src={lightboxUrl} alt="Field Evidence" className="w-full rounded-2xl shadow-2xl" />
            <p className="text-center text-white/50 text-[9px] font-black uppercase tracking-widest mt-3">Field Evidence — WEZ Mobile Node</p>
          </div>
        </div>
      )}
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-display">Collector / Node</th>
            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-display">Species Intelligence</th>
            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-display">Population Matrix</th>
            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-display">Gender Aggregation</th>
            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-display">Spatial Intelligence</th>
            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-display text-right">Context</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {observations.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-20 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No Intelligence Records Found in Active Buffer</p>
              </td>
            </tr>
          ) : (
            observations.map((obs) => (
              <tr key={obs.id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50">
                <td className="px-4 py-4 align-top">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center">
                        <User size={10} className="text-slate-400" />
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight font-display">{obs.observer}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter ${obs.type === 'Transect' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                        {obs.type}
                      </span>
                      <span className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm uppercase tracking-tighter">
                        {obs.day_of_week?.substring(0, 3)} {obs.period_of_day}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase font-mono">{obs.date}</span>
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-4 align-top">
                  <div className="flex gap-3">
                    {/* Photo Evidence Thumbnail */}
                    {obs.photo_url ? (
                      <button
                        onClick={() => setLightboxUrl(obs.photo_url!)}
                        className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-200 hover:border-emerald-500 transition-all hover:scale-105 shadow-sm"
                        title="View field photo"
                      >
                        <img src={obs.photo_url} alt={obs.species} className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <div className="shrink-0 w-14 h-14 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1">
                        <Camera size={14} className="text-slate-300" />
                        <span className="text-[6px] font-black text-slate-300 uppercase tracking-wider">No Photo</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900 leading-none font-display">{obs.species}</span>
                      <span className="text-[8px] font-black text-emerald-600 uppercase mt-1 tracking-widest font-display">{obs.class}</span>
                      <div className="flex gap-1 mt-2">
                         <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-sm uppercase">{obs.sex}</span>
                         <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-sm uppercase">{obs.age}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                   <div className="flex items-end gap-3">
                      <div className="text-xl font-black text-slate-900 leading-none font-mono">{obs.count}</div>
                      <div className="flex gap-2">
                         <div className="flex flex-col items-center">
                            <span className="text-[7px] font-black text-slate-400 uppercase">ADL</span>
                            <span className="text-[10px] font-bold text-slate-600">{obs.matrix.adult}</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="text-[7px] font-black text-slate-400 uppercase">SUB</span>
                            <span className="text-[10px] font-bold text-slate-600">{obs.matrix.sub}</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="text-[7px] font-black text-slate-400 uppercase">JUV</span>
                            <span className="text-[10px] font-bold text-slate-600">{obs.matrix.juv}</span>
                         </div>
                      </div>
                   </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <div className="space-y-2">
                    <div className="flex gap-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${(obs.male_count / (obs.count || 1)) * 100}%` }} className="bg-blue-500 h-full" />
                      <div style={{ width: `${(obs.female_count / (obs.count || 1)) * 100}%` }} className="bg-pink-500 h-full" />
                      <div style={{ width: `${(obs.unknown_count / (obs.count || 1)) * 100}%` }} className="bg-slate-400 h-full" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[8px] font-black text-slate-500 uppercase">{obs.male_count}M</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                        <span className="text-[8px] font-black text-slate-500 uppercase">{obs.female_count}F</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span className="text-[8px] font-black text-slate-500 uppercase">{obs.unknown_count}U</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin size={10} />
                      <span className="text-[10px] font-bold font-mono tracking-tight">{obs.lat}, {obs.lng}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                       <span>DST: <span className="text-slate-900">{obs.distance || '0'}M</span></span>
                       <span>BRG: <span className="text-slate-900">{obs.bearing || '0'}°</span></span>
                       <span>ACC: <span className="text-emerald-600">±{obs.accuracy || '5'}M</span></span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 align-top text-right">
                   <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                         <Zap size={10} className="text-amber-500" />
                         <span className="text-[8px] font-black text-slate-700 uppercase tracking-tighter">{obs.activity || 'Resting'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Leaf size={10} className="text-emerald-500" />
                         <span className="text-[8px] font-black text-slate-700 uppercase tracking-tighter">{obs.habitat || 'Woodland'}</span>
                      </div>
                   </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
