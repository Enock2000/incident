
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';

// Ensure this is only run on the server
let app: App;
if (typeof window === 'undefined') {
  if (!getApps().length) {
    app = initializeApp({
        databaseURL: firebaseConfig.databaseURL,
        // When running in a Google Cloud environment, credentials are often inferred.
        // If not, you'd need to provide service account credentials here.
    });
  } else {
    app = getApp();
  }
}

export function initializeAdminApp() {
    if (typeof window !== 'undefined') {
        throw new Error('Firebase Admin SDK can only be used on the server.');
    }
    return app;
}
