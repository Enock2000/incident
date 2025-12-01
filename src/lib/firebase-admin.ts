import admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

let isInitialized = false;
let initializationError: string | null = null;

if (!admin.apps.length) {
  try {
    let credential;
    let credentialSource = 'unknown';

    // Try to load service account from file (for development)
    try {
      const serviceAccount = require('@/lib/serviceAccountKey.json');
      credential = admin.credential.cert(serviceAccount);
      credentialSource = 'local file';
      console.log('✅ Firebase Admin: Using service account from file');
    } catch (fileError) {
      // If file doesn't exist, try environment variable
      const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

      if (serviceAccountEnv) {
        try {
          const serviceAccount = JSON.parse(serviceAccountEnv);
          credential = admin.credential.cert(serviceAccount);
          credentialSource = 'environment variable';
          console.log('✅ Firebase Admin: Using service account from environment variable');
        } catch (parseError) {
          console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', parseError);
          initializationError = 'Invalid FIREBASE_SERVICE_ACCOUNT format';
          throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
        }
      } else {
        // No credentials available
        console.error('❌ Firebase Admin: No credentials found!');
        console.error('Please set FIREBASE_SERVICE_ACCOUNT environment variable or add serviceAccountKey.json');
        initializationError = 'Missing Firebase Admin credentials. Please configure FIREBASE_SERVICE_ACCOUNT environment variable.';
        throw new Error('Missing Firebase Admin credentials');
      }
    }

    admin.initializeApp({
      credential,
      databaseURL: firebaseConfig.databaseURL,
    });

    isInitialized = true;
    console.log(`✅ Firebase Admin initialized successfully (source: ${credentialSource})`);
  } catch (error: any) {
    if (!/already exists/u.test(error.message)) {
      console.error('❌ Firebase admin initialization error:', error.message);
      console.error('Stack:', error.stack);

      if (!initializationError) {
        initializationError = error.message;
      }
    }
  }
}

// Helper to check if Firebase Admin is ready
export function isFirebaseAdminReady(): boolean {
  return isInitialized && admin.apps.length > 0;
}

// Helper to get initialization error
export function getFirebaseAdminError(): string | null {
  return initializationError;
}

export default admin;
export const db = admin.database();
