
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useDoc, useDatabase } from '@/firebase';
import { ref } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { updateIntegrationSettings } from '@/app/actions';
import type { IntegrationSettings } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useMemoFirebase } from '@/firebase/provider';

const initialState: { success: boolean; message: string; issues?: string[]; } = {
  success: false,
  message: "",
};

function SubmitButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export default function IntegrationsPage() {
    const database = useDatabase();
    const { toast } = useToast();

    const [state, formAction] = useActionState(updateIntegrationSettings, initialState);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Success", description: state.message });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: (
                        <div>
                            <p>{state.message}</p>
                            {state.issues && state.issues.length > 0 && (
                                <ul className="list-disc list-inside mt-2">{state.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}</ul>
                            )}
                        </div>
                    )
                });
            }
        }
    }, [state, toast]);

    const settingsRef = useMemoFirebase(
        () => database ? ref(database, 'integrationSettings') : null,
        [database]
    );
    const { data: settings, isLoading } = useDoc<IntegrationSettings>(settingsRef);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center space-x-4">
                <Link href="/admin/configuration" passHref>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Configuration</span>
                    </Button>
                </Link>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Integrations
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Integration Settings</CardTitle>
                    <CardDescription>Manage the integration settings for the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <form action={formAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="smsGateway">SMS Gateway</Label>
                                <Input id="smsGateway" name="smsGateway" defaultValue={settings?.smsGateway} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emailServer">Email Server</Label>
                                <Input id="emailServer" name="emailServer" defaultValue={settings?.emailServer} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mapProvider">Map Provider</Label>
                                <Input id="mapProvider" name="mapProvider" defaultValue={settings?.mapProvider} />
                            </div>
                            <SubmitButton>Save Changes</SubmitButton>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
