import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants';
import { evidenceEngine } from '../services/EvidenceEngine';

export default function HistoryScreen({ navigation }) {
  const [filter, setFilter] = useState('All');
  const [engineState, setEngineState] = useState({
    isActive: false,
    incident: null,
    history: [],
    evidence: [],
  });

  useEffect(() => {
    const unsub = evidenceEngine.subscribe((state) => {
      setEngineState(state);
    });
    return unsub;
  }, []);

  // Build the live combined list:
  // 1. If an incident is currently active, prepend it as an "Active" entry
  const displayList = [];

  if (engineState.isActive && engineState.incident) {
    const photoEv = engineState.evidence.find(e => e.type === 'photo');
    displayList.push({
      id: engineState.incident.id,
      date: `${engineState.incident.startDate}, ${engineState.incident.startTime}`,
      evidences: engineState.evidence.length,
      duration: 'Ongoing',
      status: 'Active',
      thumb: photoEv ? photoEv.imageUri : 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=300&q=80',
    });
  }

  // 2. Add all previously completed archived incidents
  engineState.history.forEach(item => {
    displayList.push({
      id: item.id,
      date: `${item.startDate}, ${item.startTime}`,
      evidences: item.evidenceCount,
      duration: item.duration,
      status: 'Completed',
      thumb: item.thumb,
    });
  });

  const filtered = filter === 'All'
    ? displayList
    : displayList.filter(item => item.status === filter);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.pageTitle}>Incident History</Text>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {['All', 'Active', 'Completed'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, filter === t && styles.activeTab]}
            onPress={() => setFilter(t)}
          >
            <Text style={[styles.tabText, filter === t && styles.activeTabText]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Empty State when no incidents have been recorded */}
      {filtered.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>📁</Text>
          <Text style={styles.emptyTitle}>No Recorded Incidents</Text>
          <Text style={styles.emptySub}>
            Your incident history is currently empty. Trigger an emergency or discreet activation to start recording.
          </Text>
        </View>
      )}

      {/* Incident Cards */}
      {filtered.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => {
            if (item.status === 'Active') {
              navigation.navigate('ActiveIncident');
            } else {
              navigation.navigate('Timeline');
            }
          }}
        >
          <Image source={{ uri: item.thumb }} style={styles.thumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.idText}>{item.id}</Text>
              <View style={[styles.statusBadge, item.status === 'Active' ? styles.activeBg : styles.completedBg]}>
                <Text style={[styles.statusText, item.status === 'Active' ? styles.activeColor : styles.completedColor]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.dateText}>{item.date}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>📁 {item.evidences} evidences</Text>
              <Text style={styles.meta}>⏱️ {item.duration}</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  pageTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textDark, marginTop: 35, marginBottom: 16 },
  tabRow: { flexDirection: 'row', marginBottom: 20, gap: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, alignItems: 'center', elevation: 1 },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  activeTabText: { color: '#FFFFFF' },
  emptyCard: { backgroundColor: COLORS.card, padding: 32, borderRadius: 16, alignItems: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  emptySub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 12, borderRadius: 16, marginBottom: 12, elevation: 1 },
  thumb: { width: 64, height: 64, borderRadius: 12 },
  idText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  activeBg: { backgroundColor: '#FFEBEA' },
  activeColor: { color: COLORS.emergency, fontSize: 10, fontWeight: '700' },
  completedBg: { backgroundColor: COLORS.successSoft },
  completedColor: { color: COLORS.success, fontSize: 10, fontWeight: '700' },
  dateText: { fontSize: 11, color: COLORS.textMuted, marginVertical: 3 },
  metaRow: { flexDirection: 'row', gap: 12 },
  meta: { fontSize: 10, color: COLORS.textMuted },
  arrow: { fontSize: 20, color: COLORS.textMuted, marginLeft: 8 }
});