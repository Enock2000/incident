
'use server';

import { getApps, initializeApp, type App } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// This file is intended to be run on the server only.

let app: App;

// Initialize the Firebase Admin SDK only once.
if (!getApps().length) {
  // IMPORTANT: In a production environment, you would use service account credentials.
  // For this development setup, we rely on the environment being automatically
  // configured by Google Cloud or Firebase Hosting.
  // We also must include the databaseURL from the client config.
  app = initializeApp({
    databaseURL: "https://studio-9903628032-db490-default-rtdb.firebaseio.com",
  });
} else {
  // If the app is already initialized, get the existing instance.
  app = getApps()[0];
}

// Export a function to get the initialized database instance
export const getAdminDB = () => getDatabase(app);
