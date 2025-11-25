
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, AlertTriangle, Truck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const disruptions = [
    { id: 1, route: "Great North Road", issue: "Road Blocked", status: "Active", risk: "High", details: "Protest action blocking T2 road near Kabwe." },
    { id: 2, route: "Livingstone to Sesheke", issue: "Vehicle Breakdown", status: "Active", risk: "Medium", details: "Truck carrying ballot papers has broken down." },
    { id: 3, route: "Mongu-Kalabo Road", issue: "Flooding", status: "Resolved", risk: "Low", details: "Road was temporarily impassable." },
];

export default function ElectionLogisticsDisruptionPage() {
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
            {disruptions.map(d => (
                 <Card key={d.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-headline">{d.route}</CardTitle>
                        <Badge variant={d.status === 'Active' ? 'destructive' : 'default'}>{d.status}</Badge>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold text-md mb-2">{d.issue}</p>
                        <p className="text-sm text-muted-foreground">{d.details}</p>
                         <div className="flex items-center gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span>{d.risk} Risk</span>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
