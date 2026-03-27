'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gc } from '@/lib/supabase';
import { Park, Survey, SpeciesSummaryRow } from '@/types';
import { 
  Users, 
  Map as MapIcon, 
  Database, 
  Activity, 
  Calendar, 
  AlertCircle,
  Leaf,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import YearSelector from '@/components/YearSelector';
import PremiumBarChart from '@/components/charts/PremiumBarChart';
import PremiumDoughnutChart from '@/components/charts/PremiumDoughnutChart';
import { getWildlifeMetadata } from '@/lib/constants';

const fadeUp: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const stagger: any = {
  show: { transition: { staggerChildren: 0.08 } }
};

export default function ParkDashboard({ params }: { params: { parkId: string } }) {
  const { parkId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [park, setPark] = useState<Park | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [speciesData, setSpeciesData] = useState<SpeciesSummaryRow[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedYear = Number(searchParams.get('year')) || 2025;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Query by ID (slug-like) or fallback to name matching if necessary
        // For now, assume parkId matches the ID in the database (e.g., 'mana-pools')
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parkId);
        const { data: pData } = await gc
          .from('parks')
          .select('*')
          .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? parkId : `%${parkId.replace(/-/g, ' ')}%`)
          .single();
        
        setPark(pData);

        if (pData) {
          const { data: sData } = await gc
            .from('surveys')
            .select('*')
            .eq('park_id', pData.id)
            .eq('year', selectedYear)
            .single();

          if (sData) {
            setSurvey(sData);
            const [{ data: specData }, { data: actData }] = await Promise.all([
              gc.from('v_survey_species_totals').select('*').eq('survey_id', sData.id).order('total_count', { ascending: false }),
              gc.from('v_activity_summary').select('*').eq('survey_id', sData.id)
            ]);
            setSpeciesData(specData || []);
            setActivityData(actData || []);
          } else {
            setSurvey(null);
            setSpeciesData([]);
            setActivityData([]);
          }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchData();
  }, [selectedYear, parkId]);

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', year.toString());
    router.push(`/dashboard/${parkId}?${params.toString()}`);
  };

  const totalSightings = useMemo(() => speciesData.reduce((a, b) => a + (b.total_count || 0), 0), [speciesData]);
  const topSpecies = useMemo(() => speciesData.slice(0, 6).map(s => ({
    species: s.species,
    total_count: s.total_count
  })), [speciesData]);

  const classBreakdown = useMemo(() => [
    { name: 'Mammals', value: speciesData.filter(s => s.class === 'mammal').reduce((a, b) => a + b.total_count, 0) },
    { name: 'Birds', value: speciesData.filter(s => s.class === 'bird').reduce((a, b) => a + b.total_count, 0) },
    { name: 'Reptiles', value: speciesData.filter(s => s.class === 'reptile').reduce((a, b) => a + b.total_count, 0) },
  ].filter(c => c.value > 0), [speciesData]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '3.5px solid #1a7a4a', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.025em' }}>Loading Dashboard…</p>
      </div>
    </div>
  );

  if (!park) return <div style={{ padding: '2.5rem', textAlign: 'center', fontWeight: 'bold', color: '#f43f5e' }}>Park Metadata Missing</div>;

  return (
    <div className="w-full">
      {/* ── Page Header ────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a7a4a', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
          <Leaf size={12} /> Regional Environmental Dashboard · Zimbabwe
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>{park.name}</h1>
              <div style={{ padding: '0.25rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <YearSelector parkId={park.id} selectedYear={selectedYear} onYearChange={handleYearChange} />
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <MapIcon size={14} style={{ color: '#1a7a4a' }} />
              {park.region} · {park.area_ha.toLocaleString()} Hectares · <span style={{ color: '#1a7a4a', fontWeight: 900 }}>LIVE SYSTEM</span>
            </p>
          </div>
          <div className="hidden sm:flex" style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 0.25rem' }}>Last Update</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{selectedYear} Survey Cycle</p>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Grid ───────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={stagger} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.25rem', 
          marginBottom: '2.5rem' 
        }}
      >
        {[
          { label: 'Total Individuals', value: totalSightings.toLocaleString(), sub: 'Recorded Population', icon: Database, color: '#1a7a4a' },
          { label: 'Census Year',      value: survey?.year || selectedYear,    sub: 'Data Cycle',          icon: Calendar, color: '#3b82f6' },
          { label: 'Volunteers',       value: survey?.total_volunteers || 0,   sub: 'Participating Experts', icon: Users,    color: '#d97706' },
          { label: 'Static Sites',     value: survey?.num_static_sites || 0,   sub: 'Waterhole Monitoring',  icon: Activity, color: '#a855f7' },
        ].map(k => (
          <motion.div key={k.label} variants={fadeUp}
            style={{ 
              backgroundColor: '#fff',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9',
              borderLeft: `5.5px solid ${k.color}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '140px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>{k.label}</p>
                <k.icon size={16} color={k.color} style={{ opacity: 0.7 }} />
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>{k.value}</p>
            </div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', margin: '0.75rem 0 0' }}>{k.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main Analytics ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Top Species Observations */}
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '2.5rem', 
            border: '1px solid #f1f5f9', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
            padding: '2rem', 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '480px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Leaf size={20} style={{ color: '#1a7a4a' }} /> Top Species Observations
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, margin: '0.25rem 0 0', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Census Transect Totals</p>
            </div>
            <button 
              onClick={() => router.push(`/dashboard/${parkId}/species`)}
              style={{ background: 'none', border: 'none', color: '#1a7a4a', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Full List <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <PremiumBarChart data={topSpecies} />
          </div>
        </motion.div>

        {/* Breakdown Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Class Breakdown */}
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: '2rem', 
              border: '1px solid #f1f5f9', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
              padding: '2rem', 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: '320px' 
            }}
          >
            <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem', margin: 0 }}>Taxonomic Breakdown</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <PremiumDoughnutChart data={classBreakdown} />
            </div>
          </motion.div>

          {/* Omissions / Noted Data Card */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
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
            <div style={{ padding: '0.875rem', backgroundColor: '#fffbeb', borderRadius: '1rem', border: '1px solid #fef3c7' }}>
              <AlertCircle size={24} style={{ color: '#d97706' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', margin: 0 }}>Technical Omissions</h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, fontWeight: 700, margin: 0 }}>
                GPS collection logs indicate 2025 variations. Geolocation precision prioritized for the next cycle.
              </p>
            </div>
          </motion.div>
        
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Global Activity Analysis */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '2rem', 
            border: '1px solid #f1f5f9', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
            padding: '2rem', 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '280px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Clock size={16} style={{ color: '#3b82f6' }} />
            <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Activity Behavior Summary</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1.5rem' }}>
            {activityData.slice(0, 4).map((a, i) => (
              <div key={a.activity}>
                <p style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 0.25rem' }}>{a.activity?.replace('_', ' ')}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{a.total_count.toLocaleString()}</p>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                    style={{ height: '100%', backgroundColor: 'rgba(59,130,246,0.3)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Historical Insight Card */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          style={{ 
            backgroundColor: '#1a7a4a', 
            color: '#fff', 
            borderRadius: '2rem', 
            padding: '2rem', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            position: 'relative', 
            overflow: 'hidden', 
            boxShadow: '0 10px 30px rgba(26,122,74,0.15)' 
          }}
        >
          {/* Abstract leaf decoration */}
          <Leaf size={120} style={{ position: 'absolute', right: '-2rem', bottom: '-2rem', opacity: 0.1, transform: 'rotate(15deg)' }} />
          
          <h4 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.75rem', margin: 0 }}>Ecological Perspective</h4>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontWeight: 700, maxWidth: '24rem', margin: 0 }}>
            {selectedYear === 2025 
              ? "Observational spikes in ungulate transitions recorded during the Sept 7 census phase. Thermal data correlates with increased movement toward the Zambezi floodplains."
              : `Accessing historical ecosystem baseline for the ${selectedYear} cycle. These records form the foundation of our longitudinal biodiversity analysis.`}
          </p>
          <button 
            onClick={() => router.push(`/dashboard/${parkId}/trends`)}
            style={{ 
              marginTop: '1.5rem', 
              background: 'none', 
              border: 'none', 
              color: '#fff', 
              fontSize: '11px', 
              fontWeight: 900, 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.375rem',
              width: 'fit-content'
            }}
          >
            Explore Trends <ChevronRight size={14} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
