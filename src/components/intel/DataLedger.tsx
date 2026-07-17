'use client';

import React, { useState } from 'react';
import { User, MapPin, Zap, Leaf, Camera, ChevronLeft, ChevronRight, Hash, Eye } from 'lucide-react';

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
          <tr className="bg-wez-stone/60 border-b border-[var(--wez-border)]">
            <th className="px-6 py-4 label-muted text-xs font-semibold">Observer</th>
            <th className="px-6 py-4 label-muted text-xs font-semibold">Species</th>
            <th className="px-6 py-4 label-muted text-xs font-semibold">Age matrix</th>
            <th className="px-6 py-4 label-muted text-xs font-semibold">Gender</th>
            <th className="px-6 py-4 label-muted text-xs font-semibold">Location</th>
            <th className="px-6 py-4 label-muted text-xs font-semibold text-right">Context</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--wez-border)]">
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-24 text-center">
                <div className="flex flex-col items-center gap-3">
                   <div className="w-12 h-12 bg-wez-mint rounded-md flex items-center justify-center border border-[var(--wez-border)]">
                      <Hash size={22} className="text-wez-green" />
                   </div>
                   <p className="label-muted">No records in the current view</p>
                </div>
              </td>
            </tr>
          ) : (
            paginatedData.map((obs) => (
              <tr key={obs.id} className="hover:bg-wez-mint/40 transition-colors group border-b border-[var(--wez-border)]">
                <td className="px-6 py-5 align-top">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-wez-mint rounded-md flex items-center justify-center border border-[var(--wez-border)]">
                        <User size={12} className="text-wez-green" />
                      </div>
                      <span className="text-sm font-semibold text-wez-ink">{obs.observer}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${obs.type === 'Transect' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {obs.type}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-wez-stone text-wez-muted border border-[var(--wez-border)] rounded-md">
                        {obs.day_of_week?.substring(0, 3)} {obs.period_of_day}
                      </span>
                      <span className="text-xs text-wez-faint ml-0.5">{obs.date}</span>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-5 align-top">
                  <div className="flex gap-3.5">
                    {/* Photo Evidence Thumbnail */}
                    {obs.photo_url ? (
                      <button
                        onClick={() => onViewPhoto(obs.photo_url!)}
                        className="relative shrink-0 w-14 h-14 rounded-md overflow-hidden border border-[var(--wez-border)] hover:border-wez-green/40 transition-all group/photo"
                        title="View field photo"
                      >
                        <img 
                          src={obs.photo_url} 
                          alt={obs.species} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                          }}
                        />
                        <div className="absolute inset-0 bg-wez-green/25 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                           <Eye size={18} className="text-white" />
                        </div>
                      </button>
                    ) : (
                    <div className="shrink-0 w-14 h-14 rounded-md bg-wez-stone border border-dashed border-[var(--wez-border)] flex flex-col items-center justify-center gap-1">
                        <Camera size={14} className="text-wez-faint" />
                        <span className="text-[10px] text-wez-faint">No photo</span>
                      </div>
                    )}
                    <div className="flex flex-col pt-0.5">
                      <span className="text-sm font-semibold text-wez-ink leading-snug">{obs.species}</span>
                      <span className="text-xs font-medium text-wez-green mt-1">{obs.class}</span>
                      <div className="flex gap-1.5 mt-2">
                         <span className="text-xs font-medium px-2 py-0.5 bg-wez-stone text-wez-muted border border-[var(--wez-border)] rounded-md">{obs.sex}</span>
                         <span className="text-xs font-medium px-2 py-0.5 bg-wez-stone text-wez-muted border border-[var(--wez-border)] rounded-md">{obs.age}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5 align-top">
                   <div className="flex items-end gap-4">
                      <div className="text-2xl font-semibold tabular-nums text-wez-ink leading-none">{obs.count}</div>
                      <div className="flex gap-3 mb-0.5">
                         <div className="flex flex-col items-center">
                            <span className="label-muted mb-1">Adult</span>
                            <span className="text-xs font-semibold text-wez-muted tabular-nums">{obs.matrix.adult}</span>
                         </div>
                         <div className="flex flex-col items-center border-l border-[var(--wez-border)] pl-3">
                            <span className="label-muted mb-1">Sub</span>
                            <span className="text-xs font-semibold text-wez-muted tabular-nums">{obs.matrix.sub}</span>
                         </div>
                         <div className="flex flex-col items-center border-l border-[var(--wez-border)] pl-3">
                            <span className="label-muted mb-1">Juv</span>
                            <span className="text-xs font-semibold text-wez-muted tabular-nums">{obs.matrix.juv}</span>
                         </div>
                      </div>
                   </div>
                </td>

                <td className="px-6 py-5 align-top">
                  <div className="space-y-2.5">
                    <div className="flex gap-0.5 h-1.5 w-28 bg-wez-stone-100 rounded-full overflow-hidden border border-[var(--wez-border)]">
                      <div style={{ width: `${(obs.male_count / (obs.count || 1)) * 100}%` }} className="bg-sky-600 h-full" />
                      <div style={{ width: `${(obs.female_count / (obs.count || 1)) * 100}%` }} className="bg-rose-400 h-full" />
                      <div style={{ width: `${(obs.unknown_count / (obs.count || 1)) * 100}%` }} className="bg-wez-stone-200 h-full" />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                        <span className="text-xs font-medium text-wez-muted tabular-nums">{obs.male_count}M</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span className="text-xs font-medium text-wez-muted tabular-nums">{obs.female_count}F</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-wez-stone-200" />
                        <span className="text-xs font-medium text-wez-muted tabular-nums">{obs.unknown_count}U</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5 align-top">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-wez-muted">
                      <MapPin size={12} className="text-wez-green" />
                      <span className="text-xs font-medium tabular-nums">{obs.lat}, {obs.lng}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-wez-faint">
                       <span>Dist <span className="text-wez-ink font-medium">{obs.distance || '0'} m</span></span>
                       <span>Brg <span className="text-wez-ink font-medium">{obs.bearing || '0'}°</span></span>
                       <span>Acc <span className="text-wez-green font-medium">±{obs.accuracy || '5'} m</span></span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5 align-top text-right">
                   <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50/80 rounded-md border border-amber-100/80">
                         <Zap size={10} className="text-amber-600" />
                         <span className="text-xs font-medium text-amber-800">{obs.activity || 'Resting'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-wez-mint rounded-md border border-[var(--wez-border)]">
                         <Leaf size={10} className="text-wez-green" />
                         <span className="text-xs font-medium text-wez-green">{obs.habitat || 'Woodland'}</span>
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
        <div className="flex items-center justify-between px-6 py-4 bg-wez-stone/50 border-t border-[var(--wez-border)]">
          <div className="label-muted">
            Showing <span className="font-semibold text-wez-ink">{((currentPage - 1) * itemsPerPage) + 1}</span> – <span className="font-semibold text-wez-ink">{Math.min(currentPage * itemsPerPage, observations.length)}</span> of <span className="font-semibold text-wez-green">{observations.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-[var(--wez-border)] bg-white text-wez-faint disabled:opacity-30 disabled:cursor-not-allowed hover:bg-wez-mint hover:text-wez-green transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5">
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
                      className={`w-9 h-9 rounded-md text-xs font-semibold transition-colors border ${
                        currentPage === page 
                          ? 'bg-wez-green text-white border-wez-green' 
                          : 'bg-white border-[var(--wez-border)] text-wez-muted hover:border-wez-green/40 hover:text-wez-green hover:bg-wez-mint'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 || 
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-wez-faint px-1">…</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-[var(--wez-border)] bg-white text-wez-faint disabled:opacity-30 disabled:cursor-not-allowed hover:bg-wez-mint hover:text-wez-green transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
