
'use client';

import { useUser } from "@/firebase";
import { UserProfileCard } from "@/components/auth/user-profile-card";
import { Loader2 } from "lucide-react";
import { useDatabase, useDoc, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import type { UserProfile } from "@/lib/types";

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const database = useDatabase();

    const userProfileRef = useMemoFirebase(
        () => (database && user) ? ref(database, `users/${user.uid}`) : null,
        [database, user]
    );
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    if (isUserLoading || isProfileLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user || !userProfile) {
        return <div className="flex h-full items-center justify-center">User not found.</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                My Profile
            </h1>
            <UserProfileCard user={userProfile} />
        </div>
    );
}
