import admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

if (!admin.apps.length) {
  try {
    let credential;

    // Try to load service account from file (for development)
    try {
      const serviceAccount = require('@/lib/serviceAccountKey.json');
      credential = admin.credential.cert(serviceAccount);
      console.log('✅ Firebase Admin: Using service account from file');
    } catch (fileError) {
      // If file doesn't exist, try environment variable
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        credential = admin.credential.cert(serviceAccount);
        console.log('✅ Firebase Admin: Using service account from environment variable');
      } else {
        // Fall back to application default credentials
        credential = admin.credential.applicationDefault();
        console.log('⚠️  Firebase Admin: Using application default credentials');
      }
    }

    admin.initializeApp({
      credential,
      databaseURL: firebaseConfig.databaseURL,
    });

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error: any) {
    if (!/already exists/u.test(error.message)) {
      console.error('❌ Firebase admin initialization error:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

export default admin;
export const db = admin.database();
