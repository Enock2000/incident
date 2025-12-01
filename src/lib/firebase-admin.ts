import admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

let isInitialized = false;
let initializationError: string | null = null;

if (!admin.apps.length) {
  try {
    let credential;
    let credentialSource = 'unknown';

    // Try to load service account from file (for development)
    try {
      const serviceAccount = require('@/lib/serviceAccountKey.json');
      credential = admin.credential.cert(serviceAccount);
      credentialSource = 'local file';
      console.log('✅ Firebase Admin: Using service account from file');
    } catch (fileError) {
      // If file doesn't exist, try environment variables
      if (process.env.TYPE && process.env.PROJECT_ID && process.env.PRIVATE_KEY) {
        try {
          const serviceAccount = {
            type: process.env.TYPE,
            project_id: process.env.PROJECT_ID,
            private_key_id: process.env.PRIVATE_KEY_ID,
            // CRITICAL: Replace literal \n with actual newlines
            private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.CLIENT_EMAIL,
            client_id: process.env.CLIENT_ID,
            auth_uri: process.env.AUTH_URI,
            token_uri: process.env.TOKEN_URI,
            auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
            universe_domain: process.env.UNIVERSE_DOMAIN
          };

          credential = admin.credential.cert(serviceAccount as admin.ServiceAccount);
          credentialSource = 'environment variables';
          console.log('✅ Firebase Admin: Using service account from environment variables');
        } catch (parseError) {
          console.error('❌ Failed to parse environment variables:', parseError);
          initializationError = 'Invalid Firebase Admin environment variables';
          throw new Error('Invalid Firebase Admin environment variables');
        }
      } else {
        // No credentials available
        console.error('❌ Firebase Admin: No credentials found!');
        console.error('Please set environment variables or add serviceAccountKey.json');
        initializationError = 'Missing Firebase Admin credentials. Please configure environment variables.';
        throw new Error('Missing Firebase Admin credentials');
      }
    }

    admin.initializeApp({
      credential,
      databaseURL: firebaseConfig.databaseURL,
    });

    isInitialized = true;
    console.log(`✅ Firebase Admin initialized successfully (source: ${credentialSource})`);
  } catch (error: any) {
    if (!/already exists/u.test(error.message)) {
      console.error('❌ Firebase admin initialization error:', error.message);
      console.error('Stack:', error.stack);

      if (!initializationError) {
        initializationError = error.message;
      }
    }
  }
}

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
