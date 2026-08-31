'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Map as MapIcon, Compass, Eye, EyeOff, Info } from 'lucide-react';

import { WILDLIFE_METADATA, DEFAULT_WILDLIFE } from '@/lib/constants';

const SPECIES_EMOJI: Record<string, string> = {
  'Impala': '🦌', 'Elephant': '🐘', 'Buffalo': '🐃', 'Zebra': '🦓',
  'Waterbuck': '🦌', 'Baboon': '🐒', 'Eland': '🐂', 'Kudu': '🦌',
  'Giraffe': '🦒', 'Hippo': '🦛', 'Hippopotamus': '🦛', 'Warthog': '🐗',
  'Lion': '🦁', 'Leopard': '🐆', 'Hyena': '🐺', 'Wild Dog': '🐕',
  'Sable': '🐃', 'Crocodile': '🐊', 'Bird': '🦅', 'Eagle': '🦅',
  'Vulture': '🦅', 'Goose': '🪿', 'Plover': '🐦', 'Stork': '🦩',
  'Monkey': '🐒', 'Duiker': '🦌', 'Bushbuck': '🦌', 'Nyala': '🦌',
};

function getEmoji(species: string): string {
  if (!species) return DEFAULT_WILDLIFE.emoji;
  const named = WILDLIFE_METADATA[species];
  if (named?.emoji) return named.emoji;
  const lower = species.toLowerCase();
  for (const [key, meta] of Object.entries(WILDLIFE_METADATA)) {
    if (lower.includes(key.toLowerCase())) return meta.emoji;
  }
  for (const [key, emoji] of Object.entries(SPECIES_EMOJI)) {
    if (lower.includes(key.toLowerCase())) return emoji;
  }
  return DEFAULT_WILDLIFE.emoji;
}

const STYLES = {
  vector: 'https://tiles.openfreemap.org/styles/bright',
  hybrid: {
    version: 8,
    sources: {
      'google-hybrid': {
        type: 'raster',
        tiles: ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'],
        tileSize: 256,
        attribution: '&copy; Google Maps'
      }
    },
    layers: [
      { id: 'google-hybrid', type: 'raster', source: 'google-hybrid', minzoom: 0, maxzoom: 22 }
    ]
  },
  offline: {
    version: 8,
    sources: {
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
        id: 'mana-basemap-layer',
        type: 'raster',
        source: 'mana-basemap-source'
      }
    ]
  }
};

