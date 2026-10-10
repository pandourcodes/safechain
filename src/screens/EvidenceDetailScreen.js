import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../constants';

export default function EvidenceDetailScreen({ route, navigation }) {
  const item = route?.params?.evidence || {
    id: 'EVID-001',
    type: 'photo',
    time: '09:42 PM',
    date: '10 Oct 2026',
    hash: 'a3f5d9e8b10f2c4d9ae874019bf45a987019ce92837f8490a1bc34d98e727c2b',
    prevHash: 'GENESIS_0000000000000000000000000000000000000000000000000000000000000000',
    device: 'Android Device',
    imageUri: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
  };

  const copyHash = () => {
    Alert.alert('SHA-256 Fingerprint', item.hash);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 24 }}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Evidence Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Visual Preview */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUri || 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80' }}
          style={styles.mainImage}
        />
      </View>

      <View style={styles.metaHeader}>
        <View>
          <Text style={styles.typeTitle}>{item.title || 'Digital Evidence Item'}</Text>
          <Text style={styles.typeTime}>{item.date}, {item.time}</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified Hash</Text>
        </View>
      </View>

      {/* Forensic Table */}
      <View style={styles.detailCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Evidence ID</Text>
          <Text style={styles.value}>{item.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{item.type.toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Capture Time</Text>
          <Text style={styles.value}>{item.time}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Device Model</Text>
          <Text style={styles.value}>{item.device || 'Android Device'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>SHA-256 Hash</Text>
          <TouchableOpacity onPress={copyHash}>
            <Text style={styles.hashLink}>Inspect Hash 📋</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hashFull}>{item.hash}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Chained Previous Hash</Text>
        </View>
        <Text style={styles.hashFull}>{item.prevHash}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Integrity Status</Text>
          <Text style={styles.statusSuccess}>✓ Cryptographically Sealed</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 35, marginBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  imageContainer: { borderRadius: 16, overflow: 'hidden', height: 190 },
  mainImage: { width: '100%', height: '100%' },
  metaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 14 },
  typeTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  typeTime: { fontSize: 12, color: COLORS.textMuted },
  verifiedBadge: { backgroundColor: COLORS.successSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { color: COLORS.success, fontSize: 11, fontWeight: '700' },
  detailCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 12, color: COLORS.textMuted },
  value: { fontSize: 12, fontWeight: '600', color: COLORS.textDark },
  hashLink: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  hashFull: { fontSize: 10, color: COLORS.textDark, fontFamily: 'monospace', marginVertical: 4, backgroundColor: COLORS.cardSubtle, padding: 6, borderRadius: 6 },
  statusSuccess: { fontSize: 12, fontWeight: '700', color: COLORS.success },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 }
});