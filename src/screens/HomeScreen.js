// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Vibration } from 'react-native';
import { evidenceEngine } from '../services/EvidenceEngine';
import { useTheme } from '../context/ThemeContext';
import SafeRouteModal from '../components/SafeRouteModal';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
const [safeRouteVisible, setSafeRouteVisible] = useState(false);
  const [engineState, setEngineState] = useState({
    isActive: false,
    incident: null,
    evidence: [],
    history: [],
  });

  useEffect(() => {
    const unsub = evidenceEngine.subscribe((state) => {
      setEngineState(state);
    });
    return unsub;
  }, []);

  const handleSosPress = async () => {
    Vibration.vibrate([0, 500, 200, 500]);
    if (!engineState.isActive) {
      await evidenceEngine.startIncident();
      navigation.navigate('ActiveIncident');
    } else {
      navigation.navigate('ActiveIncident');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 40, paddingBottom: 30 }}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.shieldIconContainer, { backgroundColor: theme.primarySoft }]}>
            <Text style={{ fontSize: 24 }}>🛡️</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.headerTitle, { color: theme.textDark }]}>SafeChain</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Your Safety, Real Evidence.</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.settingsBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Status Banner */}
      <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.statusCheckCircle, { backgroundColor: theme.successSoft }]}>
          <Text style={{ fontSize: 16, color: theme.success, fontWeight: 'bold' }}>✓</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.statusTitle, { color: theme.textDark }]}>
            {engineState.isActive ? 'Incident In Progress' : 'You are safe'}
          </Text>
          <Text style={[styles.statusSubtitle, { color: theme.textMuted }]}>
            {engineState.isActive ? 'Recording telemetry and evidence.' : 'No active incident right now.'}
          </Text>
        </View>
        <View style={[styles.readyPill, { backgroundColor: engineState.isActive ? theme.emergencySoft : theme.successSoft }]}>
          <View style={[styles.readyDot, { backgroundColor: engineState.isActive ? theme.emergency : theme.success }]} />
          <Text style={[styles.readyText, { color: engineState.isActive ? theme.emergency : theme.success }]}>
            {engineState.isActive ? 'Active' : 'Ready'}
          </Text>
        </View>
      </View>

      {/* Big Circular SOS Button */}
      <View style={styles.sosOuterWrapper}>
        <View style={[styles.sosAura, { backgroundColor: theme.primarySoft }]}>
          <TouchableOpacity
            style={[styles.sosCircle, { backgroundColor: engineState.isActive ? theme.emergency : theme.primary }]}
            onPress={handleSosPress}
            activeOpacity={0.85}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubtext}>
              {engineState.isActive ? 'INCIDENT LIVE' : 'TAP TO ACTIVATE'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Explanation Hint */}
      <Text style={[styles.infoText, { color: theme.textMuted }]}>
        Evidence capture starts immediately. Silent trigger available via calculator.
      </Text>

      {/* Quick Access Section */}
      <Text style={[styles.sectionHeading, { color: theme.textDark }]}>Quick access</Text>

      <View style={styles.quickAccessRow}>
        {/* Timeline */}
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Timeline')}
          activeOpacity={0.7}
        >
          <View style={[styles.cardIconBox, { backgroundColor: theme.cardSubtle }]}>
            <Text style={{ fontSize: 22 }}>✨</Text>
          </View>
          <Text style={[styles.cardLabel, { color: theme.textDark }]}>Timeline</Text>
        </TouchableOpacity>

        {/* History */}
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.7}
        >
          <View style={[styles.cardIconBox, { backgroundColor: theme.cardSubtle }]}>
            <Text style={{ fontSize: 22 }}>⏱️</Text>
          </View>
          <Text style={[styles.cardLabel, { color: theme.textDark }]}>History</Text>
        </TouchableOpacity>

        {/* Disguised / Calculator */}
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Calculator')}
          activeOpacity={0.7}
        >
          <View style={[styles.cardIconBox, { backgroundColor: theme.cardSubtle }]}>
            <Text style={{ fontSize: 22 }}>🔢</Text>
          </View>
          <Text style={[styles.cardLabel, { color: theme.textDark }]}>Disguised</Text>
        </TouchableOpacity>

        {/* Safe Route AI */}
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setSafeRouteVisible(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.cardIconBox, { backgroundColor: theme.cardSubtle }]}>
            <Text style={{ fontSize: 22 }}>🛡️</Text>
          </View>
          <Text style={[styles.cardLabel, { color: theme.textDark }]}>SafeRoute</Text>
        </TouchableOpacity>
      </View>

      {/* Safe Route Modal */}
      <SafeRouteModal
        visible={safeRouteVisible}
        onClose={() => setSafeRouteVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 2,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 35,
  },
  statusCheckCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  readyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  readyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sosOuterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  sosAura: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
  },
  bellIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  sosText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  sosSubtext: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1,
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 24,
    marginBottom: 35,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 1,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});