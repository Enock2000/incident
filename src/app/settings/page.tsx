
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useDoc, useDatabase, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import type { UserProfile } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zambiaProvinces } from "@/lib/zambia-locations";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const database = useDatabase();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
      () => (database && user) ? ref(database, `users/${user.uid}`) : null,
      [database, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [initialState, setInitialState] = useState({ message: "", issues: [] });
  const [state, formAction] = useActionState(updateProfile, initialState);

  const [province, setProvince] = useState(userProfile?.province || '');
  const [district, setDistrict] = useState(userProfile?.district || '');

  const districtsForSelectedProvince = useMemo(() => {
    const selectedProvince = zambiaProvinces.find(p => p.name === province);
    return selectedProvince ? selectedProvince.districts : [];
  }, [province]);

  useEffect(() => {
    if (userProfile) {
        setProvince(userProfile.province || '');
        setDistrict(userProfile.district || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (state.message) {
      if (state.message.includes('success')) {
        toast({ title: 'Success', description: state.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      }
    }
  }, [state, toast]);

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setDistrict('');
  };

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Settings
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : userProfile ? (
            <form action={formAction} className="space-y-6">
              <input type="hidden" name="userId" value={userProfile.id} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" defaultValue={userProfile.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" defaultValue={userProfile.lastName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" name="phoneNumber" defaultValue={userProfile.phoneNumber} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input id="occupation" name="occupation" defaultValue={userProfile.occupation} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                     <Select name="province" value={province} onValueChange={handleProvinceChange}>
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
                    <Select name="district" value={district} onValueChange={setDistrict} disabled={!province}>
                        <SelectTrigger><SelectValue placeholder="Select district..." /></SelectTrigger>
                        <SelectContent>
                            {districtsForSelectedProvince.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <SubmitButton>Save Changes</SubmitButton>
              </div>
            </form>
          ) : (
             <p>Could not load user profile.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
