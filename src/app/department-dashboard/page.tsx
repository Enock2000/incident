
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDatabase, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { useAuthUser } from "@/hooks/use-auth-user";
import type { Incident, IncidentType, Department } from "@/lib/types";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import { Loader2, Shield, Activity, CheckCircle, AlertCircle } from "lucide-react";
import { IncidentTable } from "@/components/incidents/incident-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function DepartmentDashboardPage() {
    const { user, isLoading: isAuthLoading } = useAuthUser();
    const database = useDatabase();
    const router = useRouter();

    const departmentId = user?.departmentId;

    // Redirect if no access
    useEffect(() => {
        if (!isAuthLoading && !user?.hasDepartmentAccess && !user?.isAdmin) {
            router.push('/');
        }
    }, [user, isAuthLoading, router]);

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

    const isLoading = isAuthLoading || isIncidentsLoading || isDepartmentLoading || isTypesLoading;

    const metrics = useMemo(() => {
        if (!incidents) return { total: 0, active: 0, resolved: 0 };
        return {
            total: incidents.length,
            active: incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length,
            resolved: incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length
        };
    }, [incidents]);

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
                        Access Denied
                    </h3>
                    <p className="text-muted-foreground">
                        You do not have access to this department dashboard.
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

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.total}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                        <AlertCircle className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.active}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.resolved}</div>
                        <p className="text-xs text-muted-foreground">Completed cases</p>
                    </CardContent>
                </Card>
            </div>

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
