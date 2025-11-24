
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Route, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const routes = [
    { id: 'R01', name: 'Great North Road (T2)', status: 'Clear', traffic: 'Light', lastUpdate: '5 mins ago' },
    { id: 'R02', name: 'Lusaka-Mongu Road (M9)', status: 'Congestion', traffic: 'Heavy', lastUpdate: '2 mins ago' },
    { id: 'R03', name: 'Copperbelt-Solwezi (T5)', status: 'Clear', traffic: 'Moderate', lastUpdate: '10 mins ago' },
    { id: 'R04', name: 'Great East Road (T4)', status: 'Accident', traffic: 'Blocked', lastUpdate: '1 min ago' },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Clear': return 'default';
        case 'Congestion': return 'secondary';
        case 'Accident': return 'destructive';
        default: return 'outline';
    }
};

const getTrafficProgress = (traffic: string) => {
    switch (traffic) {
        case 'Light': return 25;
        case 'Moderate': return 50;
        case 'Heavy': return 75;
        case 'Blocked': return 100;
        default: return 0;
    }
};

export default function TransportationRouteMonitoringPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">
        Transportation & Route Monitoring
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Routes Monitored</CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{routes.length}</div>
                <p className="text-xs text-muted-foreground">Key electoral logistics routes</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clear Routes</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{routes.filter(r => r.status === 'Clear').length}</div>
                <p className="text-xs text-muted-foreground">Routes with no reported issues</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Routes with Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{routes.filter(r => r.status !== 'Clear').length}</div>
                <p className="text-xs text-muted-foreground">Routes requiring attention</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Live Route Status</CardTitle>
            <CardDescription>Real-time monitoring of key transportation routes for election logistics.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Route Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Traffic Level</TableHead>
                        <TableHead>Last Update</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {routes.map((route) => (
                        <TableRow key={route.id}>
                            <TableCell className="font-medium">{route.name}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(route.status)}>{route.status}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{route.traffic}</span>
                                    <Progress value={getTrafficProgress(route.traffic)} className="w-24 h-2" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    {route.lastUpdate}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
