
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// This function should only be called on the server.
export function initializeServerFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // In a server environment, you might use service account credentials
      // For simplicity here, we'll use the public config, but a service account is better for server-side admin tasks
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Server-side Firebase initialization failed:", e);
      // Fallback or error handling
      throw new Error("Could not initialize Firebase on the server.");
    }
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    database: getDatabase(firebaseApp)
  };
}
