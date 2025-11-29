
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query } from "firebase/database";
import type { PollingStation, PollingStationStatus } from "@/lib/types";
import { Loader2, AlertCircle, PackageX, PowerOff, Vote, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

const getStatusBadgeVariant = (status: PollingStationStatus) => {
    switch (status) {
        case 'Open': return 'default';
        case 'Closed': return 'secondary';
        case 'Delayed': return 'destructive';
        case 'Interrupted': return 'destructive';
        default: return 'outline';
    }
}

const getQueueIndicatorColor = (length: number) => {
    if (length > 100) return "bg-red-500";
    if (length > 50) return "bg-yellow-500";
    return "bg-green-500";
}


export default function PollingStationMonitoringPage() {
  const database = useDatabase();

  const stationsQuery = useMemoFirebase(() => database ? query(ref(database, 'polling-stations')) : null, [database]);
  const { data: stations, isLoading } = useCollection<PollingStation>(stationsQuery);

  const stats = useMemo(() => {
    if (!stations) return { total: 0, withIssues: 0, missingMaterials: 0, powerOutages: 0, open: 0 };
    return {
        total: stations.length,
        withIssues: stations.filter(s => s.hasTamperingReport || s.status === 'Delayed' || s.status === 'Interrupted').length,
        missingMaterials: stations.filter(s => s.hasMissingMaterials).length,
        powerOutages: stations.filter(s => s.hasPowerOutage).length,
        open: stations.filter(s => s.status === 'Open').length,
    }
  }, [stations]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Polling Station Monitoring
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stations with Issues</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.withIssues}</div>
                <p className="text-xs text-muted-foreground">Delayed, Interrupted, or Tampering Reports</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missing Materials</CardTitle>
                <PackageX className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.missingMaterials}</div>
                <p className="text-xs text-muted-foreground">Stations reporting material shortages</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Power Outages</CardTitle>
                <PowerOff className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.powerOutages}</div>
                <p className="text-xs text-muted-foreground">Stations currently without power</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Stations</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.open} / {stats.total}</div>
                <Progress value={(stats.open / stats.total) * 100} className="mt-2" />
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Polling Stations</CardTitle>
          <CardDescription>Live status overview of all polling stations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Queue Length</TableHead>
                    <TableHead>Alerts</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stations?.map(station => (
                     <TableRow key={station.id}>
                        <TableCell className="font-medium">{station.name}</TableCell>
                        <TableCell>{station.district}, {station.province}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusBadgeVariant(station.status)}>{station.status}</Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getQueueIndicatorColor(station.queueLength)}`}></div>
                                <span>{station.queueLength}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                             <div className="flex items-center gap-2">
                                {station.hasMissingMaterials && <Badge variant="destructive">Materials</Badge>}
                                {station.hasPowerOutage && <Badge variant="destructive">Power</Badge>}
                                {station.hasTamperingReport && <Badge variant="destructive">Tampering</Badge>}
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
