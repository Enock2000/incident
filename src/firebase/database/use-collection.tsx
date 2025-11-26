'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onValue,
  off,
  DataSnapshot,
} from 'firebase/database'; // ← CLIENT SDK, not admin
import { errorEmitter } from '@/firebase/error-emitter';
import { DatabasePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCollection<T = any>(
  memoizedDbRefOrQuery: (Query & { __memo?: boolean }) | null | undefined
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memoizedDbRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const listener = onValue(
      memoizedDbRefOrQuery,
      (snapshot: DataSnapshot) => {
        const results: ResultItemType[] = [];
        snapshot.forEach((childSnapshot) => {
          results.push({ ...(childSnapshot.val() as T), id: childSnapshot.key! });
        });
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: Error) => {
        console.error('Firebase useCollection Error:', error);
        const contextualError = new DatabasePermissionError({
          operation: 'list',
          path: memoizedDbRefOrQuery.toString(),
        });
        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => off(memoizedDbRefOrQuery, 'value', listener);
  }, [memoizedDbRefOrQuery]);

  if (memoizedDbRefOrQuery && !(memoizedDbRefOrQuery as any).__memo) {
    console.warn(
      'useCollection query was not properly memoized using useMemoFirebase. This may cause infinite loops.'
    );
  }

  return { data, isLoading, error };
}