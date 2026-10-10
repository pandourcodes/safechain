// src/screens/TimelineScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Vibration, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants';
import { evidenceEngine } from '../services/EvidenceEngine';

export default function TimelineScreen({ navigation }) {
  const [filter, setFilter] = useState('All');
  const [evidenceList, setEvidenceList] = useState([]);
  const [isIncidentActive, setIsIncidentActive] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const unsub = evidenceEngine.subscribe((engineState) => {
      setEvidenceList(engineState.evidence);
      setIsIncidentActive(engineState.isActive);
    });
    return unsub;
  }, []);

  const togglePlayAudio = (item) => {
    if (playingId === item.id) {
      evidenceEngine.stopAudio();
      setPlayingId(null);
    } else {
      setPlayingId(item.id);
      evidenceEngine.playAudio(item.audioUri, () => {
        setPlayingId(null);
      });
    }
  };

  const handleManualCapture = async () => {
    if (isCapturing) return;

    try {
      setIsCapturing(true);
      Vibration.vibrate(25);
      await evidenceEngine.captureSilentPhoto(true);
    } catch (err) {
      console.warn('Manual snap error:', err);
    } finally {
      setTimeout(() => {
        setIsCapturing(false);
      }, 800);
    }
  };

  const filtered = filter === 'All' 
    ? evidenceList 
    : evidenceList.filter(e => e.type.toLowerCase() === filter.toLowerCase());

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 24 }}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Evidence Timeline ({evidenceList.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Manual capture card */}
      {isIncidentActive && (
        <View style={styles.manualCard}>
          <View style={styles.manualHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.pulseDot} />
              <Text style={styles.manualTitle}>Manual Evidence Capture</Text>
            </View>
            <View style={styles.liveTag}>
              <Text style={styles.liveText}>FRONT LENS READY</Text>
            </View>
          </View>

          <Text style={styles.manualSubtitle}>
            Continuous background capture is running. Tap below to immediately log an additional instant snapshot.
          </Text>

          <TouchableOpacity
            style={[styles.captureBtn, isCapturing && { opacity: 0.7 }]}
            onPress={handleManualCapture}
            activeOpacity={0.8}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.captureBtnText}>📸 Capture Instant Photo</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
        {['All', 'Location', 'Photo', 'Audio', 'Device'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, filter === f && styles.activePill]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.pillText, filter === f && styles.activePillText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Empty State */}
      {filtered.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>🛡️</Text>
          <Text style={styles.emptyTitle}>No Evidence Logged Yet</Text>
          <Text style={styles.emptySub}>Trigger SOS or enter 9110= in the calculator to record.</Text>
        </View>
      )}

      {/* Evidence Timeline Items */}
      {filtered.map((item) => (
        <View key={item.id} style={styles.timelineItem}>
          <View style={[
            styles.nodeIcon,
            item.type === 'location' && { backgroundColor: COLORS.success },
            item.type === 'photo' && { backgroundColor: COLORS.primary },
            item.type === 'device' && { backgroundColor: '#0284C7' },
            item.type === 'audio' && { backgroundColor: '#7C3AED' }
          ]}>
            <Text style={styles.nodeIconText}>
              {item.type === 'location' ? '📍' : item.type === 'photo' ? '📷' : item.type === 'device' ? '📱' : '🎙️'}
            </Text>
          </View>

          <View style={styles.timelineContent}>
            <TouchableOpacity onPress={() => navigation.navigate('EvidenceDetail', { evidence: item })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.nodeTitle}>{item.title}</Text>
                <Text style={styles.verifiedTag}>✓ Verified</Text>
              </View>
              <Text style={styles.nodeTime}>{item.date}, {item.time}</Text>
            </TouchableOpacity>

            {item.type === 'location' && (
              <TouchableOpacity onPress={() => navigation.navigate('EvidenceDetail', { evidence: item })}>
                <View style={styles.metaBox}>
                  <Text style={styles.bold}>{item.address}</Text>
                  <Text style={styles.subText}>GPS: {item.lat}, {item.lng} (Accuracy: {item.accuracy})</Text>
                </View>
              </TouchableOpacity>
            )}

            {item.type === 'device' && (
              <TouchableOpacity onPress={() => navigation.navigate('EvidenceDetail', { evidence: item })}>
                <View style={styles.metaBox}>
                  <Text style={styles.subText}>Device: <Text style={styles.bold}>{item.device}</Text></Text>
                  <Text style={styles.subText}>Battery: <Text style={styles.bold}>{item.battery}</Text> | Network: <Text style={styles.bold}>{item.network}</Text></Text>
                  <Text style={styles.subText}>OS: <Text style={styles.bold}>{item.os}</Text></Text>
                </View>
              </TouchableOpacity>
            )}

            {item.type === 'photo' && (
              <TouchableOpacity onPress={() => navigation.navigate('EvidenceDetail', { evidence: item })}>
                <Image source={{ uri: item.imageUri }} style={styles.evidenceImage} />
              </TouchableOpacity>
            )}

            {item.type === 'audio' && (
              <View style={styles.audioPlayer}>
                <TouchableOpacity
                  style={[styles.playBtn, playingId === item.id && { backgroundColor: COLORS.emergency }]}
                  onPress={() => togglePlayAudio(item)}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                    {playingId === item.id ? '⏸' : '▶'}
                  </Text>
                </TouchableOpacity>

                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={{ color: playingId === item.id ? COLORS.primary : COLORS.textMuted, letterSpacing: 2 }}>
                    {playingId === item.id ? '||||||||||||||||||||' : '|||i|l||i|l||i|l||i|l'}
                  </Text>
                </View>

                <Text style={styles.subText}>{playingId === item.id ? 'Playing...' : item.duration}</Text>
              </View>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('EvidenceDetail', { evidence: item })}>
              <Text style={styles.hashPreview}>
                SHA-256: {item.hash.slice(0, 16)}...{item.hash.slice(-8)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 35, marginBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  manualCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, marginBottom: 16, elevation: 1 },
  manualHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 6 },
  manualTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  liveTag: { backgroundColor: COLORS.successSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  liveText: { fontSize: 9, fontWeight: '800', color: COLORS.success },
  manualSubtitle: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16, marginBottom: 12 },
  captureBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  captureBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  pillRow: { marginBottom: 18 },
  pill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8, elevation: 1 },
  activePill: { backgroundColor: COLORS.primary },
  pillText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  activePillText: { color: '#FFFFFF' },
  emptyCard: { backgroundColor: COLORS.card, padding: 30, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  emptySub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 6 },
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  nodeIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  nodeIconText: { fontSize: 14 },
  timelineContent: { flex: 1, marginLeft: 12, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, elevation: 1 },
  nodeTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  verifiedTag: { fontSize: 10, fontWeight: '700', color: COLORS.success },
  nodeTime: { fontSize: 11, color: COLORS.textMuted, marginVertical: 4 },
  metaBox: { backgroundColor: COLORS.cardSubtle, padding: 10, borderRadius: 8, marginTop: 4 },
  subText: { fontSize: 11, color: COLORS.textMuted },
  bold: { color: COLORS.textDark, fontWeight: '600' },
  evidenceImage: { width: '100%', height: 120, borderRadius: 10, marginTop: 6 },
  audioPlayer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardSubtle, padding: 10, borderRadius: 8, marginTop: 8 },
  playBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  hashPreview: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 8 }
});