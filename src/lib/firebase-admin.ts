// src/lib/firebase-admin.ts
'use server';

import { getApps, initializeApp, type App } from 'firebase-admin/app';
import { getDatabase, type Database } from 'firebase-admin/database';

let app: App;

if (!getApps().length) {
  app = initializeApp({
    databaseURL: 'https://studio-9903628032-db490-default-rtdb.firebaseio.com',
  });
} else {
  app = getApps()[0];
}

// export the instance, not a function
export const db: Database = getDatabase(app);
