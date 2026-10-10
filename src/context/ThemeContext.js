// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@safechain_app_theme';

export const THEMES = {
  classic: {
    id: 'classic',
    name: 'Classic Azure',
    previewColor: '#2563EB',
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardSubtle: '#F1F5F9',
    primary: '#2563EB',
    primarySoft: '#DBEAFE',
    emergency: '#EF4444',
    emergencySoft: '#FEE2E2',
    success: '#16A34A',
    successSoft: '#DCFCE7',
    textDark: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    isDark: false,
  },
  warm: {
    id: 'warm',
    name: 'Warm Sand',
    previewColor: '#EA580C',
    background: '#FAF8F5',
    card: '#FFFFFF',
    cardSubtle: '#F5EFE6',
    primary: '#EA580C',
    primarySoft: '#FFEDD5',
    emergency: '#E11D48',
    emergencySoft: '#FFE4E6',
    success: '#15803D',
    successSoft: '#DCFCE7',
    textDark: '#292524',
    textMuted: '#78716C',
    border: '#E7E5E4',
    isDark: false,
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Vault',
    previewColor: '#059669',
    background: '#F4FBF7',
    card: '#FFFFFF',
    cardSubtle: '#E6F4EA',
    primary: '#059669',
    primarySoft: '#D1FAE5',
    emergency: '#DC2626',
    emergencySoft: '#FEE2E2',
    success: '#059669',
    successSoft: '#D1FAE5',
    textDark: '#064E3B',
    textMuted: '#4B7B6A',
    border: '#D1E7DD',
    isDark: false,
  },
  stealth: {
    id: 'stealth',
    name: 'Obsidian Stealth',
    previewColor: '#38BDF8',
    background: '#0B0F17',
    card: '#161E2E',
    cardSubtle: '#1F293D',
    primary: '#38BDF8',
    primarySoft: '#075985',
    emergency: '#F87171',
    emergencySoft: '#7F1D1D',
    success: '#34D399',
    successSoft: '#064E3B',
    textDark: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#283548',
    isDark: true,
  },
};

const ThemeContext = createContext({
  theme: THEMES.classic,
  themeKey: 'classic',
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState('classic');

  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && THEMES[saved]) {
          setThemeKey(saved);
        }
      } catch (e) {
        console.warn('Failed to load theme:', e);
      }
    }
    loadSavedTheme();
  }, []);

  const changeTheme = async (key) => {
    if (THEMES[key]) {
      setThemeKey(key);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, key);
      } catch (e) {
        console.warn('Failed to save theme:', e);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeKey], themeKey, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}