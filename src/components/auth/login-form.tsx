
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useDatabase, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ref } from "firebase/database";
import type { UserProfile } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

function SubmitButton() {
  const { formState: { isSubmitting } } = useForm(); // Simplified for this component
  return (
    <Button type="submit" disabled={isSubmitting} className="w-full">
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Login
    </Button>
  );
}

export function LoginForm({ portal }: { portal?: 'citizen' | 'department' }) {
  const auth = useAuth();
  const database = useDatabase();
  const router = useRouter();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsSubmitting(true);
    setFirebaseError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (user) {
        // Fetch user profile to decide redirection
        const userProfileRef = ref(database, `users/${user.uid}`);
        const { get } = await import("firebase/database");
        const snapshot = await get(userProfileRef);

        if (snapshot.exists()) {
          const userProfile: UserProfile = snapshot.val();
          if (userProfile.departmentId) {
            router.push('/department-dashboard');
          } else {
            router.push('/');
          }
        } else {
          // Default redirect if profile doesn't exist for some reason
          router.push('/');
        }
      }

    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Invalid email or password.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/too-many-requests':
           errorMessage = "Too many failed login attempts. Please try again later.";
           break;
      }
      setFirebaseError(errorMessage);
      setIsSubmitting(false);
    }
  };
  
  const { user } = useUser();
   useEffect(() => {
    if (user) {
       if (portal === 'department') {
            router.push('/department-dashboard');
       } else {
            router.push('/');
       }
    }
  }, [user, router, portal]);


  return (
    <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {firebaseError && (
        <Alert variant="destructive">
          <AlertTitle>Login Failed</AlertTitle>
          <AlertDescription>{firebaseError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Login
      </Button>
      
      {portal !== 'department' && (
        <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="underline hover:text-primary">
            Sign up
            </Link>
        </p>
      )}
    </form>
  );
}
