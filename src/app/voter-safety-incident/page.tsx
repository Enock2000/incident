'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, Eye, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const safetyIncidents = [
    { id: 'VSI001', type: 'Intimidation', station: 'PS003', details: 'Voters being blocked from entering.', status: 'Actioned', timestamp: '08:45 AM' },
    { id: 'VSI002', type: 'Disinformation', station: 'PS001', details: 'False information about polling times being spread.', status: 'Investigating', timestamp: '10:10 AM' },
    { id: 'VSI003', type: 'Health Emergency', station: 'PS004', details: 'Elderly voter collapsed in queue.', status: 'Resolved', timestamp: '11:00 AM' },
    { id: 'VSI004', type: 'Campaigning', station: 'PS002', details: 'Party materials being distributed near polling station.', status: 'Actioned', timestamp: '11:30 AM' },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Actioned': return 'secondary';
        case 'Investigating': return 'default';
        case 'Resolved': return 'outline';
        default: return 'outline';
    }
}

export default function VoterSafetyIncidentPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Voter Safety Incidents
        </h1>
        <Link href="/report">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Report New Safety Incident
            </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Incident by Type</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-around">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{safetyIncidents.filter(i => i.type === 'Intimidation').length}</p>
                        <p className="text-sm text-muted-foreground">Intimidation</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold">{safetyIncidents.filter(i => i.type === 'Disinformation').length}</p>
                        <p className="text-sm text-muted-foreground">Disinformation</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold">{safetyIncidents.filter(i => i.type === 'Health Emergency').length}</p>
                        <p className="text-sm text-muted-foreground">Health</p>
                    </div>
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Resolution Status</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="flex justify-around">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{safetyIncidents.filter(i => i.status === 'Investigating').length}</p>
                        <p className="text-sm text-muted-foreground">Investigating</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold">{safetyIncidents.filter(i => i.status === 'Actioned').length}</p>
                        <p className="text-sm text-muted-foreground">Actioned</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold">{safetyIncidents.filter(i => i.status === 'Resolved').length}</p>
                        <p className="text-sm text-muted-foreground">Resolved</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Reported Safety Incidents</CardTitle>
            <CardDescription>Incidents specifically related to the safety and security of voters.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Polling Station</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {safetyIncidents.map((incident) => (
                        <TableRow key={incident.id}>
                            <TableCell><Badge variant="secondary">{incident.type}</Badge></TableCell>
                            <TableCell className="font-medium max-w-sm truncate">{incident.details}</TableCell>
                            <TableCell>{incident.station}</TableCell>
                            <TableCell>{incident.timestamp}</TableCell>
                            <TableCell><Badge variant={getStatusBadge(incident.status)}>{incident.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Link href={`/incidents/${incident.id}`} passHref>
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
