import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const metaEnv = (import.meta as any).env || {};

// Read config from environment or default placeholder
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_API_KEY : "") || "",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_AUTH_DOMAIN : "") || "",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_PROJECT_ID : "") || "",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_STORAGE_BUCKET : "") || "",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID : "") || "",
  appId: metaEnv.VITE_FIREBASE_APP_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_APP_ID : "") || ""
};

const hasFirebaseKeys = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = hasFirebaseKeys 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const isFirebaseConfigured = hasFirebaseKeys;
