
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertCircle, TrendingUp, CheckCircle, Eye, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const conflicts = [
    { id: 'PEC01', type: 'Protest', location: 'Lusaka', severity: 'Medium', status: 'Monitoring', timestamp: '1 day ago' },
    { id: 'PEC02', type: 'Dispute over results', location: 'Kitwe', severity: 'High', status: 'Intervention', timestamp: '12 hours ago' },
    { id: 'PEC03', type: 'Celebratory Gathering', location: 'Ndola', severity: 'Low', status: 'Resolved', timestamp: '2 days ago' },
];

export default function PostElectionConflictMonitoringPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Post-Election Conflict Monitoring
            </h1>
            <Link href="/report?category=Post-Election%20Conflict">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Report Incident
                </Button>
            </Link>
       </div>
      

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Hotspots</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{conflicts.filter(c => c.status === 'Monitoring' || c.status === 'Intervention').length}</div>
                <p className="text-xs text-muted-foreground">Areas with ongoing tensions</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">De-escalated Incidents</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{conflicts.filter(c => c.status === 'Resolved').length}</div>
                <p className="text-xs text-muted-foreground">Successfully managed situations</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High-Risk Area</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Kitwe</div>
                <p className="text-xs text-muted-foreground">Location with most severe reports</p>
            </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Incidents Log</CardTitle>
            <CardDescription>Monitoring log for post-election activities and potential conflicts.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Update</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {conflicts.map((conflict) => (
                        <TableRow key={conflict.id}>
                            <TableCell className="font-medium">{conflict.type}</TableCell>
                            <TableCell>{conflict.location}</TableCell>
                            <TableCell>
                                <Badge variant={conflict.severity === 'High' ? 'destructive' : 'secondary'}>{conflict.severity}</Badge>
                            </TableCell>
                            <TableCell>{conflict.status}</TableCell>
                            <TableCell>{conflict.timestamp}</TableCell>
                            <TableCell className="text-right">
                                <Link href={`/incidents/${conflict.id}`} passHref>
                                    <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>
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
