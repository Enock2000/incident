
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // Import Realtime Database

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    // Automatically sign in user anonymously
    const auth = getAuth(firebaseApp);
    signInAnonymously(auth).catch((error) => {
      console.error("Anonymous sign-in failed:", error);
    });

    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    database: getDatabase(firebaseApp) // Get Realtime Database instance
  };
}

export * from './provider';
export * from './client-provider';
export * from './database/use-collection';
export * from './database/use-doc';
export * from './errors';
export * from './error-emitter';
