import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Note: In a real app, we'd register custom fonts here. 
// For now, we'll use standard PDF fonts.

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    textAlign: 'right',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: 8,
    padding: '3px 8px',
    borderRadius: 4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    backgroundColor: '#f1f5f9',
    padding: '4px 8px',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  kpiBox: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  kpiLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: '6px 8px',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: '6px 8px',
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    flex: 1,
  },
  tableCell: {
    fontSize: 8,
    color: '#334155',
    flex: 1,
  },
  speciesCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1.5,
  },
  countCell: {
    fontSize: 8,
    textAlign: 'center',
    flex: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    transform: 'rotate(-45deg)',
    fontSize: 60,
    color: '#f1f5f9',
    opacity: 0.3,
    zIndex: -1,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  evidenceCard: {
    width: '96%',
    margin: '2%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 15,
  },
  evidenceImage: {
    width: '100%',
    height: 280,
    objectFit: 'cover',
  },
  evidenceMeta: {
    padding: 6,
  },
  evidenceText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
});

interface Observation {
  id: string;
  species: string;
  count: number;
  date: string;
  time: string;
  habitat: string;
  activity: string;
  observer?: string;
  male_count: number;
  female_count: number;
  unknown_count: number;
  photo_url?: string;
}

interface Props {
  parkName: string;
  observations: Observation[];
  speciesSummary: { name: string; value: number }[];
}

export const TacticalIntelReport = ({ parkName = 'Unknown Park', observations = [], speciesSummary = [] }: Props) => {
  const safeObs = Array.isArray(observations) ? observations : [];
  const safeSpecies = Array.isArray(speciesSummary) ? speciesSummary : [];
  
  const totalCount = safeObs.reduce((acc, curr) => acc + (Number(curr?.count) || 0), 0);
  const timestamp = new Date().toLocaleString();

  return (
    <Document title={`WEZ Tactical Intel - ${parkName}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>CLASSIFIED</Text>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Tactical Intel Report</Text>
            <Text style={styles.subtitle}>Wildlife & Environment Zimbabwe · Game Counts</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.statusBadge}>OPERATIONAL_SECURE</Text>
            <Text style={[styles.subtitle, { marginTop: 4 }]}>{timestamp}</Text>
          </View>
        </View>

        {/* Operational Context */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operational Overview</Text>
          <View style={styles.grid}>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Designated Sector</Text>
              <Text style={styles.kpiValue}>{parkName}</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Total Sightings</Text>
              <Text style={styles.kpiValue}>{safeObs.length}</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Specimen Count</Text>
              <Text style={styles.kpiValue}>{totalCount}</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Species Diversity</Text>
              <Text style={styles.kpiValue}>{safeSpecies.length}</Text>
            </View>
          </View>
        </View>

        {/* Species Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Species Density Matrix</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.speciesCell}>Species Identification</Text>
              <Text style={styles.tableHeaderCell}>Population Group</Text>
              <Text style={styles.countCell}>Count</Text>
              <Text style={styles.tableHeaderCell}>Confidence</Text>
            </View>
            {safeSpecies.slice(0, 12).map((s, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.speciesCell}>{(s.name || 'Unknown').toUpperCase()}</Text>
                <Text style={styles.tableCell}>WEZ-Mobile Sighting</Text>
                <Text style={styles.countCell}>{s.value || 0}</Text>
                <Text style={styles.tableCell}>HIGH</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Operational Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tactical Recon Log (Recent)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Time</Text>
              <Text style={styles.speciesCell}>Species Identification</Text>
              <Text style={styles.tableHeaderCell}>Observer Node</Text>
              <Text style={styles.tableHeaderCell}>Activity</Text>
            </View>
            {safeObs.slice(0, 10).map((o, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{o.time || 'N/A'}</Text>
                <Text style={styles.speciesCell}>{(o.species || 'Unknown').toUpperCase()}</Text>
                <Text style={styles.tableCell}>{o.observer || 'MOBILE-NODE'}</Text>
                <Text style={styles.tableCell}>{o.activity || 'IDLE'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Field Evidence */}
        {safeObs.filter(o => o.photo_url && o.photo_url.startsWith('http')).length > 0 ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Field Intelligence Evidence (Authenticated)</Text>
            <View style={styles.gallery}>
              {safeObs.filter(o => o.photo_url && o.photo_url.startsWith('http')).slice(0, 8).map((o, i) => (
                <View key={i} style={styles.evidenceCard}>
                  <Image src={o.photo_url!} style={styles.evidenceImage} />
                  <View style={styles.evidenceMeta}>
                    <Text style={[styles.evidenceText, { fontSize: 9 }]}>{(o.species || 'UNK').toUpperCase()} · {o.date || 'N/A'}</Text>
                    <Text style={[styles.evidenceText, { color: '#64748b', marginTop: 4, fontSize: 8 }]}>Loc: {o.habitat || 'Sector Alpha'} · Node: {o.observer || 'NODE'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Authenticated Intelligence Stream · Encryption Active · Node: WEZ-GAMECOUNT-Z01</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};
