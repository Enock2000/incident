'use client';

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useDatabase, useCollection, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";
import { DepartmentMetrics } from "@/components/resolution/department-metrics";
import { ResolutionIncidentTable } from "@/components/resolution/resolution-incident-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";

export default function ResolutionPortalPage() {
    const { user, isLoading: isAuthLoading } = useAuthUser();
    const database = useDatabase();
    const router = useRouter();

    // Redirect if no department access
    useEffect(() => {
        if (!isAuthLoading && user && !user.hasDepartmentAccess && !user.isAdmin) {
            router.push('/');
        }
    }, [user, isAuthLoading, router]);

    const departmentIncidentsQuery = useMemoFirebase(() =>
        (database && user?.departmentId)
            ? query(ref(database, 'incidents'), orderByChild('departmentId'), equalTo(user.departmentId))
            : null,
        [database, user?.departmentId]
    );

    const { data: allIncidents, isLoading } = useCollection<Incident>(departmentIncidentsQuery);

    const incidents = useMemo(() => {
        if (!allIncidents) return { assigned: [], unassigned: [], resolved: [], urgent: [] };

        const myAssigned = allIncidents.filter(i =>
            typeof i.assignedTo === 'object' &&
            i.assignedTo?.userId === user?.id &&
            !i.resolution
        );

        const unassigned = allIncidents.filter(i =>
            (!i.assignedTo || typeof i.assignedTo === 'string') &&
            !i.resolution
        );

        const resolved = allIncidents.filter(i => i.resolution);

        const urgent = allIncidents.filter(i =>
            (i.priority === 'High' || i.priority === 'Critical') && !i.resolution
        );

        return { assigned: myAssigned, unassigned, resolved, urgent };
    }, [allIncidents, user?.id]);

    if (isAuthLoading || isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user?.hasDepartmentAccess && !user?.isAdmin) {
        return null;
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Resolution Portal</h1>
            </div>

            <DepartmentMetrics incidents={allIncidents || []} />

            <Tabs defaultValue="assigned" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="assigned">
                        My Assigned ({incidents.assigned.length})
                    </TabsTrigger>
                    <TabsTrigger value="unassigned">
                        Unassigned ({incidents.unassigned.length})
                    </TabsTrigger>
                    <TabsTrigger value="urgent">
                        Urgent ({incidents.urgent.length})
                    </TabsTrigger>
                    <TabsTrigger value="resolved">
                        Resolved ({incidents.resolved.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="assigned" className="space-y-4">
                    <Card className="p-6">
                        <ResolutionIncidentTable
                            incidents={incidents.assigned}
                            showAssignButton={false}
                        />
                    </Card>
                </TabsContent>

                <TabsContent value="unassigned" className="space-y-4">
                    <Card className="p-6">
                        <ResolutionIncidentTable
                            incidents={incidents.unassigned}
                            showAssignButton={true}
                        />
                    </Card>
                </TabsContent>

                <TabsContent value="urgent" className="space-y-4">
                    <Card className="p-6">
                        <ResolutionIncidentTable
                            incidents={incidents.urgent}
                            showAssignButton={true}
                        />
                    </Card>
                </TabsContent>

                <TabsContent value="resolved" className="space-y-4">
                    <Card className="p-6">
                        <ResolutionIncidentTable
                            incidents={incidents.resolved}
                            showResolutionDetails={true}
                        />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
