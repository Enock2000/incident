'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { CheckCircle, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
    const { auth } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>
                        Enter your email to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="space-y-4">
                            <Alert className="bg-success/10 border-success">
                                <CheckCircle className="h-4 w-4 text-success" />
                                <AlertDescription>
                                    Password reset email sent! Check your inbox.
                                </AlertDescription>
                            </Alert>
                            <p className="text-sm text-center text-muted-foreground">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setSuccess(false)}
                            >
                                Send Another Email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                            </Button>

                            <p className="text-sm text-center text-muted-foreground">
                                Remember your password?{' '}
                                <Link href="/login" className="text-primary hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
