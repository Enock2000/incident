'use client';

import React, { useMemo, useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useDoc } from './database/use-doc';
import { ref } from 'firebase/database';
import type { UserProfile } from '@/lib/types';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);

  const services = useMemo(() => {
    try {
      return initializeFirebase();
    } catch (err) {
      console.error('Failed to initialize Firebase:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!services?.auth) return;

    const unsubscribe = onAuthStateChanged(services.auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [services?.auth]);

  const userProfileRef = useMemo(() =>
    (services?.database && user) ? ref(services.database, `users/${user.uid}`) : null,
    [services?.database, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Firebase Initialization Error</h1>
          <p className="text-muted-foreground">Failed to connect to the database. Please refresh the page.</p>
          <pre className="text-xs text-left bg-muted p-4 rounded overflow-auto max-w-2xl">
            {error.message}
          </pre>
        </div>
      </div>
    );
  }

  if (!services) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      database={services.database}
      user={user}
      userProfile={userProfile}
    >
      {children}
    </FirebaseProvider>
  );
}
