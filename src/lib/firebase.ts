import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== 'undefined') {
  // Only initialize Firebase on the CLIENT (browser)
  const isConfigValid = 
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== 'undefined' && 
    firebaseConfig.apiKey.length > 10;

  if (!isConfigValid) {
    console.error('❌ Firebase Configuration Error: NEXT_PUBLIC_FIREBASE_API_KEY is missing or invalid.');
    console.warn('If you are seeing this on Hostinger, you MUST add the environment variables in your Hostinger Dashboard -> Advanced -> Environment Variables AND trigger a new build.');
  } else {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (error) {
      console.error('❌ Firebase Initialization Error:', error);
    }
  }
}

export { app, auth, db };
export default app;
