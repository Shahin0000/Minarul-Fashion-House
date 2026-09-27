import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDJM0HtIz8NFKwwIfvkvDdd5W6KLzIia1E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "minarul-fashion-house-f5101.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "minarul-fashion-house-f5101",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "minarul-fashion-house-f5101.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "139692947793",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:139692947793:web:d831aa94ec9cb5d68c3b70",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Verify Firebase Project ID per requirement 11
console.log("Firebase Project ID:", app.options.projectId);

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
