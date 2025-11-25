
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArchiveX, FileWarning, Package, CheckShield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const incidents = [
    { id: "EMD-001", type: "Water Damage", location: "Lunga District", items: "Ballot Papers", status: "Damage Assessed", details: "Ballot papers exposed to rain due to poor storage." },
    { id: "EMD-002", type: "Fire", location: "Mansa Central", items: "Voting Booths", status: "Under Investigation", details: "Fire broke out at a storage warehouse." },
    { id: "EMD-003", type: "Torn Ballots", location: "Kabwe", items: "Ballot Papers", status: "Replacement Sent", details: "A box of ballots was found torn open." },
];

export default function ElectoralMaterialDamagePage() {
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
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Currently under investigation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Affected</CardTitle>
            <ArchiveX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 types</div>
            <p className="text-xs text-muted-foreground">Ballot Papers, Booths</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replacements Sent</CardTitle>
            <CheckShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Shipment confirmed</p>
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
            {incidents.map(incident => (
                 <div key={incident.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold">{incident.type} - <span className="text-primary">{incident.items}</span></p>
                            <p className="text-sm text-muted-foreground">{incident.location}</p>
                        </div>
                         <Badge variant="secondary">{incident.status}</Badge>
                    </div>
                     <p className="mt-2 text-sm">{incident.details}</p>
                </div>
            ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
