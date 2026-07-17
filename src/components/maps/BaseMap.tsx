'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card } from '@/components/ui/card';

interface BaseMapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
}
export default function BaseMap({ center = [29.39, -15.77], zoom = 10 }: BaseMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [activeLayers, setActiveLayers] = React.useState<string[]>(['park-boundary-fill', 'park-boundary-outline', 'river-layer', 'roads-layer', 'campsites-layer']);
  const [mapStyle, setMapStyle] = React.useState<'satellite' | 'terrain' | 'offline'>('offline');

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'Esri, Maxar',
          },
          'osm-terrain': {
            type: 'raster',
            tiles: ['https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=7c352c8ff4764407914f69973a4c414a'],
            tileSize: 256,
            attribution: 'Thunderforest',
          },
          'mana-basemap-source': {
            type: 'image',
            url: '/data/mana_basemap.png',
            coordinates: [
              [29.228484, -15.698782], // top-left
              [29.399975, -15.701678], // top-right
              [29.397902, -15.819162], // bottom-right
              [29.22631,  -15.816243]  // bottom-left
            ]
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#0f172a' }
          },
          {
            id: 'satellite-base',
            type: 'raster',
            source: 'esri-satellite',
            layout: { visibility: mapStyle === 'satellite' ? 'visible' : 'none' }
          },
          {
            id: 'terrain-base',
            type: 'raster',
            source: 'osm-terrain',
            layout: { visibility: mapStyle === 'terrain' ? 'visible' : 'none' }
          },
          {
            id: 'mana-basemap-layer',
            type: 'raster',
            source: 'mana-basemap-source',
            layout: { visibility: mapStyle === 'offline' ? 'visible' : 'none' }
          }
        ],
      },
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // ── Layers Definition ─────────────────────────────────────
      
      // Park Boundary
      map.current.addSource('park-boundary', { type: 'geojson', data: '/data/mana_pools_boundary.json' });
      map.current.addLayer({
        id: 'park-boundary-fill',
        type: 'fill',
        source: 'park-boundary',
        paint: { 'fill-color': '#1f3a1c', 'fill-opacity': 0.05 }
      });
      map.current.addLayer({
        id: 'park-boundary-outline',
        type: 'line',
        source: 'park-boundary',
        paint: { 'line-color': '#1f3a1c', 'line-width': 2, 'line-dasharray': [2, 2] }
      });

      // River
      map.current.addSource('river', { type: 'geojson', data: '/data/river.json' });
      map.current.addLayer({
        id: 'river-layer',
        type: 'line',
        source: 'river',
        paint: { 'line-color': '#3b82f6', 'line-width': 2.5, 'line-opacity': 0.8 }
      });

      // Roads
      map.current.addSource('roads', { type: 'geojson', data: '/data/roads.json' });
      map.current.addLayer({
        id: 'roads-layer',
        type: 'line',
        source: 'roads',
        paint: { 'line-color': '#94a3b8', 'line-width': 1, 'line-opacity': 0.6 }
      });

      // Transects
      map.current.addSource('transects', { type: 'geojson', data: '/data/transect_lines.json' });
      map.current.addLayer({
        id: 'transects-layer',
        type: 'line',
        source: 'transects',
        paint: { 'line-color': '#f59e0b', 'line-width': 1.5, 'line-opacity': 0.9 }
      });

      // Campsites
      map.current.addSource('campsites', { type: 'geojson', data: '/data/campsites.json' });
      map.current.addLayer({
        id: 'campsites-layer',
        type: 'circle',
        source: 'campsites',
        paint: {
          'circle-radius': 5,
          'circle-color': '#ef4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom]);

  // Sync visibility
  useEffect(() => {
    if (!map.current) return;
    const layers = ['park-boundary-fill', 'park-boundary-outline', 'river-layer', 'roads-layer', 'transects-layer', 'campsites-layer'];
    layers.forEach(lyr => {
      if (map.current?.getLayer(lyr)) {
        map.current.setLayoutProperty(lyr, 'visibility', activeLayers.includes(lyr) ? 'visible' : 'none');
      }
    });
    
    // Switch base style
    if (map.current.getLayer('satellite-base')) {
        map.current.setLayoutProperty('satellite-base', 'visibility', mapStyle === 'satellite' ? 'visible' : 'none');
    }
    if (map.current.getLayer('terrain-base')) {
        map.current.setLayoutProperty('terrain-base', 'visibility', mapStyle === 'terrain' ? 'visible' : 'none');
    }
    if (map.current.getLayer('mana-basemap-layer')) {
        map.current.setLayoutProperty('mana-basemap-layer', 'visibility', mapStyle === 'offline' ? 'visible' : 'none');
    }
  }, [activeLayers, mapStyle]);

  const toggleLayer = (id: string) => {
    setActiveLayers(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  return (
    <Card className="relative w-full h-[450px] overflow-hidden border-slate-200 group">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* ── Legend & Controls ─────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-10 space-y-3">
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl w-48 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Geospatial Legend</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-2">
            {[
              { id: 'park-boundary-fill', label: 'Park Boundary', color: 'bg-emerald-500' },
              { id: 'river-layer', label: 'River Network', color: 'bg-blue-500' },
              { id: 'roads-layer', label: 'Main Roads', color: 'bg-slate-400' },
              { id: 'transects-layer', label: 'Survey Transects', color: 'bg-amber-500' },
              { id: 'campsites-layer', label: 'Campsites', color: 'bg-red-500', isDot: true },
            ].map(lyr => (
              <button 
                key={lyr.id}
                onClick={() => toggleLayer(lyr.id)}
                className={`flex items-center gap-2 w-full transition-opacity ${activeLayers.includes(lyr.id) ? 'opacity-100' : 'opacity-30'}`}
              >
                <div className={`${lyr.isDot ? 'w-2 h-2 rounded-full' : 'w-3 h-1 rounded-sm'} ${lyr.color}`} />
                <span className="text-[10px] font-bold text-slate-700">{lyr.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex gap-1 flex-col">
              <button 
                onClick={() => setMapStyle('offline')}
                className={`w-full py-1.5 rounded-md text-[8px] font-black uppercase tracking-tighter border transition-all ${mapStyle === 'offline' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
              >
                Offline PDF Map
              </button>
              <div className="flex gap-1 mt-1">
                <button 
                  onClick={() => setMapStyle('satellite')}
                  className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter border transition-all ${mapStyle === 'satellite' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                >
                  Satellite
                </button>
                <button 
                  onClick={() => setMapStyle('terrain')}
                  className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter border transition-all ${mapStyle === 'terrain' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                >
                  Terrain
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black text-slate-500 border border-slate-100 uppercase tracking-widest shadow-sm">
        GIS Hub · {mapStyle.toUpperCase()} Engine
      </div>
    </Card>
  );
}
