'use client';

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ZtisLogo } from "@/components/icons";

export default function PortalLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <ZtisLogo className="w-12 h-12" />
            </div>
          <CardTitle className="font-headline text-2xl">Resolution Portal Login</CardTitle>
          <CardDescription>
            Access for authorized department personnel only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm portal="department" />
        </CardContent>
      </Card>
    </div>
  );
}
