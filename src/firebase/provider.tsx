
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Database, ref } from 'firebase/database'; // Import Realtime Database type
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import { useDoc } from './database/use-doc';
import type { UserProfile } from '@/lib/types';


interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  database: Database; // Use Realtime Database type
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, database, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  database: Database | null; // Use Realtime Database type
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  database: Database; // Use Realtime Database type
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  database,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
    userProfile: null,
    isProfileLoading: true,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth) { // If no Auth service instance, cannot determine user state
      setUserAuthState(s => ({ ...s, user: null, isUserLoading: false, userError: new Error("Auth service not provided.") }));
      return;
    }

    setUserAuthState(s => ({ ...s, user: null, isUserLoading: true, userError: null })); // Reset on auth instance change

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => { // Auth state determined
        setUserAuthState(s => ({ ...s, user: firebaseUser, isUserLoading: false, userError: null }));
      },
      (error) => { // Auth listener error
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState(s => ({ ...s, user: null, isUserLoading: false, userError: error }));
      }
    );
    return () => unsubscribe(); // Cleanup
  }, [auth]); // Depends on the auth instance

   const userProfileRef = useMemo(() => 
    (database && userAuthState.user) ? ref(database, `users/${userAuthState.user.uid}`) : null,
   [database, userAuthState.user]);
   
   const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

   useEffect(() => {
        setUserAuthState(s => ({...s, userProfile, isProfileLoading }));
   }, [userProfile, isProfileLoading])

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && database && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      database: servicesAvailable ? database : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
      userProfile: userAuthState.userProfile,
      isProfileLoading: userAuthState.isProfileLoading,
    };
  }, [firebaseApp, database, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.database || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    database: context.database,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    userProfile: context.userProfile,
    isProfileLoading: context.isProfileLoading,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Realtime Database instance. */
export const useDatabase = (): Database => {
  const { database } = useFirebase();
  return database;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }

  return {
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    userProfile: context.userProfile,
    isProfileLoading: context.isProfileLoading,
  };
};
