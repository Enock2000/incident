
'use client';

import { useState, useEffect } from 'react';
import {
  DatabaseReference,
  onValue,
  off,
  DataSnapshot,
} from 'firebase/database';
import { errorEmitter } from '@/firebase/error-emitter';
import { DatabasePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Realtime Database location in real-time.
 * Handles nullable references.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedDbRef or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DatabaseReference | null | undefined} dbRef -
 * The Realtime Database Reference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDbRef: DatabaseReference | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memoizedDbRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const listener = onValue(
      memoizedDbRef,
      (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.val() as T), id: snapshot.key! });
        } else {
          // The document does not exist
          setData(null);
        }
        setError(null);
        setIsLoading(false); // Set loading to false only after we have a result
      },
      (error: Error) => {
        const contextualError = new DatabasePermissionError({
          operation: 'get',
          path: memoizedDbRef.toString(),
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false); // Also set loading false on error

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => off(memoizedDbRef, 'value', listener);
  }, [memoizedDbRef]);

  return { data, isLoading, error };
}

    