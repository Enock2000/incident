
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/lib/types";
import { format } from "date-fns";
import { Mail, Phone, MapPin, Building, Briefcase, Calendar, User } from "lucide-react";

interface UserProfileCardProps {
    user: UserProfile;
}

export function UserProfileCard({ user }: UserProfileCardProps) {

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName || !lastName) return 'U';
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPP');
        } catch (e) {
            return dateString; // Fallback to raw string if date is invalid
        }
    }
    
    const calculateAge = (dateString?: string): number | null => {
        if (!dateString) return null;
        const birthDate = new Date(dateString);
        if (isNaN(birthDate.getTime())) return null;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(user.dateOfBirth);

    return (
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
                                <span>{formatDate(user.dateOfBirth)} {age !== null ? `(Age: ${age})` : ''}</span>
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
    );
}
