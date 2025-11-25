
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useObjectVal, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { updateElectionMode } from '@/app/actions';
import type { ElectionMode } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

export default function ElectionModePage() {
    const database = useDatabase();
    const { toast } = useToast();

    const [state, formAction] = useActionState(updateElectionMode, initialState);

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
        () => database ? ref(database, 'electionMode') : null,
        [database]
    );
    const { data: electionMode, isLoading } = useObjectVal<ElectionMode>(settingsRef);
    
    const [enabled, setEnabled] = useState(electionMode?.enabled || false);

    useEffect(() => {
        if(electionMode) {
            setEnabled(electionMode.enabled);
        }
    }, [electionMode]);


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
                    Election Mode
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Election Mode Settings</CardTitle>
                    <CardDescription>Manage the election mode settings for the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <form action={formAction}>
                            <div className="flex items-center space-x-2">
                                <Switch id="election-mode-switch" name="enabled" checked={enabled} onCheckedChange={setEnabled} />
                                <Label htmlFor="election-mode-switch">Enable Election Mode</Label>
                            </div>
                            <div className="mt-4 text-sm text-gray-600">When enabled, the system exposes election-related incident types, polling station maps, and stricter escalation rules.</div>
                            <div className="mt-6">
                               <SubmitButton>Save Changes</SubmitButton>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
