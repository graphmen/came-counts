import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { SpeciesSummaryRow, Survey, Park } from '@/types';

// Register fonts if needed (using default for now)

const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#ffffff' },
    header: { marginBottom: 24, borderBottom: 1, borderBottomColor: '#1a7a4a', paddingBottom: 12 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1a7a4a' },
    subtitle: { fontSize: 12, color: '#64748b', marginTop: 4 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a7a4a', marginBottom: 12, textTransform: 'uppercase' },
    text: { fontSize: 10, color: '#334155', lineHeight: 1.5, marginBottom: 8 },
    table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    tableHeader: { backgroundColor: '#f8fafc' },
    tableCellHeader: { fontSize: 9, fontWeight: 'bold', padding: 6, flex: 1, color: '#475569' },
    tableCell: { fontSize: 9, padding: 6, flex: 1, color: '#334155' },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: 1, borderTopColor: '#e2e8f0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
    pageNumber: { fontSize: 9, color: '#94a3b8' },
});

interface Props {
    park: Park;
    survey: Survey;
    speciesData: SpeciesSummaryRow[];
}

export const ManaPoolsReportPDF = ({ park, survey, speciesData }: Props) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>WEZ GAME COUNT REPORT</Text>
                <Text style={styles.subtitle}>{park.name} — {survey.year} Annual Census</Text>
            </View>

            {/* Executive Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Executive Summary</Text>
                <Text style={styles.text}>
                    The {survey.year} {park.name} Game Count report summarizes wildlife observations {survey.start_date ? `conducted from ${new Date(survey.start_date).toLocaleDateString()} to ${new Date(survey.end_date).toLocaleDateString()}` : `for the ${survey.year} cycle`}.
                    As a UNESCO World Heritage Site, Mana Pools remains a critical component of the Middle Zambezi Biosphere Reserve. This {survey.year} census
                    {survey.total_volunteers ? ` involved ${survey.total_volunteers} volunteers and` : ""} covered the key floodplain habitats.
                </Text>
                <Text style={styles.text}>
                    A total of {speciesData.reduce((a, b) => a + b.total_count, 0).toLocaleString()} individual sightings were recorded across
                    mammals, birds, and reptiles. {survey.notes || ""}
                </Text>
            </View>

            {/* Findings Table */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Species Observation Data</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.tableCellHeader}>Species</Text>
                        <Text style={styles.tableCellHeader}>Class</Text>
                        <Text style={styles.tableCellHeader}>Total Count</Text>
                        <Text style={styles.tableCellHeader}>Males</Text>
                        <Text style={styles.tableCellHeader}>Females</Text>
                    </View>
                    {speciesData.slice(0, 15).map((row, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{row.species}</Text>
                            <Text style={styles.tableCell}>{row.class}</Text>
                            <Text style={styles.tableCell}>{row.total_count.toLocaleString()}</Text>
                            <Text style={styles.tableCell}>{row.male_count}</Text>
                            <Text style={styles.tableCell}>{row.female_count}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.pageNumber}>Wildlife & Environment Zimbabwe (WEZ) • All Parks Platform</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
            </View>
        </Page>
    </Document>
);
