
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
  
  const services = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(services.auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [services.auth]);

  const userProfileRef = useMemo(() => 
    (services.database && user) ? ref(services.database, `users/${user.uid}`) : null,
    [services.database, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

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
