
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck, Shield, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const incidents = [
    { id: "VSI-001", station: "Mandevu East", description: "Voter being prevented from entering polling station.", status: "Intervention in Progress" },
    { id: "VSI-002", station: "Kanyama West", description: "Voter reported being threatened in the queue.", status: "Security Alerted" },
    { id: "VSI-003", station: "Chirundu Border", description: "Allegations of vote buying outside station.", status: "Under Review" },
];

export default function VoterSafetyIncidentPage() {
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
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Incidents requiring immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Teams Dispatched</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
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
                {incidents.map(incident => (
                    <div key={incident.id} className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4"/> {incident.station}</p>
                            <Badge variant="secondary">{incident.status}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-2">{incident.description}</p>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
