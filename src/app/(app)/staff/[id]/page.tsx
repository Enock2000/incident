'use client';

import React from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Building, Shield, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import { useDoc } from "@/firebase/database/use-doc";
import { ref } from "firebase/database";
import { useDatabase, useMemoFirebase } from "@/firebase";
import { UserProfile } from "@/lib/types";
import { UserProfileCard } from "@/components/auth/user-profile-card";

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);
  const database = useDatabase();

  const userRef = useMemoFirebase(
    () => (database ? ref(database, `users/${id}`) : null),
    [database, id]
  );
  const { data: user, isLoading } = useDoc<UserProfile>(userRef);

   if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    notFound();
  }
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center space-x-4 mb-6">
         <Link href="/staff">
           <Button variant="outline" size="icon" className="h-8 w-8">
             <ArrowLeft className="h-4 w-4" />
             <span className="sr-only">Back to Staff</span>
           </Button>
         </Link>
         <h1 className="text-3xl font-bold tracking-tight font-headline">
           User Profile
         </h1>
       </div>
       <div className="max-w-4xl mx-auto">
        <UserProfileCard user={user} />
       </div>
    </div>
  );
}
