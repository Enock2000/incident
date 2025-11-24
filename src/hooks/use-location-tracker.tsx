
'use client';

import { useEffect, useRef } from 'react';
import { ref, update, serverTimestamp } from 'firebase/database';
import { useDatabase, useUser } from '@/firebase';

export function useLocationTracker() {
    const database = useDatabase();
    const { user } = useUser();
    
    const watchIdRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);

    useEffect(() => {
        if (!user || !database || !navigator.geolocation) return;

        const handlePositionUpdate = async (position: GeolocationPosition) => {
            const now = Date.now();
            const TIME_THRESHOLD = 10000; // 10 seconds

            if (now - lastUpdateRef.current < TIME_THRESHOLD) {
                return;
            }

            const { latitude, longitude, accuracy, heading, speed } = position.coords;

            try {
                const userRef = ref(database, `users/${user.uid}`);

                await update(userRef, {
                    location: {
                        latitude,
                        longitude,
                    },
                    locationMetadata: {
                        accuracy,
                        heading,
                        speed,
                        updatedAt: serverTimestamp(),
                    }
                });

                lastUpdateRef.current = now;
                console.log(`📍 Location updated: ${latitude}, ${longitude}`);

            } catch (error) {
                console.error("Error updating user location in Realtime Database:", error);
            }
        };

        const handleError = (error: GeolocationPositionError) => {
            console.warn(`Location Warning: ${error.message}`);
        };
        
        const options = {
            enableHighAccuracy: true, 
            timeout: 20000, 
            maximumAge: 0 
        };

        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePositionUpdate, 
            handleError, 
            options
        );

        console.log("Starting location tracking...");

        return () => {
            if (watchIdRef.current !== null) {
                console.log("Stopping location tracking.");
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };

    }, [user, database]);
}
