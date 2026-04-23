import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Load service account from JSON file
const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-creds.json');

let serviceAccount: {
  project_id: string;
  client_email: string;
  private_key: string;
};

try {
  const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(fileContent);
} catch (e) {
  console.error('❌ Service account file not found. Run with valid credentials.');
  process.exit(1);
}

if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
  console.error('❌ Invalid service account file');
  process.exit(1);
}

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount as unknown as Parameters<typeof cert>[0]),
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_NAME || 'Admin';
  
  if (!email || !password) {
    console.error('❌ Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local');
    console.log('\nExample:');
    console.log('ADMIN_EMAIL=admin@example.com');
    console.log('ADMIN_PASSWORD=SecurePassword123!');
    console.log('ADMIN_NAME=Admin\n');
    process.exit(1);
  }

  try {
    let uid: string;
    try {
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });
      uid = userRecord.uid;
      console.log(`✅ Auth account created. UID: ${uid}`);
    } catch (e: any) {
      if (e.code === 'auth/email-already-exists') {
        const user = await adminAuth.getUserByEmail(email);
        uid = user.uid;
        console.log(`⚠️ Auth account already exists. UID: ${uid}`);
      } else {
        throw e;
      }
    }

    await adminDb.collection('users').doc(uid).set({
      uid,
      email,
      displayName,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`✅ Admin user document created in Firestore`);
    console.log(`\n🎉 Admin ready! Email: ${email}`);
    console.log(`\n⚠️ IMPORTANT: Remove ADMIN_EMAIL and ADMIN_PASSWORD from .env.local for security.`);
    
  } catch (e: any) {
    console.error(`❌ Error: ${e.message}`);
    process.exit(1);
  }
  
  process.exit(0);
}

createAdmin();