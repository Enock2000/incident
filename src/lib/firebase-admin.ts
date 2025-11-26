import admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: firebaseConfig.databaseURL,
  });
}

export const db = admin.database();
