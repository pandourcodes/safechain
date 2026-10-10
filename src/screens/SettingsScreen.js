// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, THEMES } from '../context/ThemeContext';

const USER_DATA_KEY = '@safechain_user_profile';
const CONTACTS_KEY = '@safechain_trusted_contacts';
export const PIN_CODES_KEY = '@safechain_pin_codes';

export default function SettingsScreen({ navigation }) {
  const { theme, themeKey, setTheme } = useTheme();

  // User Profile State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Secret PIN Codes State
  const [sosPin, setSosPin] = useState('9110');
  const [unlockPin, setUnlockPin] = useState('1337');

  // Trusted Contacts State
  const [contacts, setContacts] = useState([]);

  // Modal State for Adding Contact
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem(USER_DATA_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setName(parsed.name || '');
        setPhone(parsed.phone || '');
        setBloodGroup(parsed.bloodGroup || '');
        setMedicalNotes(parsed.medicalNotes || '');
      }

      const savedPins = await AsyncStorage.getItem(PIN_CODES_KEY);
      if (savedPins) {
        const parsedPins = JSON.parse(savedPins);
        setSosPin(parsedPins.sosPin || '9110');
        setUnlockPin(parsedPins.unlockPin || '1337');
      }

      const savedContacts = await AsyncStorage.getItem(CONTACTS_KEY);
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      }
    } catch (e) {
      console.warn('Error loading settings:', e);
    }
  };

  const saveUserProfile = async () => {
    try {
      const profile = { name, phone, bloodGroup, medicalNotes };
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(profile));
      Alert.alert('Saved', 'Personal details updated successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  const savePinCodes = async () => {
    if (!sosPin.trim() || !unlockPin.trim()) {
      Alert.alert('Invalid PIN', 'Both PINs must be at least 2 digits.');
      return;
    }
    if (sosPin.trim() === unlockPin.trim()) {
      Alert.alert('PIN Conflict', 'Emergency PIN and Console Unlock PIN cannot be identical.');
      return;
    }

    try {
      const pins = { sosPin: sosPin.trim(), unlockPin: unlockPin.trim() };
      await AsyncStorage.setItem(PIN_CODES_KEY, JSON.stringify(pins));
      Alert.alert('Security Updated', 'Secret calculator trigger PINs updated successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to update PIN codes.');
    }
  };

  const handleAddContact = async () => {
    const trimmedName = newContactName.trim();
    const trimmedEmail = newContactEmail.trim();

    if (!trimmedName || !trimmedEmail) {
      Alert.alert('Missing Info', 'Please enter contact name and a valid recipient email.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const updated = [
      ...contacts,
      {
        id: Date.now().toString(),
        name: trimmedName,
        email: trimmedEmail,
        phone: newContactPhone.trim(),
        relation: newContactRelation.trim() || 'Emergency Contact',
      },
    ];

    try {
      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
      setContacts(updated);
      setNewContactName('');
      setNewContactEmail('');
      setNewContactPhone('');
      setNewContactRelation('');
      setIsModalOpen(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save contact.');
    }
  };

  const handleDeleteContact = async (id) => {
    const updated = contacts.filter((c) => c.id !== id);
    try {
      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
      setContacts(updated);
    } catch (e) {
      Alert.alert('Error', 'Failed to delete contact.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ padding: 20 }}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 24, color: theme.textDark }}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textDark }]}>System Settings</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Theme Selection Section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textDark }]}>App Color Theme</Text>
        <Text style={[styles.sectionSub, { color: theme.textMuted }]}>Choose visual style and appearance across the vault.</Text>

        <View style={styles.themesGrid}>
          {Object.keys(THEMES).map((key) => {
            const t = THEMES[key];
            const isSelected = themeKey === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeOptionCard,
                  { backgroundColor: t.cardSubtle, borderColor: isSelected ? t.primary : theme.border },
                  isSelected && styles.selectedThemeCard,
                ]}
                onPress={() => setTheme(key)}
                activeOpacity={0.8}
              >
                <View style={[styles.colorPreviewBubble, { backgroundColor: t.previewColor }]} />
                <Text style={[styles.themeOptionName, { color: isSelected ? t.primary : theme.textDark }]}>
                  {t.name}
                </Text>
                {isSelected && <Text style={[styles.checkmarkText, { color: t.primary }]}>✓ Active</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Secret Calculator Triggers Section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textDark }]}>Secret Calculator Codes</Text>
        <Text style={[styles.sectionSub, { color: theme.textMuted }]}>Change the covert numbers entered before "=" on the calculator.</Text>

        <Text style={[styles.label, { color: theme.textMuted }]}>Emergency Trigger PIN (Starts background capture)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardSubtle, borderColor: theme.border, color: theme.textDark }]}
          placeholder="e.g. 9110"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={sosPin}
          onChangeText={setSosPin}
          maxLength={8}
        />
        <Text style={[styles.hint, { color: theme.primary }]}>Triggered by typing: {sosPin || '....'}=</Text>

        <Text style={[styles.label, { color: theme.textMuted, marginTop: 12 }]}>Console Unlock PIN (Opens full app)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardSubtle, borderColor: theme.border, color: theme.textDark }]}
          placeholder="e.g. 1337"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={unlockPin}
          onChangeText={setUnlockPin}
          maxLength={8}
        />
        <Text style={[styles.hint, { color: theme.primary }]}>Unlocked by typing: {unlockPin || '....'}=</Text>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={savePinCodes}>
          <Text style={styles.saveBtnText}>Update Secret PINs</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textDark }]}>User Profile & Identity</Text>
        <Text style={[styles.sectionSub, { color: theme.textMuted }]}>Appended automatically to cryptographic incident reports.</Text>

        <Text style={[styles.label, { color: theme.textMuted }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardSubtle, borderColor: theme.border, color: theme.textDark }]}
          placeholder="e.g. Alex Hunter"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: theme.textMuted }]}>Primary Phone Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardSubtle, borderColor: theme.border, color: theme.textDark }]}
          placeholder="e.g. +91 98765 43210"
          placeholderTextColor={theme.textMuted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Blood Group</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.cardSubtle, borderColor: theme.border, color: theme.textDark }]}
              placeholder="e.g. O+ve"
              placeholderTextColor={theme.textMuted}
              value={bloodGroup}
              onChangeText={setBloodGroup}
            />
          </View>
        </View>

        <Text style={[styles.label, { color: theme.textMuted }]}>Medical Notes / Allergies</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top', backgroundColor: theme.cardSubtle, borderColor: theme.border, color: theme.textDark }]}
          placeholder="e.g. Diabetic, Penicillin allergy"
          placeholderTextColor={theme.textMuted}
          multiline
          value={medicalNotes}
          onChangeText={setMedicalNotes}
        />

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={saveUserProfile}>
          <Text style={styles.saveBtnText}>Save Profile Details</Text>
        </TouchableOpacity>
      </View>

      {/* Trusted Contacts Section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={[styles.sectionTitle, { color: theme.textDark }]}>Trusted Contacts ({contacts.length})</Text>
          <TouchableOpacity style={[styles.addSmallBtn, { backgroundColor: theme.primarySoft }]} onPress={() => setIsModalOpen(true)}>
            <Text style={[styles.addSmallBtnText, { color: theme.primary }]}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.sectionSub, { color: theme.textMuted }]}>These contacts receive emergency coordinates and live tracking portal emails.</Text>

        {contacts.length === 0 ? (
          <View style={styles.emptyContacts}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>👥</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No emergency contacts added yet.</Text>
          </View>
        ) : (
          contacts.map((item) => (
            <View key={item.id} style={[styles.contactRow, { backgroundColor: theme.cardSubtle, borderColor: theme.border }]}>
              <View style={[styles.avatar, { backgroundColor: theme.border }]}>
                <Text style={{ fontSize: 16 }}>👤</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.contactName, { color: theme.textDark }]}>{item.name}</Text>
                <Text style={[styles.contactPhone, { color: theme.textMuted }]}>
                  {item.email || item.phone} • {item.relation}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteContact(item.id)} style={styles.deleteBtn}>
                <Text style={{ color: theme.emergency, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Add Contact Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textDark }]}>Add Emergency Contact</Text>

            <Text style={[styles.label, { color: theme.textMuted }]}>Contact Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.cardSubtle, borderColor: theme.border, color: theme.textDark }]}
              placeholder="e.g. Guardian / Control Desk"
              placeholderTextColor={theme.textMuted}
              value={newContactName}
              onChangeText={setNewContactName}
            />

            <Text style={[styles.label, { color: theme.textMuted }]}>Alert Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.cardSubtle, borderColor: theme.border, color: theme.textDark }]}
              placeholder="e.g. pandourcodes@gmail.com"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={newContactEmail}
              onChangeText={setNewContactEmail}
            />

            <Text style={[styles.label, { color: theme.textMuted }]}>Phone Number (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.cardSubtle, borderColor: theme.border, color: theme.textDark }]}
              placeholder="e.g. +91 99999 88888"
              placeholderTextColor={theme.textMuted}
              keyboardType="phone-pad"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
            />

            <Text style={[styles.label, { color: theme.textMuted }]}>Relation</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.cardSubtle, borderColor: theme.border, color: theme.textDark }]}
              placeholder="e.g. Sister, Parent, Attorney"
              placeholderTextColor={theme.textMuted}
              value={newContactRelation}
              onChangeText={setNewContactRelation}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.cardSubtle }]}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={{ color: theme.textDark, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleAddContact}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 35, marginBottom: 16 },
  backBtn: { width: 30, height: 30, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionSub: { fontSize: 11, marginTop: 2, marginBottom: 12 },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  themeOptionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  selectedThemeCard: {
    borderWidth: 2,
  },
  colorPreviewBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 8,
  },
  themeOptionName: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkmarkText: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  hint: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  addSmallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addSmallBtnText: { fontSize: 11, fontWeight: '700' },
  emptyContacts: { alignItems: 'center', paddingVertical: 18 },
  emptyText: { fontSize: 12 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: { fontSize: 13, fontWeight: '700' },
  contactPhone: { fontSize: 11, marginTop: 1 },
  deleteBtn: { padding: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 18,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  modalBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
});