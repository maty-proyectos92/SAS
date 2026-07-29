import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: firebaseConfigJson?.apiKey || metaEnv.VITE_FIREBASE_API_KEY || "",
  authDomain: firebaseConfigJson?.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: firebaseConfigJson?.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: firebaseConfigJson?.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: firebaseConfigJson?.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: firebaseConfigJson?.appId || metaEnv.VITE_FIREBASE_APP_ID || ""
};

const databaseId = firebaseConfigJson?.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? firebaseConfigJson.firestoreDatabaseId
  : undefined;

const hasFirebaseKeys = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = hasFirebaseKeys 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

export const auth = app ? getAuth(app) : null;

export const db = app 
  ? (databaseId 
      ? getFirestore(app, databaseId) 
      : getFirestore(app))
  : null;

export const isFirebaseConfigured = hasFirebaseKeys && Boolean(db);

