// App.js
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CalculatorScreen from './src/screens/CalculatorScreen';
import HomeScreen from './src/screens/HomeScreen';
import ActiveIncidentScreen from './src/screens/ActiveIncidentScreen';
import TimelineScreen from './src/screens/TimelineScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import EvidenceDetailScreen from './src/screens/EvidenceDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{ tabBarIcon: () => <Text>📈</Text> }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarIcon: () => <Text>⏱️</Text> }}
      />
      <Tab.Screen
        name="EvidenceDetail"
        component={EvidenceDetailScreen}
        options={{ tabBarLabel: 'Evidence', tabBarIcon: () => <Text>📄</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Calculator">
          <Stack.Screen name="Calculator" component={CalculatorScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ActiveIncident" component={ActiveIncidentScreen} />
          <Stack.Screen name="Timeline" component={TimelineScreen} />
          <Stack.Screen name="EvidenceDetail" component={EvidenceDetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}