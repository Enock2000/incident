
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArchiveX, FileWarning, Package, CheckShield, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";

export default function ElectoralMaterialDamagePage() {
  const database = useDatabase();
  const incidentsQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Logistics Disruption')) : null,
    [database]
  );
  const { data: incidents, isLoading } = useCollection<Incident>(incidentsQuery);

  const activeIncidents = incidents?.filter(i => i.status !== 'Resolved' && i.status !== 'Rejected').length ?? 0;
  const replacementsSent = incidents?.filter(i => i.status === 'Resolved').length ?? 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Electoral Material Damage
      </h1>
       <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeIncidents}</div>
            <p className="text-xs text-muted-foreground">Currently under investigation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Affected</CardTitle>
            <ArchiveX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : incidents?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents Resolved</CardTitle>
            <CheckShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : replacementsSent}</div>
            <p className="text-xs text-muted-foreground">Damage reports resolved</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Damage Reports</CardTitle>
          <CardDescription>Tracking all incidents of damage to electoral materials.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : incidents && incidents.length > 0 ? (
                incidents.map(incident => (
                     <div key={incident.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">{incident.title}</p>
                                <p className="text-sm text-muted-foreground">{typeof incident.location === 'object' ? incident.location.address : incident.location}</p>
                            </div>
                             <Badge variant="secondary">{incident.status}</Badge>
                        </div>
                         <p className="mt-2 text-sm">{incident.description}</p>
                    </div>
                ))
              ) : (
                <p className="text-center py-10">No material damage incidents reported.</p>
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
