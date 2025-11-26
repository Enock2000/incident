'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onValue,
  off,
  DataSnapshot,
} from 'firebase/database';
import { errorEmitter } from '@/firebase/error-emitter';
import { DatabasePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: Error | null; // Error object, or null.
}


/**
 * React hook to subscribe to a Realtime Database location or query in real-time.
 * Handles nullable references/queries.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedDbRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *  
 * @template T Optional type for document data. Defaults to any.
 * @param {Query | null | undefined} memoizedDbRefOrQuery -
 * The Realtime Database Reference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedDbRefOrQuery: (Query & {__memo?: boolean})  | null | undefined,
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
        console.error("Firebase useCollection Error:", error);
        const contextualError = new DatabasePermissionError({
          operation: 'list',
          path: memoizedDbRefOrQuery.toString(),
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // This prevents the error from propagating further and crashing the app
        // by emitting it to a dedicated listener.
        errorEmitter.emit('permission-error', contextualError);
        return; // Explicitly return to stop execution
      }
    );

    return () => off(memoizedDbRefOrQuery, 'value', listener);
  }, [memoizedDbRefOrQuery]);
  
  if(memoizedDbRefOrQuery && !(memoizedDbRefOrQuery as any).__memo) {
    console.warn('useCollection query was not properly memoized using useMemoFirebase. This may cause infinite loops.');
  }

  return { data, isLoading, error };
}
