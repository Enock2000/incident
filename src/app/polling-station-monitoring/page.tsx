'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, AlertTriangle, Monitor, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const pollingStations = [
    { id: 'PS001', name: 'Lusaka Central Primary', province: 'Lusaka', district: 'Lusaka', status: 'Open', voters: 1250, reportedIssues: 0, lastCheckin: '08:05 AM' },
    { id: 'PS002', name: 'Northmead Secondary', province: 'Lusaka', district: 'Lusaka', status: 'Open', voters: 2500, reportedIssues: 1, lastCheckin: '08:15 AM' },
    { id: 'PS003', name: 'Libala High School', province: 'Lusaka', district: 'Lusaka', status: 'Delayed', voters: 1800, reportedIssues: 0, lastCheckin: '07:55 AM' },
    { id: 'PS004', name: 'Kitwe Main Hall', province: 'Copperbelt', district: 'Kitwe', status: 'Open', voters: 3200, reportedIssues: 0, lastCheckin: '08:10 AM' },
    { id: 'PS005', name: 'Ndola Civic Center', province: 'Copperbelt', district: 'Ndola', status: 'Closed', voters: 2100, reportedIssues: 3, lastCheckin: '07:30 AM' },
];

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Open': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'Delayed': return <Clock className="h-5 w-5 text-yellow-500" />;
        case 'Closed': return <AlertTriangle className="h-5 w-5 text-red-500" />;
        default: return null;
    }
}

export default function PollingStationMonitoringPage() {
  const openStations = pollingStations.filter(p => p.status === 'Open').length;
  const totalStations = pollingStations.length;
  const reportingProgress = (openStations / totalStations) * 100;

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
            <div className="text-2xl font-bold">{pollingStations.filter(p => p.reportedIssues > 0).length}</div>
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Station Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Registered Voters</TableHead>
                        <TableHead>Issues</TableHead>
                        <TableHead>Last Check-in</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pollingStations.map((station) => (
                        <TableRow key={station.id}>
                            <TableCell className="w-24">
                                <Badge variant={station.status === 'Open' ? 'default' : station.status === 'Delayed' ? 'secondary' : 'destructive'}>
                                   <div className="flex items-center gap-2">
                                     {getStatusIcon(station.status)}
                                     {station.status}
                                   </div>
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{station.name}</TableCell>
                            <TableCell>{station.province}, {station.district}</TableCell>
                            <TableCell>{station.voters.toLocaleString()}</TableCell>
                            <TableCell>
                                <Badge variant={station.reportedIssues > 0 ? 'destructive' : 'secondary'}>{station.reportedIssues}</Badge>
                            </TableCell>
                            <TableCell>{station.lastCheckin}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