export default function SurveyMap({ observations }: { observations: any[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  const [styleType, setStyleType] = useState<'vector' | 'hybrid' | 'offline'>('offline');
  const [visibleLayers, setVisibleLayers] = useState({
    boundary: true,
    transects: true,
    campsites: true,
    observations: true,
    heatmap: false
  });

  const geoObservations = useMemo(() =>
    observations.filter(obs => obs.lat && obs.lng &&
      !isNaN(parseFloat(obs.lat)) && !isNaN(parseFloat(obs.lng))),
    [observations]
  );

  const addGISLayers = (m: maplibregl.Map) => {
    // 1. Boundary
    if (!m.getSource('boundary')) {
      m.addSource('boundary', { type: 'geojson', data: '/data/mana_pools_boundary.json' });
      m.addLayer({
        id: 'boundary-fill', type: 'fill', source: 'boundary',
        paint: { 'fill-color': '#486830', 'fill-opacity': 0.05 }
      });
      m.addLayer({
        id: 'boundary-outline', type: 'line', source: 'boundary',
        paint: { 'line-color': '#486830', 'line-width': 2, 'line-dasharray': [2, 1] }
      });
    }

    // 2. Transects
    if (!m.getSource('transects')) {
      m.addSource('transects', { type: 'geojson', data: '/data/transect_lines.json' });
      m.addLayer({
        id: 'transects-line', type: 'line', source: 'transects',
        paint: { 'line-color': '#6366f1', 'line-width': 1, 'line-opacity': 0.4 }
      });
    }

    // 3. Campsites
    if (!m.getSource('campsites')) {
      m.addSource('campsites', { type: 'geojson', data: '/data/campsites.json' });
      m.addLayer({
        id: 'campsites-circle', type: 'circle', source: 'campsites',
        paint: { 'circle-radius': 4, 'circle-color': '#ef4444', 'circle-stroke-width': 2, 'circle-stroke-color': 'white' }
      });
    }

    // Set initial visibility
    m.setLayoutProperty('boundary-fill', 'visibility', visibleLayers.boundary ? 'visible' : 'none');
    m.setLayoutProperty('boundary-outline', 'visibility', visibleLayers.boundary ? 'visible' : 'none');
    m.setLayoutProperty('transects-line', 'visibility', visibleLayers.transects ? 'visible' : 'none');
    m.setLayoutProperty('campsites-circle', 'visibility', visibleLayers.campsites ? 'visible' : 'none');

    // 4. Heatmap (Observations)
    if (!m.getSource('observations-heat')) {
      m.addSource('observations-heat', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: geoObservations.map(o => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [parseFloat(o.lng), parseFloat(o.lat)] },
            properties: { weight: o.count || 1 }
          }))
        }
      });

      m.addLayer({
        id: 'observations-heatmap',
        type: 'heatmap',
        source: 'observations-heat',
        maxzoom: 15,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 10, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 14, 1, 15, 0]
        }
      });
    }

    m.setLayoutProperty('observations-heatmap', 'visibility', visibleLayers.heatmap ? 'visible' : 'none');
  };

  // Init map once
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: (styleType === 'offline' ? STYLES.offline : styleType === 'vector' ? STYLES.vector : STYLES.hybrid) as any,
      center: [29.36, -15.73],
      zoom: 10,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.current.on('style.load', () => {
      if (map.current) addGISLayers(map.current);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Handle style switch
  useEffect(() => {
    if (!map.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.current.setStyle(
      styleType === 'vector' ? STYLES.vector : 
      styleType === 'hybrid' ? STYLES.hybrid as any : 
      STYLES.offline as any
    );
  }, [styleType]);

  // Handle layer visibility
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    const m = map.current;
    
    try {
      if (m.getLayer('boundary-fill')) {
        m.setLayoutProperty('boundary-fill', 'visibility', visibleLayers.boundary ? 'visible' : 'none');
        m.setLayoutProperty('boundary-outline', 'visibility', visibleLayers.boundary ? 'visible' : 'none');
      }
      if (m.getLayer('transects-line')) {
        m.setLayoutProperty('transects-line', 'visibility', visibleLayers.transects ? 'visible' : 'none');
      }
      if (m.getLayer('campsites-circle')) {
        m.setLayoutProperty('campsites-circle', 'visibility', visibleLayers.campsites ? 'visible' : 'none');
      }
      if (m.getLayer('observations-heatmap')) {
        m.setLayoutProperty('observations-heatmap', 'visibility', visibleLayers.heatmap ? 'visible' : 'none');
      }
      
      // Handle markers separately
      markersRef.current.forEach(marker => {
        marker.getElement().style.display = visibleLayers.observations ? 'flex' : 'none';
      });
    } catch (e) {
      console.warn('Layer visibility update failed:', e);
    }
  }, [visibleLayers]);

  // Update markers when observations change
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (geoObservations.length === 0 || !visibleLayers.observations) return;

    geoObservations.forEach(obs => {
      const emoji = getEmoji(obs.species);
      const isTransect = obs.type === 'Transect';
      const countSize = Math.min(Math.max(obs.count || 1, 1), 50);
      const scale = 0.85 + (countSize / 50) * 0.25;

      const el = document.createElement('div');
      el.style.cssText = `
        display: flex; flex-direction: column; align-items: center;
        cursor: pointer; transform: scale(${scale}); transform-origin: bottom center;
        transition: transform 0.2s ease;
      `;
      const pinColor = isTransect ? '#486830' : '#c46a14';
      el.innerHTML = `
        <div style="
          width: 22px; height: 22px; border-radius: 50%;
          background: #fff;
          border: 2px solid ${pinColor};
          box-shadow: 0 2px 5px rgba(15,23,42,0.28);
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="font-size: 12px; line-height: 1;">${emoji}</span>
        </div>
        <div style="
          width: 0; height: 0; margin-top: -1px;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid ${pinColor};
        "></div>
      `;

      const popup = new maplibregl.Popup({ offset: 18, maxWidth: '220px' })
        .setHTML(`
          <div style="font-family: var(--font-sans), sans-serif; padding: 4px;">
            <div style="font-family: var(--font-display), sans-serif; font-size:9px;font-weight:900;text-transform:uppercase;color:#64748b;letter-spacing:0.08em;">${obs.type} Survey</div>
            <div style="font-family: var(--font-display), sans-serif; font-size:14px;font-weight:900;color:#0f172a;margin:4px 0;">${emoji} ${obs.species}</div>
            
            ${obs.photo_url ? `
              <div style="width:100%; height:100px; border-radius:8px; overflow:hidden; margin:8px 0; border:1px solid #e2e8f0;">
                <img src="${obs.photo_url}" style="width:100%; height:100%; object-cover: cover;" />
              </div>
            ` : ''}

            <div style="font-family: var(--font-display), sans-serif; font-size:10px;color:#059669;font-weight:700;text-transform:uppercase;">${obs.class}</div>
            <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;">
              <div style="text-align:center;background:#f0fdf4;padding:6px;border-radius:8px;">
                <div style="font-family: var(--font-mono), monospace; font-size:16px;font-weight:900;color:#0f172a;">${obs.matrix?.adult || 0}</div>
                <div style="font-family: var(--font-display), sans-serif; font-size:8px;color:#64748b;font-weight:800;text-transform:uppercase;">Adult</div>
              </div>
              <div style="text-align:center;background:#fef9ec;padding:6px;border-radius:8px;">
                <div style="font-family: var(--font-mono), monospace; font-size:16px;font-weight:900;color:#0f172a;">${obs.matrix?.sub || 0}</div>
                <div style="font-family: var(--font-display), sans-serif; font-size:8px;color:#64748b;font-weight:800;text-transform:uppercase;">Sub</div>
              </div>
              <div style="text-align:center;background:#f0f9ff;padding:6px;border-radius:8px;">
                <div style="font-family: var(--font-mono), monospace; font-size:16px;font-weight:900;color:#0f172a;">${obs.matrix?.juv || 0}</div>
                <div style="font-family: var(--font-display), sans-serif; font-size:8px;color:#64748b;font-weight:800;text-transform:uppercase;">Juv</div>
              </div>
            </div>
            <div style="font-family: var(--font-mono), monospace; margin-top:10px;font-size:9px;color:#94a3b8;font-weight:700;">
              👤 ${obs.observer} · ${obs.date}
            </div>
          </div>
        `);

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([parseFloat(obs.lng), parseFloat(obs.lat)])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    if (geoObservations.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      geoObservations.forEach(obs => bounds.extend([parseFloat(obs.lng), parseFloat(obs.lat)]));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 13 });
    }
  }, [geoObservations, visibleLayers.observations, styleType]);

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="relative h-[600px] w-full group">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Style Toggle */}
      <div className="absolute top-4 right-14 z-10">
        <div className="bg-white p-1 rounded-xl shadow-xl border border-slate-200 flex gap-1">
          <button 
            onClick={() => setStyleType('offline')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all font-display ${styleType === 'offline' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Offline PDF Map
          </button>
          <button 
            onClick={() => setStyleType('vector')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all font-display ${styleType === 'vector' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Vector
          </button>
          <button 
            onClick={() => setStyleType('hybrid')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all font-display ${styleType === 'hybrid' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Hybrid
          </button>
        </div>
      </div>

      {/* Layer Control Legend */}
      <div className="absolute bottom-6 right-6 z-10 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 transition-all duration-300 transform translate-y-0 group-hover:translate-y-[-4px]">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={14} className="text-slate-900" />
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest font-display">Map Layers</span>
        </div>
        
        <div className="space-y-3">
          {[
            { id: 'boundary', label: 'Park Boundary', color: 'bg-emerald-500' },
            { id: 'transects', label: 'Transect Lines', color: 'bg-indigo-500' },
            { id: 'campsites', label: 'Campsite Points', color: 'bg-red-500' },
            { id: 'observations', label: 'Field Markers', color: 'bg-amber-500' },
            { id: 'heatmap', label: 'Density Heatmap', color: 'bg-rose-600' }
          ].map((layer) => (
            <button
              key={layer.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => toggleLayer(layer.id as any)}
              className="flex items-center justify-between w-full group/item"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${layer.color}`} />
                <span className={`text-[9px] font-bold uppercase tracking-tight transition-colors font-display ${visibleLayers[layer.id as keyof typeof visibleLayers] ? 'text-slate-900' : 'text-slate-400'}`}>
                  {layer.label}
                </span>
              </div>
              {visibleLayers[layer.id as keyof typeof visibleLayers] ? (
                <Eye size={12} className="text-emerald-600" />
              ) : (
                <EyeOff size={12} className="text-slate-300" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
           <div className="flex items-center gap-1.5">
             <Info size={10} className="text-slate-400" />
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter font-display">Scale = Animal Density</span>
           </div>
        </div>
      </div>

      {/* Top-left Info Panel */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Compass size={14} className="text-emerald-600 animate-pulse" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest font-display">Geospatial Intel</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xl font-black text-slate-900 font-mono leading-none">{geoObservations.length}</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-wider font-display">Live Nodes</div>
            </div>
            <div>
              <div className="text-xl font-black text-emerald-600 font-display leading-none">{styleType === 'offline' ? 'Offline' : styleType === 'hybrid' ? 'Satellite' : 'Topo'}</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-wider font-display">Context</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
