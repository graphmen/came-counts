'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { gc } from '@/lib/supabase';

const PARKS = [
  { id: 'mana-pools-national-park', name: 'Mana Pools', icon: '🏕️', latest: 2025, sightings: 18853, status: 'active', area: '219,600 ha' },
  { id: 'hwange-national-park', name: 'Hwange', icon: '🐘', latest: null, sightings: null, status: 'coming-soon', area: '1,465,100 ha' },
  { id: 'gonarezhou-national-park', name: 'Gonarezhou', icon: '🦏', latest: null, sightings: null, status: 'coming-soon', area: '506,400 ha' },
  { id: 'lake-chivero-recreational-park', name: 'Lake Chivero', icon: '🐊', latest: null, sightings: null, status: 'coming-soon', area: '5,760 ha' },
];

const QUICK_STATS = [
  { label: 'Total Parks Monitored', value: '6', icon: '🗺️', color: '#22c55e' },
  { label: 'Active Surveys', value: '1', icon: '📋', color: '#3b82f6' },
  { label: '2025 Total Sightings', value: '18,853', icon: '🔭', color: '#d97706' },
  { label: 'Volunteer Count (2025)', value: '140', icon: '👥', color: '#a855f7' },
  { label: 'Species Documented', value: '31', icon: '🧬', color: '#06b6d4' },
  { label: 'Years of Data', value: '32', icon: '📅', color: '#ec4899' },
];

export default function HomePage() {
  const [stats, setStats] = useState(QUICK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Fetch dynamic stats from v_survey_species_totals and other tables
      const { data: speciesCount } = await gc.from('species').select('id', { count: 'exact' });
      const { data: totalSightings } = await gc.from('v_survey_species_totals').select('total_count');
      const total = totalSightings?.reduce((acc, curr) => acc + curr.total_count, 0) || 18853;

      const newStats = [...QUICK_STATS];
      newStats[2].value = total.toLocaleString();
      newStats[4].value = (speciesCount?.length || 31).toString();

      setStats(newStats);
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="fade-in" style={{ maxWidth: 1400 }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        border: '1px solid #dcfce7',
        borderRadius: 20,
        padding: '50px 48px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 30px rgba(26, 122, 74, 0.05)',
      }}>
        <div style={{ position: 'absolute', right: 40, top: -20, fontSize: 160, opacity: 0.1 }}>🦓</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <span style={{ fontSize: 40 }}>🌿</span>
          <div>
            <div style={{ fontSize: 14, color: 'var(--wez-green)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Wildlife & Environment Zimbabwe
            </div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 42, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              <span className="gradient-text">WEZ Game Count</span>
              <span style={{ color: '#0f172a' }}> Platform</span>
            </h1>
          </div>
        </div>
        <p style={{ color: '#475569', fontSize: 18, maxWidth: 680, marginTop: 16, lineHeight: 1.6, fontWeight: 500 }}>
          The official multi-park wildlife monitoring and reporting system. Modernizing conservation with real-time digital dashboards, rigorous trend analysis, and automated professional reports.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
          <Link href="/dashboard/mana-pools">
            <button className="btn-primary">🏕️ View Mana Pools 2025</button>
          </Link>
          <Link href="/dashboard/mana-pools/surveys/new">
            <button className="btn-secondary">➕ Enter Survey Data</button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((stat) => (
          <div key={stat.label} className="kpi-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit,sans-serif', color: stat.color }}>
              {loading ? '...' : stat.value}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Parks Grid */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>
          Conservation Areas
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {PARKS.map((park) => (
            <div key={park.id} className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ fontSize: 42, background: '#f8fafc', padding: 10, borderRadius: 12 }}>{park.icon}</div>
                <span className={`badge ${park.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                  {park.status === 'active' ? '● Active' : '○ Coming Soon'}
                </span>
              </div>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
                {park.name}
              </h3>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20, fontWeight: 500 }}>{park.area}</div>

              {park.sightings ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 12 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--wez-green)' }}>{park.sightings.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>sightings</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 12 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>{park.latest}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>latest year</div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: 14, fontStyle: 'italic', marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 12, textAlign: 'center' }}>
                  Digitization in progress
                </div>
              )}

              {park.status === 'active' ? (
                <Link href={`/dashboard/${park.id}`}>
                  <button className="btn-primary" style={{ width: '100%' }}>Enter Dashboard →</button>
                </Link>
              ) : (
                <button className="btn-secondary" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} disabled>
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="glass-card" style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--wez-green)', marginBottom: 14 }}>🎯 Mission</div>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            Replacing paper-based game count reports with a seamless digital platform that supports WEZ conservation goals across all protected areas in Zimbabwe.
          </p>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', marginBottom: 14 }}>📱 Mobile App (Coming)</div>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            Phase 2 will introduce a native mobile app for field data collection, replacing EpiCollect with a purpose-built WEZ tool with offline GPS support.
          </p>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--wez-gold)', marginBottom: 14 }}>📊 Reporting</div>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            Generate branded PDF reports instantly from any survey dataset. Full species disaggregation, trend charts, and executive summaries — no Word documents needed.
          </p>
        </div>
      </div>
    </div>
  );
}
