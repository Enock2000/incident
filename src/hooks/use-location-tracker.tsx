
'use client';

import { useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase'; 
// import { toast } from "@/hooks/use-toast"; // Example for notifications

export function useLocationTracker() {
    const firestore = useFirestore();
    const { user } = useUser();
    
    // Refs are used to store data that doesn't trigger a re-render when changed
    const watchIdRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);

    useEffect(() => {
        // 1. Guard clauses: Stop if no user, no firestore, or no browser support
        if (!user || !firestore || !navigator.geolocation) return;

        // 2. The function to run when location changes
        const handlePositionUpdate = async (position: GeolocationPosition) => {
            const now = Date.now();
            const TIME_THRESHOLD = 10000; // 10 seconds in milliseconds

            // THROTTLE: Only update Firestore if 10 seconds have passed since last update
            if (now - lastUpdateRef.current < TIME_THRESHOLD) {
                return;
            }

            const { latitude, longitude, accuracy, heading, speed } = position.coords;

            try {
                const userRef = doc(firestore, 'users', user.uid);

                // Use setDoc with merge:true to create or update the document.
                await setDoc(userRef, {
                    location: {
                        latitude,
                        longitude,
                    },
                    // Optional: Store extra metadata useful for real-time tracking
                    locationMetadata: {
                        accuracy, // in meters
                        heading,  // 0-360 degrees
                        speed,    // m/s
                        updatedAt: serverTimestamp(),
                    }
                }, { merge: true });

                // Update our ref so we know when the last successful write happened
                lastUpdateRef.current = now;
                console.log(`📍 Location updated: ${latitude}, ${longitude}`);

            } catch (error) {
                console.error("Error updating user location in Firestore:", error);
            }
        };

        // 3. The function to run on error
        const handleError = (error: GeolocationPositionError) => {
            console.warn(`Location Warning: ${error.message}`);
            if (error.code === error.PERMISSION_DENIED) {
                // Example of how you might use toast notifications
                // toast({
                //   variant: "destructive",
                //   title: "Location Access Denied",
                //   description: "Please enable location services to use location features.",
                // });
            }
        };

        // 4. Start Watching
        // enableHighAccuracy: true is CRITICAL for mobile devices to use GPS
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

        // 5. Cleanup: Stop watching when the user logs out or component unmounts
        return () => {
            if (watchIdRef.current !== null) {
                console.log("Stopping location tracking.");
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };

    }, [user, firestore]); // Re-run if user logs in/out
}
