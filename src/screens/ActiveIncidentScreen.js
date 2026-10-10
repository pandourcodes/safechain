import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants';
import { evidenceEngine } from '../services/EvidenceEngine';

export default function ActiveIncidentScreen({ navigation }) {
  const [engine, setEngine] = useState({ isActive: false, incident: null, evidence: [] });
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const unsub = evidenceEngine.subscribe((val) => setEngine(val));
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `00:${m}:${s}`;
  };

  const hasLocation = engine.evidence.some(e => e.type === 'location');
  const hasDevice = engine.evidence.some(e => e.type === 'device');
  const hasPhoto = engine.evidence.some(e => e.type === 'photo');
  const hasAudio = engine.evidence.some(e => e.type === 'audio');

  const collectedCount = [hasLocation, hasDevice, hasPhoto, hasAudio].filter(Boolean).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 24 }}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Active Incident</Text>
        <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>ACTIVE</Text></View>
      </View>

      {/* Incident ID Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.subLabel}>Incident ID</Text>
            <Text style={styles.idText}>{engine.incident?.id || 'INC-202610-001'}</Text>
          </View>
          <Text style={{ fontSize: 18 }}>📋</Text>
        </View>
        <Text style={[styles.subLabel, { marginTop: 12 }]}>Started at</Text>
        <Text style={styles.boldText}>{engine.incident?.startTime || 'Just now'}</Text>
        <Text style={[styles.subLabel, { marginTop: 12 }]}>Duration</Text>
        <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
      </View>

      {/* Emergency Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Emergency Status</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <View style={styles.redDot} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.redStatus}>Active & Chaining</Text>
            <Text style={styles.subLabel}>
              {engine.evidence.length} evidence packets cryptographically hashed
            </Text>
          </View>
        </View>
      </View>

      {/* Evidence Checklist */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Evidence Collection</Text>
        <View style={styles.collectionContainer}>
          <View style={styles.circleWidget}>
            <Text style={styles.circleNumber}>{collectedCount}/4</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <View style={styles.checkRow}>
              <Text style={{ marginRight: 6 }}>📍</Text>
              <Text style={styles.checkTitle}>GPS Location</Text>
              <Text style={[styles.checkStatus, hasLocation && { color: COLORS.success }]}>
                {hasLocation ? 'Collected ✓' : 'Locking...'}
              </Text>
            </View>

            <View style={styles.checkRow}>
              <Text style={{ marginRight: 6 }}>📱</Text>
              <Text style={styles.checkTitle}>Device Telemetry</Text>
              <Text style={[styles.checkStatus, hasDevice && { color: COLORS.success }]}>
                {hasDevice ? 'Collected ✓' : 'Reading...'}
              </Text>
            </View>

            <View style={styles.checkRow}>
              <Text style={{ marginRight: 6 }}>📷</Text>
              <Text style={styles.checkTitle}>Camera Stream</Text>
              <Text style={[styles.checkStatus, hasPhoto && { color: COLORS.success }]}>
                {hasPhoto ? 'Collected ✓' : 'Capturing...'}
              </Text>
            </View>

            <View style={styles.checkRow}>
              <Text style={{ marginRight: 6 }}>🎙️</Text>
              <Text style={styles.checkTitle}>Audio Buffer</Text>
              <Text style={[styles.checkStatus, hasAudio && { color: COLORS.success }]}>
                {hasAudio ? 'Collected ✓' : 'Buffering...'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* End Incident Button */}
      <TouchableOpacity
        style={styles.endBtn}
        // FIXED: Safely return to MainTabs -> Home
onPress={() => {
  evidenceEngine.stopIncident();
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }
}}
      >
        <Text style={styles.endBtnText}>⏹ End Incident</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 35, marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  activeBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 14, elevation: 1 },
  subLabel: { fontSize: 11, color: COLORS.textMuted },
  idText: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginTop: 2 },
  boldText: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginTop: 2 },
  timerText: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, marginTop: 2 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  redDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.emergency },
  redStatus: { fontSize: 16, fontWeight: '700', color: COLORS.emergency },
  collectionContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  circleWidget: { width: 68, height: 68, borderRadius: 34, borderWidth: 4, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  circleNumber: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  checkTitle: { flex: 1, fontSize: 12, color: COLORS.textDark },
  checkStatus: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  endBtn: { backgroundColor: COLORS.emergency, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginVertical: 10 },
  endBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});