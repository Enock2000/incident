
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDatabase, useCollection, useMemoFirebase } from "@/firebase";
import type { Incident, IncidentType } from "@/lib/types";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import { Loader2, ShieldAlert } from "lucide-react";
import { IncidentTable } from "@/components/incidents/incident-table";
import { useAuthUser } from "@/hooks/use-auth-user";
import { hasPermission } from "@/lib/permissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMemo } from "react";

export default function IncidentsPage() {
    const { user, isLoading: isUserLoading } = useAuthUser();
    const database = useDatabase();

    // Build query based on user permissions
    const incidentsQuery = useMemoFirebase(() => {
        if (!database || !user) return null;

        // Admins, regional authorities, and data analysts see all incidents
        if (hasPermission(user.userType, 'incidents.view.all')) {
            return query(ref(database, 'incidents'), orderByChild('dateReported'));
        }

        // Department users (response units) see only their department's incidents
        if (hasPermission(user.userType, 'incidents.view.department') && user.departmentId) {
            return query(
                ref(database, 'incidents'),
                orderByChild('departmentId'),
                equalTo(user.departmentId)
            );
        }

        // Citizens see only their own reports
        if (hasPermission(user.userType, 'incidents.view.own')) {
            return query(
                ref(database, 'incidents'),
                orderByChild('reporter/userId'),
                equalTo(user.id)
            );
        }

        return null;
    }, [database, user?.userType, user?.departmentId, user?.id]);

    const { data: incidents, isLoading: isIncidentsLoading } = useCollection<Incident>(incidentsQuery);

    const incidentTypesRef = useMemoFirebase(() => database ? query(ref(database, 'incidentTypes')) : null, [database]);
    const { data: incidentTypes, isLoading: isTypesLoading } = useCollection<IncidentType>(incidentTypesRef);

    // Additional client-side filtering for citizens (since Firebase query on nested fields may not work perfectly)
    const filteredIncidents = useMemo(() => {
        if (!incidents) return [];

        // For citizens, double-check they only see their own reports
        if (user && hasPermission(user.userType, 'incidents.view.own')) {
            return incidents.filter(incident => incident.reporter?.userId === user.id);
        }

        return incidents;
    }, [incidents, user]);

    if (isUserLoading || isIncidentsLoading || isTypesLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // Show alert if user has no department access but needs it
    if (user && hasPermission(user.userType, 'incidents.view.department') && !user.departmentId) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Incident Management
                </h1>
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>No Department Access</AlertTitle>
                    <AlertDescription>
                        You need to be assigned to a department to view incidents. Please contact your administrator.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Newest first
    const sortedIncidents = filteredIncidents ? [...filteredIncidents].reverse() : [];

    // Determine title based on user role
    const getPageTitle = () => {
        if (!user) return "All Incidents";
        if (hasPermission(user.userType, 'incidents.view.all')) return "All Incidents";
        if (hasPermission(user.userType, 'incidents.view.department')) return "Department Incidents";
        if (hasPermission(user.userType, 'incidents.view.own')) return "My Reported Incidents";
        return "Incidents";
    };

    const getPageDescription = () => {
        if (!user) return "A list of all reported incidents in the system.";
        if (hasPermission(user.userType, 'incidents.view.all')) return "A complete list of all reported incidents in the system.";
        if (hasPermission(user.userType, 'incidents.view.department')) return "Incidents assigned to your department.";
        if (hasPermission(user.userType, 'incidents.view.own')) return "Incidents that you have reported.";
        return "Your accessible incidents.";
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                Incident Management
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>{getPageTitle()}</CardTitle>
                    <CardDescription>{getPageDescription()}</CardDescription>
                </CardHeader>
                <CardContent>
                    {sortedIncidents && sortedIncidents.length > 0 ? (
                        <IncidentTable incidents={sortedIncidents} incidentTypes={incidentTypes || []} />
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No incidents found.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
