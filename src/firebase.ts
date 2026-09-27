import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyCX2LGzRdCSlzjfp1YVxN8NVk7yXv9U6oY",
  authDomain: "minarul-fashion-house.firebaseapp.com",
  projectId: "minarul-fashion-house",
  storageBucket: "minarul-fashion-house.firebasestorage.app",
  messagingSenderId: "722456007579",
  appId: "1:722456007579:web:729430ed144486efb0c73e",
  measurementId: "G-WNE2K8KHCJ"
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
