import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCX2LGzRdCSlzjfp1YVxN8NVk7yXv9U6oY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "minarul-fashion-house.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "minarul-fashion-house",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "minarul-fashion-house.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "722456007579",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:722456007579:web:729430ed144486efb0c73e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WNE2K8KHCJ"
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
