'use client';

import { useUser } from "@/firebase";
import { UserProfileCard } from "@/components/auth/user-profile-card";
import { Loader2 } from "lucide-react";
import { useDatabase, useDoc, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import type { UserProfile } from "@/lib/types";

interface ProfilePageWithIdProps {
    params: { id: string };
}

interface ProfilePageProps {
    id: string | undefined;
}

function ProfilePageClient({ id }: ProfilePageProps) {
    const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
    const database = useDatabase();
    
    // If an ID is provided in the URL, view that user's profile.
    // Otherwise, fall back to the authenticated user's profile.
    const userIdToFetch = id || authUser?.uid;

    const userProfileRef = useMemoFirebase(
        () => (database && userIdToFetch) ? ref(database, `users/${userIdToFetch}`) : null,
        [database, userIdToFetch]
    );
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
    
    const isLoading = isAuthUserLoading || isProfileLoading;

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!userProfile) {
        return <div className="flex h-full items-center justify-center">User not found.</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                User Profile
            </h1>
            <UserProfileCard user={userProfile} />
        </div>
    );
}


export default function ProfilePageWithId({ params }: ProfilePageWithIdProps) {
    const { id } = params;
    return <ProfilePageClient id={id} />;
}
