import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let adminApp: ReturnType<typeof initializeApp> | null = null;
let adminAuth: ReturnType<typeof getAuth> | null = null;
let adminDb: ReturnType<typeof getFirestore> | null = null;

function initAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin not configured. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env.local');
  }
  
  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  
  return adminApp;
}

export function getAdminAuth() {
  if (!adminAuth) {
    initAdminApp();
    adminAuth = getAuth();
  }
  return adminAuth;
}

export function getAdminDb() {
  if (!adminDb) {
    initAdminApp();
    adminDb = getFirestore();
  }
  return adminDb;
}

export const serverTimestamp = FieldValue.serverTimestamp;