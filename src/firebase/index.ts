'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Validate Firebase config before initialization
function validateConfig() {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
  }
  return true;
}

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  try {
    validateConfig();

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return getSdks(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  try {
    const auth = getAuth(firebaseApp);
    const database = getDatabase(firebaseApp, firebaseConfig.databaseURL);

    return {
      firebaseApp,
      auth,
      database
    };
  } catch (error) {
    console.error('Firebase SDK initialization error:', error);
    throw error;
  }
}

export * from './provider';
export * from './client-provider';
export * from './database/use-collection';
export * from './database/use-doc';
export * from './errors';
export * from './error-emitter';
