
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, AlertTriangle, Monitor, PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/firebase/database/use-collection";
import { ref, query, orderByChild } from "firebase/database";
import { useDatabase, useUser, useMemoFirebase } from "@/firebase";
import type { PollingStation, PollingStationStatus } from "@/lib/types";
import { format } from "date-fns";

const getStatusIcon = (status: PollingStationStatus) => {
    switch (status) {
        case 'Open': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'Delayed': return <Clock className="h-5 w-5 text-yellow-500" />;
        case 'Closed': return <AlertTriangle className="h-5 w-5 text-red-500" />;
        case 'Interrupted': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
        default: return null;
    }
}

const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp), 'p');
}

export default function PollingStationMonitoringPage() {
  const database = useDatabase();
  const { user } = useUser();

  const stationsQuery = useMemoFirebase(
    () =>
      database && user
        ? query(ref(database, 'pollingStations'), orderByChild('name'))
        : null,
    [database, user]
  );
  const { data: pollingStations, isLoading } = useCollection<PollingStation>(stationsQuery);


  const openStations = pollingStations?.filter(p => p.status === 'Open').length || 0;
  const totalStations = pollingStations?.length || 0;
  const reportingProgress = totalStations > 0 ? (openStations / totalStations) * 100 : 0;
  const stationsWithIssues = pollingStations?.filter(p => p.hasMissingMaterials || p.hasPowerOutage || p.hasTamperingReport || p.status === 'Interrupted' || p.status === 'Closed').length || 0;


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Polling Station Monitoring
        </h1>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Station
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stations</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStations}</div>
            <p className="text-xs text-muted-foreground">All registered polling stations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open & Reporting</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openStations}</div>
            <p className="text-xs text-muted-foreground">Stations currently operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stations with Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stationsWithIssues}</div>
            <p className="text-xs text-muted-foreground">Stations needing attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Station Status Overview</CardTitle>
            <CardDescription>Live status of all polling stations across the country.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-primary">Reporting Progress</span>
                    <span className="text-sm font-medium">{reportingProgress.toFixed(0)}%</span>
                </div>
                <Progress value={reportingProgress} />
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Station Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Queue</TableHead>
                            <TableHead>Issues</TableHead>
                            <TableHead>Last Check-in</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pollingStations && pollingStations.map((station) => (
                            <TableRow key={station.id}>
                                <TableCell className="w-28">
                                    <Badge variant={station.status === 'Open' ? 'default' : station.status === 'Delayed' ? 'secondary' : 'destructive'}>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(station.status)}
                                        {station.status}
                                    </div>
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{station.name}</TableCell>
                                <TableCell>{station.province}, {station.district}</TableCell>
                                <TableCell>{station.queueLength}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {station.hasMissingMaterials && <Badge variant="destructive">Materials</Badge>}
                                        {station.hasPowerOutage && <Badge variant="destructive">Power</Badge>}
                                        {station.hasTamperingReport && <Badge variant="destructive">Tamper</Badge>}
                                        {!(station.hasMissingMaterials || station.hasPowerOutage || station.hasTamperingReport) && <Badge variant="secondary">None</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell>{formatDate(station.lastCheckin)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    