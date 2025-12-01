
"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zambiaProvinces } from "@/lib/zambia-locations";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useAuth, useDatabase } from "@/firebase";

export function SignupForm() {
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const database = useDatabase();

  const districtsForSelectedProvince = useMemo(() => {
    const selectedProvince = zambiaProvinces.find(p => p.name === province);
    return selectedProvince ? selectedProvince.districts : [];
  }, [province]);

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setDistrict(''); // Reset district when province changes
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const nrc = formData.get('nrc') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const occupation = formData.get('occupation') as string;

    if (!auth || !database) {
      setError('Firebase is not initialized. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Realtime Database
      await set(ref(database, `users/${user.uid}`), {
        id: user.uid,
        firstName,
        lastName,
        email,
        phoneNumber,
        nrc,
        dateOfBirth,
        occupation,
        province,
        district,
        userType: 'citizen',
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Signup Successful!',
        description: 'Your account has been created. Redirecting to dashboard...',
      });

      // Redirect to home/dashboard
      router.push('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'An unexpected error occurred during signup.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use by another account.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password must be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is invalid.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="m@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={6} />
        <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" name="phoneNumber" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nrc">NRC Number</Label>
          <Input id="nrc" name="nrc" placeholder="e.g., 123456/10/1" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input id="occupation" name="occupation" required />
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

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline hover:text-primary">
          Log in
        </Link>
      </p>
    </form>
  );
}
