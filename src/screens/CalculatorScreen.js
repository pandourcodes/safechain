// src/screens/CalculatorScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { COLORS } from '../constants';
import { evidenceEngine } from '../services/EvidenceEngine';

const PIN_CODES_KEY = '@safechain_pin_codes';

export default function CalculatorScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [display, setDisplay] = useState('0');
  const [buffer, setBuffer] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // Dynamic PINs (Defaults: 9110 and 1337)
  const [sosPin, setSosPin] = useState('9110');
  const [unlockPin, setUnlockPin] = useState('1337');
  const [acknowledged, setAcknowledged] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Reload stored PINs whenever screen comes into focus
  useEffect(() => {
    async function loadPins() {
      try {
        const saved = await AsyncStorage.getItem(PIN_CODES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.sosPin) setSosPin(parsed.sosPin);
          if (parsed.unlockPin) setUnlockPin(parsed.unlockPin);
        }
      } catch (e) {
        console.warn('Failed to load PIN codes:', e);
      }
    }
    if (isFocused) {
      loadPins();
    }
  }, [isFocused]);

  // Reflect dashboard acknowledgement: turns the = button green once a
  // trusted contact has opened the incident link and tapped Acknowledge.
  useEffect(() => {
    const unsubscribe = evidenceEngine.subscribe(({ incident }) => {
      setAcknowledged(!!incident?.acknowledged);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function initPerms() {
      if (!permission || !permission.granted) {
        await requestPermission();
      }
      try {
        await requestRecordingPermissionsAsync();
      } catch (e) {
        console.warn('Microphone permission error:', e);
      }
    }
    initPerms();
  }, [permission]);

  useEffect(() => {
    if (cameraRef.current) {
      evidenceEngine.bindCamera(cameraRef.current);
    }
  }, [cameraRef.current]);

  useEffect(() => {
    if (audioRecorder) {
      evidenceEngine.bindAudioExecutor(async (durationMs = 4000) => {
        try {
          if (audioRecorder.isRecording) {
            await audioRecorder.stop();
          }
          await audioRecorder.prepareToRecordAsync();
          audioRecorder.record();

          await new Promise(res => setTimeout(res, durationMs));

          if (audioRecorder.isRecording) {
            await audioRecorder.stop();
          }
          return audioRecorder.uri;
        } catch (err) {
          console.warn('Audio capture warning:', err);
          return null;
        }
      });
    }
  }, [audioRecorder]);

  const handlePress = async (val) => {
    if (val === 'C') {
      setDisplay('0');
      setBuffer('');
      return;
    }

    if (val === '=') {
      // Dynamic Emergency Trigger
      if (buffer === sosPin) {
        await evidenceEngine.startIncident();
        Vibration.vibrate(25);
        setDisplay('0');
        setBuffer('');
        return;
      }

      // Dynamic Console Unlock
      if (buffer === unlockPin) {
        setDisplay('0');
        setBuffer('');
        navigation.navigate('MainTabs');
        return;
      }

      try {
        const sanitized = buffer.replace(/×/g, '*').replace(/÷/g, '/');
        const result = eval(sanitized);
        setDisplay(String(result));
      } catch {
        setDisplay('Error');
      }
      setBuffer('');
      return;
    }

    setBuffer(prev => prev + val);
    setDisplay(prev => (prev === '0' ? val : prev + val));
  };

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <View style={styles.container}>
      {/* Front-facing discreet camera */}
      {permission?.granted && (
        <View pointerEvents="none" style={styles.hiddenCameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.hiddenCamera}
            facing="front"
            autofocus="on"
            mute={true}
            enableTorch={false}
          />
        </View>
      )}

      <View style={styles.displayArea}>
        <Text style={styles.secretHint}>Disguised System Operational</Text>
        <Text style={styles.displayText} numberOfLines={1}>{display}</Text>
      </View>

      <View style={styles.pad}>
        {buttons.map((row, rIdx) => (
          <View key={rIdx} style={styles.row}>
            {row.map(btn => (
              <TouchableOpacity
                key={btn}
                style={[
                  styles.btn,
                  btn === '0' && styles.zeroBtn,
                  btn === '='
                    ? (acknowledged ? styles.equalsAcknowledged : styles.equalsBtn)
                    : (['÷', '×', '-', '+'].includes(btn) ? styles.opBtn : styles.numBtn)
                ]}
                onPress={() => handlePress(btn)}
                activeOpacity={0.7}
              >
                <Text style={[styles.btnText, btn === '=' && styles.equalsText]}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'flex-end', paddingBottom: 30 },
  hiddenCameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    opacity: 0.01,
    overflow: 'hidden',
    zIndex: -999,
  },
  hiddenCamera: { width: 80, height: 80 },
  displayArea: { paddingHorizontal: 24, paddingBottom: 20, alignItems: 'flex-end' },
  secretHint: { fontSize: 11, color: '#CBD5E1', marginBottom: 8 },
  displayText: { fontSize: 60, fontWeight: '300', color: COLORS.textDark },
  pad: { paddingHorizontal: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  btn: { flex: 1, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  zeroBtn: { flex: 2.15, alignItems: 'flex-start', paddingLeft: 30 },
  numBtn: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  opBtn: { backgroundColor: '#E2E8F0' },
  equalsBtn: { backgroundColor: COLORS.primary },
  equalsAcknowledged: { backgroundColor: '#16A34A' },
  btnText: { fontSize: 26, fontWeight: '500', color: COLORS.textDark },
  equalsText: { color: '#FFFFFF', fontWeight: 'bold' }
});