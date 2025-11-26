
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useDatabase, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import type { Incident, IncidentType, Department } from "@/lib/types";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import { Loader2, Shield } from "lucide-react";
import { IncidentTable } from "@/components/incidents/incident-table";

export default function DepartmentDashboardPage() {
    const { userProfile, isProfileLoading } = useUser();
    const database = useDatabase();

    const departmentId = userProfile?.departmentId;

    const departmentIncidentsQuery = useMemoFirebase(() =>
        (database && departmentId) ? query(ref(database, 'incidents'), orderByChild('departmentId'), equalTo(departmentId)) : null
    , [database, departmentId]);
    
    const { data: incidents, isLoading: isIncidentsLoading } = useCollection<Incident>(departmentIncidentsQuery);
    
    const departmentRef = useMemoFirebase(() => 
        (database && departmentId) ? ref(database, `departments/${departmentId}`) : null
    , [database, departmentId]);

    const { data: department, isLoading: isDepartmentLoading } = useDoc<Department>(departmentRef);

    const incidentTypesRef = useMemoFirebase(() => database ? query(ref(database, 'incidentTypes')) : null, [database]);
    const { data: incidentTypes, isLoading: isTypesLoading } = useCollection<IncidentType>(incidentTypesRef);
    
    const isLoading = isProfileLoading || isIncidentsLoading || isDepartmentLoading || isTypesLoading;

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!departmentId || !department) {
         return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                 <div className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
                    <div className="mx-auto bg-destructive/10 p-4 rounded-full">
                        <Shield className="h-10 w-10 text-destructive" />
                    </div>
                    <h3 className="mt-4 text-xl font-headline">
                        Not Assigned to a Department
                    </h3>
                    <p className="text-muted-foreground">
                        You are not assigned to a department. Please contact an administrator.
                    </p>
                </div>
            </div>
        );
    }
    
    const sortedIncidents = incidents ? [...incidents].reverse() : [];


    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                {department.name} Dashboard
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Assigned Incidents</CardTitle>
                    <CardDescription>A list of all incidents assigned to your department.</CardDescription>
                </CardHeader>
                <CardContent>
                    {sortedIncidents && sortedIncidents.length > 0 ? (
                        <IncidentTable incidents={sortedIncidents} incidentTypes={incidentTypes || []} />
                    ) : (
                        <p className="text-center py-10 text-muted-foreground">No incidents have been assigned to your department yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
