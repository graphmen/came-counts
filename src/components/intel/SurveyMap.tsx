'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Map as MapIcon, Compass, Eye, EyeOff, Info } from 'lucide-react';

const SPECIES_EMOJI: Record<string, string> = {
  'Impala': '🦌', 'Elephant': '🐘', 'Buffalo': '🐃', 'Zebra': '🦓',
  'Waterbuck': '🦌', 'Baboon': '🐒', 'Eland': '🐂', 'Kudu': '🦌',
  'Giraffe': '🦒', 'Hippo': '🦛', 'Warthog': '🐗', 'Lion': '🦁',
  'Leopard': '🐆', 'Hyena': '🐺', 'Wild Dog': '🐕', 'Sable': '🐃',
  'Crocodile': '🐊', 'Bird': '🦅', 'Eagle': '🦅', 'Vulture': '🦅',
};

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
  }
};

function getEmoji(species: string): string {
  for (const [key, emoji] of Object.entries(SPECIES_EMOJI)) {
    if (species?.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return '🐾';
}

export default function SurveyMap({ observations }: { observations: any[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  const [styleType, setStyleType] = useState<'vector' | 'hybrid'>('vector');
  const [visibleLayers, setVisibleLayers] = useState({
    boundary: true,
    transects: true,
    campsites: true,
    observations: true
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
        paint: { 'fill-color': '#10b981', 'fill-opacity': 0.05 }
      });
      m.addLayer({
        id: 'boundary-outline', type: 'line', source: 'boundary',
        paint: { 'line-color': '#10b981', 'line-width': 2, 'line-dasharray': [2, 1] }
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
  };

  // Init map once
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: STYLES.vector as any,
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
    map.current.setStyle(styleType === 'vector' ? STYLES.vector : STYLES.hybrid as any);
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
      const scale = 0.8 + (countSize / 50) * 0.7;

      const el = document.createElement('div');
      el.style.cssText = `
        display: flex; flex-direction: column; align-items: center;
        cursor: pointer; transform: scale(${scale}); transform-origin: bottom center;
        transition: transform 0.2s ease;
      `;
      el.innerHTML = `
        <div style="
          width: 36px; height: 36px; border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${isTransect ? '#6366f1' : '#f59e0b'};
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
        </div>
        <div style="
          background: white; padding: 2px 6px; border-radius: 6px;
          font-size: 9px; font-weight: 900; color: #0f172a;
          margin-top: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          white-space: nowrap; letter-spacing: 0.05em; text-transform: uppercase;
          max-width: 80px; overflow: hidden; text-overflow: ellipsis;
          font-family: var(--font-display), sans-serif;
        ">${obs.species && obs.species !== 'undefined' ? obs.species : 'Unidentified'}</div>
      `;

      const popup = new maplibregl.Popup({ offset: 40, maxWidth: '220px' })
        .setHTML(`
          <div style="font-family: var(--font-sans), sans-serif; padding: 4px;">
            <div style="font-family: var(--font-display), sans-serif; font-size:9px;font-weight:900;text-transform:uppercase;color:#64748b;letter-spacing:0.08em;">${obs.type} Survey</div>
            <div style="font-family: var(--font-display), sans-serif; font-size:14px;font-weight:900;color:#0f172a;margin:4px 0;">${emoji} ${obs.species}</div>
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

      const marker = new maplibregl.Marker(el)
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
  }, [geoObservations, visibleLayers.observations]);

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
            onClick={() => setStyleType('vector')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all font-display ${styleType === 'vector' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Vector
          </button>
          <button 
            onClick={() => setStyleType('hybrid')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all font-display ${styleType === 'hybrid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
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
            { id: 'observations', label: 'Field Observations', color: 'bg-amber-500' }
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
        <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Compass size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest font-display">Geospatial Intelligence</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xl font-black text-white font-mono leading-none">{geoObservations.length}</div>
              <div className="text-[8px] text-slate-400 font-black uppercase tracking-wider font-display">Live Nodes</div>
            </div>
            <div>
              <div className="text-xl font-black text-emerald-400 font-display leading-none">{styleType === 'hybrid' ? 'Satellite' : 'Topo'}</div>
              <div className="text-[8px] text-slate-400 font-black uppercase tracking-wider font-display">Context</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
