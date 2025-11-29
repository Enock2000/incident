
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, AlertTriangle, Truck, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";

export default function ElectionLogisticsDisruptionPage() {
  const database = useDatabase();
  const disruptionsQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Logistics Disruption')) : null,
    [database]
  );
  const { data: disruptions, isLoading } = useCollection<Incident>(disruptionsQuery);

  const getRisk = (priority: string) => {
    switch(priority) {
      case 'Critical':
      case 'High':
        return 'High';
      case 'Medium':
        return 'Medium';
      default:
        return 'Low';
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Election Logistics Disruption
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Logistics Monitoring</CardTitle>
          <CardDescription>Tracking disruptions to the transportation of election materials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : disruptions && disruptions.length > 0 ? (
                disruptions.map(d => (
                     <Card key={d.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-headline">{d.title}</CardTitle>
                            <Badge variant={d.status !== 'Resolved' ? 'destructive' : 'default'}>{d.status}</Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold text-md mb-2">{typeof d.location === 'object' ? d.location.address : d.location}</p>
                            <p className="text-sm text-muted-foreground">{d.description}</p>
                             <div className="flex items-center gap-4 mt-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <span>{getRisk(d.priority)} Risk</span>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
              <p className="text-center py-10">No logistics disruptions reported.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
