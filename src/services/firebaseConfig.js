// src/services/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1-6tsu7YEXKw6AntvA7aphhkFlNQNOvE",
  authDomain: "safechain-29eeb.firebaseapp.com",
  projectId: "safechain-29eeb",
  storageBucket: "safechain-29eeb.firebasestorage.app",
  messagingSenderId: "776628980194",
  appId: "1:776628980194:web:a026bb389ed14d76ce11bb"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export const DASHBOARD_BASE_URL = "https://safechain-portal.vercel.app";