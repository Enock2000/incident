'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, Eye, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const illegalActivities = [
    { id: 'ICA001', type: 'Campaigning near Polling Station', location: 'PS002', status: 'Verified', reportedBy: 'Observer', timestamp: '11:45 AM' },
    { id: 'ICA002', type: 'Voter Bribery', location: 'Chongwe Market', status: 'Investigating', reportedBy: 'Anonymous', timestamp: '10:00 AM' },
    { id: 'ICA003', type: 'Defacing Posters', location: 'Kabwe Town', status: 'Actioned', reportedBy: 'Citizen', timestamp: '09:30 AM' },
    { id: 'ICA004', type: 'Unauthorized Rally', location: 'Ndola', status: 'Resolved', reportedBy: 'Police', timestamp: 'Yesterday' },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Verified': return 'default';
        case 'Investigating': return 'secondary';
        case 'Actioned': return 'outline';
        case 'Resolved': return 'default';
        default: return 'outline';
    }
}


export default function IllegalCampaignActivityPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Illegal Campaign Activity
        </h1>
        <Link href="/report?category=Illegal%20Campaign%20Activity">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Report Activity
            </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Open Cases</CardTitle>
                 <CardDescription>Activities currently under investigation.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{illegalActivities.filter(a => a.status === 'Investigating').length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Most Common Violation</CardTitle>
                <CardDescription>Leading type of illegal activity reported.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">Campaigning near Station</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>A log of all reported illegal campaign activities.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {illegalActivities.map((activity) => (
                        <TableRow key={activity.id}>
                            <TableCell className="font-medium">{activity.type}</TableCell>
                            <TableCell>{activity.location}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(activity.status)}>{activity.status}</Badge>
                            </TableCell>
                            <TableCell>{activity.reportedBy}</TableCell>
                            <TableCell>{activity.timestamp}</TableCell>
                             <TableCell className="text-right">
                                <Link href={`/incidents/${activity.id}`} passHref>
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
