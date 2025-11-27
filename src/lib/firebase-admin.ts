import admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: firebaseConfig.databaseURL,
    });
  } catch (error: any) {
    if (!/already exists/u.test(error.message)) {
      console.error('Firebase admin initialization error', error.stack);
    }
  }
}

export default admin;
export const db = admin.database();
