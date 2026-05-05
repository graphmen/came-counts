'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Zap, Leaf, Camera, X, ChevronLeft, ChevronRight, Hash, Eye, Info } from 'lucide-react';

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

export default function DataLedger({ observations, onViewPhoto }: { observations: Observation[], onViewPhoto: (url: string) => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalPages = Math.ceil(observations.length / itemsPerPage);
  const paginatedData = observations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when data changes (e.g. after filtering)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [observations.length]);

  return (
    <div className="overflow-x-auto bg-transparent">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Collector / Node</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Species Intelligence</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Population Matrix</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gender Aggregation</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Spatial Intelligence</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Context</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-40 text-center">
                <div className="flex flex-col items-center gap-4">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <Hash size={32} className="text-slate-700" />
                   </div>
                   <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">No Intelligence Records Found in Active Buffer</p>
                </div>
              </td>
            </tr>
          ) : (
            paginatedData.map((obs) => (
              <tr key={obs.id} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50">
                <td className="px-6 py-6 align-top">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                        <User size={12} className="text-emerald-600" />
                      </div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{obs.observer}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-[0.1em] border ${obs.type === 'Transect' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {obs.type}
                      </span>
                      <span className="text-[8px] font-black px-2 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-md uppercase tracking-[0.1em]">
                        {obs.day_of_week?.substring(0, 3)} {obs.period_of_day}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">{obs.date}</span>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-6 align-top">
                  <div className="flex gap-4">
                    {/* Photo Evidence Thumbnail */}
                    {obs.photo_url ? (
                      <button
                        onClick={() => onViewPhoto(obs.photo_url!)}
                        className="relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden border border-emerald-500/30 hover:border-emerald-500 transition-all hover:scale-105 shadow-2xl group/photo"
                        title="View field photo"
                      >
                        <img 
                          src={obs.photo_url} 
                          alt={obs.species} 
                          className="w-full h-full object-cover grayscale-[0.3] group-hover/photo:grayscale-0" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                          }}
                        />
                        <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                           <Eye size={20} className="text-white" />
                        </div>
                      </button>
                    ) : (
                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1">
                        <Camera size={16} className="text-slate-400" />
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider">No Evidence</span>
                      </div>
                    )}
                    <div className="flex flex-col pt-1">
                      <span className="text-sm font-black text-slate-900 leading-none uppercase tracking-tighter">{obs.species}</span>
                      <span className="text-[9px] font-black text-emerald-600 uppercase mt-2 tracking-[0.2em]">{obs.class}</span>
                      <div className="flex gap-2 mt-3">
                         <span className="text-[8px] font-black px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-md uppercase tracking-widest">{obs.sex}</span>
                         <span className="text-[8px] font-black px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-md uppercase tracking-widest">{obs.age}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-6 align-top">
                   <div className="flex items-end gap-4">
                      <div className="text-3xl font-mono font-black text-slate-900 leading-none tracking-tighter">{obs.count}</div>
                      <div className="flex gap-3 mb-0.5">
                         <div className="flex flex-col items-center">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">ADL</span>
                            <span className="text-[11px] font-black text-slate-500 font-mono">{obs.matrix.adult}</span>
                         </div>
                         <div className="flex flex-col items-center border-l border-slate-100 pl-3">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">SUB</span>
                            <span className="text-[11px] font-black text-slate-500 font-mono">{obs.matrix.sub}</span>
                         </div>
                         <div className="flex flex-col items-center border-l border-slate-100 pl-3">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">JUV</span>
                            <span className="text-[11px] font-black text-slate-500 font-mono">{obs.matrix.juv}</span>
                         </div>
                      </div>
                   </div>
                </td>

                <td className="px-6 py-6 align-top">
                  <div className="space-y-3">
                    <div className="flex gap-0.5 h-1.5 w-28 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div style={{ width: `${(obs.male_count / (obs.count || 1)) * 100}%` }} className="bg-blue-500 h-full shadow-[0_0_8px_rgba(59,130,246,0.2)]" />
                      <div style={{ width: `${(obs.female_count / (obs.count || 1)) * 100}%` }} className="bg-rose-500 h-full shadow-[0_0_8px_rgba(244,63,94,0.2)]" />
                      <div style={{ width: `${(obs.unknown_count / (obs.count || 1)) * 100}%` }} className="bg-slate-300 h-full" />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{obs.male_count}M</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{obs.female_count}F</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{obs.unknown_count}U</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-6 align-top">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={12} className="text-emerald-500" />
                      <span className="text-[11px] font-black font-mono tracking-tight">{obs.lat}, {obs.lng}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                       <span>DST: <span className="text-slate-900">{obs.distance || '0'}M</span></span>
                       <span>BRG: <span className="text-slate-900">{obs.bearing || '0'}°</span></span>
                       <span>ACC: <span className="text-emerald-600">±{obs.accuracy || '5'}M</span></span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-6 align-top text-right">
                   <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 rounded-md border border-amber-100 group-hover:border-amber-200 transition-colors">
                         <Zap size={10} className="text-amber-600" />
                         <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">{obs.activity || 'Resting'}</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 rounded-md border border-emerald-100 group-hover:border-emerald-200 transition-colors">
                         <Leaf size={10} className="text-emerald-600" />
                         <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">{obs.habitat || 'Woodland'}</span>
                      </div>
                   </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── Pagination Controls ────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-6 bg-slate-50 border-t border-slate-200">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            Reception Stream: <span className="text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, observations.length)}</span> / <span className="text-emerald-600">{observations.length}</span> NODES
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all border ${
                        currentPage === page 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border-emerald-500' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 || 
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-slate-300 font-black">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
