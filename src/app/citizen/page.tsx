
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useDatabase, useCollection, useMemoFirebase } from "@/firebase";
import type { Incident } from "@/lib/types";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import { Loader2 } from "lucide-react";
import { IncidentTable } from "@/components/incidents/incident-table";

export default function CitizenPage() {
    const { user, isUserLoading } = useUser();
    const database = useDatabase();

    const userIncidentsQuery = useMemoFirebase(() =>
        (database && user) ? query(ref(database, 'incidents'), orderByChild('reporter/userId'), equalTo(user.uid)) : null
    , [database, user]);

    const { data: incidents, isLoading: isIncidentsLoading } = useCollection<Incident>(userIncidentsQuery);

    if (isUserLoading || isIncidentsLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                My Activity
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>My Reported Incidents</CardTitle>
                    <CardDescription>A list of all the incidents you have reported.</CardDescription>
                </CardHeader>
                <CardContent>
                    {incidents && incidents.length > 0 ? (
                        <IncidentTable incidents={incidents} />
                    ) : (
                        <p>You have not reported any incidents yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
