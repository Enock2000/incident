import admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

let isInitialized = false;
let initializationError: string | null = null;

if (!admin.apps.length) {
  try {
    let credential;
    let credentialSource = 'unknown';

    // Try to load service account from file (for development)

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
