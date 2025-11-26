
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useDatabase, useCollection, useMemoFirebase } from "@/firebase";
import type { Incident, IncidentType } from "@/lib/types";
import { ref, query, orderByChild } from "firebase/database";
import { Loader2 } from "lucide-react";
import { IncidentTable } from "@/components/incidents/incident-table";

export default function IncidentsPage() {
    const { user, isUserLoading } = useUser();
    const database = useDatabase();

    const incidentsQuery = useMemoFirebase(() =>
        (database && user) ? query(ref(database, 'incidents'), orderByChild('dateReported')) : null
    , [database, user]);

    const { data: incidents, isLoading: isIncidentsLoading } = useCollection<Incident>(incidentsQuery);

    const incidentTypesRef = useMemoFirebase(() => database ? query(ref(database, 'incidentTypes')) : null, [database]);
    const { data: incidentTypes, isLoading: isTypesLoading } = useCollection<IncidentType>(incidentTypesRef);

    if (isUserLoading || isIncidentsLoading || isTypesLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // Newest first
    const sortedIncidents = incidents ? [...incidents].reverse() : [];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                Incident Management
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Incidents</CardTitle>
                    <CardDescription>A list of all reported incidents in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    {sortedIncidents && sortedIncidents.length > 0 ? (
                        <IncidentTable incidents={sortedIncidents} incidentTypes={incidentTypes || []} />
                    ) : (
                        <p>No incidents have been reported yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
