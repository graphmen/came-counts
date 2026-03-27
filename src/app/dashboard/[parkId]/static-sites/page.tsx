'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gc } from '@/lib/supabase';
import { StaticSite } from '@/types';
import { 
  Droplets, 
  MapPin, 
  Activity, 
  Leaf,
  ChevronRight,
  Info,
  Clock,
  Database
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import PremiumBarChart from '@/components/charts/PremiumBarChart';
import PremiumDoughnutChart from '@/components/charts/PremiumDoughnutChart';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } }
};

export default function StaticSitesPage({ params }: { params: { parkId: string } }) {
  const { parkId: routeParkId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sites, setSites] = useState<StaticSite[]>([]);
  const [parkId, setParkId] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedYear = Number(searchParams.get('year')) || 2025;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routeParkId);
        const { data: parkData } = await gc
          .from('parks')
          .select('id')
          .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? routeParkId : `%${routeParkId.replace(/-/g, ' ')}%`)
          .single();
        
        if (parkData) {
          setParkId(parkData.id);
          const { data: sList } = await gc
            .from('static_sites')
            .select('*')
            .eq('park_id', parkData.id); // Filtering by park_id
          
          setSites(sList || []);
          if (sList && sList.length > 0 && !selectedSite) {
            setSelectedSite(sList[0].name);
          }
        }
      } catch (error) { console.error('Error fetching sites:', error); }
      setLoading(false);
    }
    fetchData();
  }, [routeParkId]);

  useEffect(() => {
    if (selectedSite) {
      async function fetchSiteDetails() {
        const { data } = await gc
          .from('v_static_site_species')
          .select('*')
          .eq('site_name', selectedSite)
          .eq('year', selectedYear)
          .order('total_count', { ascending: false });
        setSiteData(data || []);
      }
      fetchSiteDetails();
    }
  }, [selectedSite, selectedYear]);

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', year.toString());
    router.push(`/dashboard/${routeParkId}/static-sites?${params.toString()}`);
  };

  const chartData = useMemo(() => siteData.slice(0, 8).map(s => ({
    species: s.species,
    total_count: s.total_count
  })), [siteData]);

  const categoryBreakdown = useMemo(() => {
    const acc: any[] = [];
    siteData.forEach(curr => {
      const existing = acc.find(a => a.name === curr.category);
      if (existing) existing.value += curr.total_count;
      else acc.push({ name: curr.category, value: curr.total_count });
    });
    return acc.map(c => ({ 
      name: c.name?.replace('_', ' ')?.toUpperCase() || 'UNKNOWN', 
      value: c.value 
    })).filter(c => c.value > 0);
  }, [siteData]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '3.5px solid #1a7a4a', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.025em' }}>Analyzing Waterhole Data…</p>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* ── Page Header ────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a7a4a', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
          <Droplets size={12} /> Environmental Monitoring · Static Site Analytics
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Waterhole Analysis</h1>
              {parkId && (
                <div style={{ padding: '0.25rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <YearSelector parkId={parkId} selectedYear={selectedYear} onYearChange={handleYearChange} />
                </div>
              )}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <MapPin size={14} style={{ color: '#1a7a4a' }} />
              Monitoring dry-season animal distribution and clustering patterns.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Site Selector ──────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={stagger} 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          marginBottom: '2.5rem' 
        }}
      >
        {sites.map(site => {
          const isActive = selectedSite === site.name;
          return (
            <motion.button
              key={site.id}
              variants={fadeUp}
              onClick={() => setSelectedSite(site.name)}
              style={{
                padding: '1.25rem 1.75rem',
                borderRadius: '1.5rem',
                border: isActive ? '1.5px solid #1a7a4a' : '1px solid #f1f5f9',
                backgroundColor: isActive ? '#f0fdf4' : '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 8px 24px rgba(26,122,74,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                minWidth: '200px'
              }}
            >
              <div style={{ 
                width: '2.75rem', 
                height: '2.75rem', 
                borderRadius: '1rem', 
                backgroundColor: isActive ? '#1a7a4a' : '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#fff' : '#1a7a4a',
                transition: 'all 0.2s'
              }}>
                <MapPin size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{site.name}</p>
                <p style={{ fontSize: '10px', fontWeight: 900, color: isActive ? '#1a7a4a' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0.125rem 0 0' }}>
                  {site.site_type}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Analytics Section ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Site Species Analysis */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '2.5rem', 
            border: '1px solid #f1f5f9', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
            padding: '2.5rem', 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '520px' 
          }}
        >
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Leaf size={20} style={{ color: '#1a7a4a' }} /> {selectedSite} Biodiversity
            </h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, margin: '0.25rem 0 0', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Species recorded at this location</p>
          </div>
          
          <div style={{ flex: 1, minHeight: 0 }}>
            <PremiumBarChart data={chartData} />
          </div>
        </motion.div>

        {/* Breakdown & Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Taxonomic Breakdown */}
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: '2rem', 
              border: '1px solid #f1f5f9', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
              padding: '2rem', 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: '340px' 
            }}
          >
            <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem', margin: 0 }}>Distribution by Category</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <PremiumDoughnutChart data={categoryBreakdown} />
            </div>
          </motion.div>

          {/* Strategic Context */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: '2rem', 
              border: '1px solid #f1f5f9', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
              padding: '2rem', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1.25rem' 
            }}
          >
            <div style={{ padding: '0.875rem', backgroundColor: '#eff6ff', borderRadius: '1rem', border: '1px solid #dbeafe' }}>
              <Activity size={24} style={{ color: '#2563eb' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', margin: 0 }}>Ecological Significance</h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, fontWeight: 700, margin: 0 }}>
                Static sites serve as critical indicator zones. Clustering patterns during peak thermal hours provide 
                insights into water accessibility and species competition hierarchies.
              </p>
            </div>
          </motion.div>
        
        </div>
      </div>

      {/* ── Additional Info ───────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ 
          padding: '2.5rem', 
          backgroundColor: '#0f172a', 
          color: '#fff', 
          borderRadius: '2.5rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(15,23,42,0.12)'
        }}
      >
        <Leaf size={100} style={{ position: 'absolute', right: '-1.5rem', bottom: '-1.5rem', opacity: 0.08, transform: 'rotate(-10deg)' }} />
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '1.25rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Info size={32} style={{ color: '#4ade80' }} />
        </div>
        <div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Management Insight</h4>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontWeight: 700, maxWidth: '44rem', margin: 0 }}>
            Observation data for static sites is collected via 24-hour vigilant monitoring cycles. 
            The results shown here are aggregated based on peak waterhole occupancy across all surveyed transects. 
            For detailed night-vision trail camera data, please consult the full ecological report.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
