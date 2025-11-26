
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Database } from 'firebase/database';
import { Auth, User } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { UserProfile } from '@/lib/types';


interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp?: FirebaseApp;
  database?: Database;
  auth?: Auth;
  user?: User | null;
  userProfile?: UserProfile | null;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  database: Database | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  database,
  auth,
  user = null,
  userProfile = null,
}) => {

  const contextValue = useMemo((): FirebaseContextState => {
    return {
      firebaseApp: firebaseApp || null,
      database: database || null,
      auth: auth || null,
      user: user,
      isUserLoading: user === undefined,
      userProfile: userProfile,
      isProfileLoading: userProfile === undefined,
    };
  }, [firebaseApp, database, auth, user, userProfile]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


export const useAuth = (): Auth => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error('useAuth must be used within a FirebaseProvider.');
  if (!context.auth) throw new Error('Auth service not available.');
  return context.auth;
};

export const useDatabase = (): Database => {
  const context = useContext(FirebaseContext);
   if (context === undefined) throw new Error('useDatabase must be used within a FirebaseProvider.');
  if (!context.database) throw new Error('Database service not available.');
  return context.database;
};

export const useFirebaseApp = (): FirebaseApp => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error('useFirebaseApp must be used within a FirebaseProvider.');
  if (!context.firebaseApp) throw new Error('FirebaseApp not available.');
  return context.firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }
  return {
    user: context.user,
    isUserLoading: context.isUserLoading,
    userProfile: context.userProfile,
    isProfileLoading: context.isProfileLoading,
  };
};
