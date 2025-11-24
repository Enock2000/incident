
'use client';

import React, { useMemo, useState, useEffect } from "react";
import { useActionState } from "react";
import { useUser, useDoc, useDatabase, useMemoFirebase } from "@/firebase";
import { UserProfile } from "@/lib/types";
import { ref } from "firebase/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { UserProfileCard } from "@/components/auth/user-profile-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zambiaProvinces } from "@/lib/zambia-locations";
import { updateProfile } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState = {
  message: "",
  issues: [],
};

export default function MyProfilePage() {
    const { user: authUser, isUserLoading } = useUser();
    const database = useDatabase();
    const { toast } = useToast();

    const [state, formAction] = useActionState(updateProfile, initialState);

    const userRef = useMemoFirebase(
        () => (database && authUser ? ref(database, `users/${authUser.uid}`) : null),
        [database, authUser]
    );
    const { data: user, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

    const [province, setProvince] = useState(user?.province || '');
    const [district, setDistrict] = useState(user?.district || '');

    useEffect(() => {
        if (user) {
            setProvince(user.province || '');
            setDistrict(user.district || '');
        }
    }, [user]);
    
    useEffect(() => {
        if (state?.message) {
            if (state.issues && state.issues.length > 0) {
                 toast({
                    variant: "destructive",
                    title: "Error",
                    description: (
                    <ul className="list-disc list-inside mt-2">
                        {state.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                    </ul>
                    )
                });
            } else {
                 toast({
                    title: "Success",
                    description: state.message,
                });
            }
        }
    }, [state, toast]);

    const districtsForSelectedProvince = useMemo(() => {
        const selectedProvince = zambiaProvinces.find(p => p.name === province);
        return selectedProvince ? selectedProvince.districts : [];
    }, [province]);

    const handleProvinceChange = (value: string) => {
        setProvince(value);
        setDistrict(''); // Reset district when province changes
    };

    if (isUserLoading || isProfileLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-full items-center justify-center">
                <p>User profile not found.</p>
            </div>
        );
    }
    
    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                My Profile
            </h1>
            
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                   <UserProfileCard user={user} />
                </div>
                 <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Profile</CardTitle>
                            <CardDescription>Update your personal information here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <form action={formAction} className="space-y-4">
                                <input type="hidden" name="userId" value={user.id} />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" name="firstName" defaultValue={user.firstName} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" name="lastName" defaultValue={user.lastName} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <Input id="phoneNumber" name="phoneNumber" defaultValue={user.phoneNumber} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="occupation">Occupation</Label>
                                        <Input id="occupation" name="occupation" defaultValue={user.occupation} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="province">Province</Label>
                                        <Select name="province" required onValueChange={handleProvinceChange} value={province}>
                                            <SelectTrigger><SelectValue placeholder="Select province..." /></SelectTrigger>
                                            <SelectContent>
                                                {zambiaProvinces.map(p => (
                                                    <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="district">District</Label>
                                        <Select name="district" required disabled={!province} onValueChange={setDistrict} value={district}>
                                            <SelectTrigger><SelectValue placeholder="Select district..." /></SelectTrigger>
                                            <SelectContent>
                                                {districtsForSelectedProvince.map(d => (
                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full">Save Changes</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
