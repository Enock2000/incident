
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck, Shield, MapPin, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";

export default function VoterSafetyIncidentPage() {
  const database = useDatabase();
  const incidentsQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Voter Safety')) : null,
    [database]
  );
  const { data: incidents, isLoading } = useCollection<Incident>(incidentsQuery);

  const activeIncidents = incidents?.filter(i => i.status !== 'Resolved' && i.status !== 'Rejected').length ?? 0;
  const dispatchedTeams = incidents?.filter(i => i.status === 'Team Dispatched').length ?? 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Voter Safety Incidents
      </h1>
       <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeIncidents}</div>
            <p className="text-xs text-muted-foreground">Incidents requiring immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Teams Dispatched</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : dispatchedTeams}</div>
            <p className="text-xs text-muted-foreground">Mobile units responding to alerts</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Incident Feed</CardTitle>
          <CardDescription>Reports related to the safety and security of individual voters.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : incidents && incidents.length > 0 ? (
                  incidents.map(incident => (
                    <div key={incident.id} className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4"/> {typeof incident.location === 'object' ? incident.location.address : incident.location}</p>
                            <Badge variant="secondary">{incident.status}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-2">{incident.description}</p>
                    </div>
                ))
              ) : (
                <p className="text-center py-10">No voter safety incidents reported.</p>
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
