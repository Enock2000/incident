
'use client';

import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, User, Mail, Phone, MapPin, Building, Shield, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import { useDoc } from "@/firebase/database/use-doc";
import { ref } from "firebase/database";
import { useDatabase, useMemoFirebase } from "@/firebase";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function UserProfilePage({ params: { id } }: { params: { id: string } }) {
  const database = useDatabase();

  const userRef = useMemoFirebase(
    () => (database ? ref(database, `users/${id}`) : null),
    [database, id]
  );
  const { data: user, isLoading } = useDoc<UserProfile>(userRef);
  
  const getInitials = (firstName?: string, lastName?: string) => {
      if (!firstName || !lastName) return 'U';
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

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
  
  const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      return format(new Date(dateString), 'PPP');
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

        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                       <Avatar className="h-24 w-24 mb-4">
                           <AvatarImage src={user.photoURL} />
                           <AvatarFallback className="text-3xl">
                               {getInitials(user.firstName, user.lastName)}
                           </AvatarFallback>
                       </Avatar>
                       <h2 className="text-2xl font-bold font-headline">{user.firstName} {user.lastName}</h2>
                       <p className="text-muted-foreground">{user.occupation || 'Occupation not set'}</p>
                       <Badge className="mt-4" variant={user.userType === 'admin' ? 'destructive' : 'secondary'}>{user.userType}</Badge>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact & Personal Information</CardTitle>
                        <CardDescription>All personal and contact details for this user.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center gap-4 text-sm">
                           <Mail className="h-5 w-5 text-muted-foreground" />
                           <div className="flex flex-col">
                                <span className="text-muted-foreground">Email</span>
                                <span>{user.email}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                           <Phone className="h-5 w-5 text-muted-foreground" />
                           <div className="flex flex-col">
                                <span className="text-muted-foreground">Phone Number</span>
                                <span>{user.phoneNumber || 'N/A'}</span>
                           </div>
                        </div>
                         <div className="flex items-center gap-4 text-sm">
                           <User className="h-5 w-5 text-muted-foreground" />
                           <div className="flex flex-col">
                                <span className="text-muted-foreground">NRC Number</span>
                                <span>{user.nrc || 'N/A'}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                           <Calendar className="h-5 w-5 text-muted-foreground" />
                           <div className="flex flex-col">
                                <span className="text-muted-foreground">Date of Birth</span>
                                <span>{formatDate(user.dateOfBirth)}</span>
                           </div>
                        </div>
                         <div className="flex items-center gap-4 text-sm">
                           <MapPin className="h-5 w-5 text-muted-foreground" />
                           <div className="flex flex-col">
                                <span className="text-muted-foreground">Location</span>
                                <span>{user.district}, {user.province}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                           <Building className="h-5 w-5 text-muted-foreground" />
                           <div className="flex flex-col">
                                <span className="text-muted-foreground">Department</span>
                                <span>{user.departmentId || 'Not Assigned'}</span>
                           </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
