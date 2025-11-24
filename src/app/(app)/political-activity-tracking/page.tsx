'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag, PlusCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const activities = [
    { id: 'PA001', party: 'Patriotic Front', type: 'Rally', location: 'Kabwe', attendance: '~500', isSanctioned: true, date: '2024-08-15' },
    { id: 'PA002', party: 'UPND', type: 'Community Meeting', location: 'Chongwe', attendance: '~100', isSanctioned: true, date: '2024-08-15' },
    { id: 'PA003', party: 'Socialist Party', type: 'Protest', location: 'Lusaka', attendance: '~250', isSanctioned: false, date: '2024-08-14' },
    { id: 'PA004', party: 'Patriotic Front', type: 'Roadshow', location: 'Ndola', attendance: 'N/A', isSanctioned: true, date: '2024-08-14' },
];

export default function PoliticalActivityTrackingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Political Activity Tracking
        </h1>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Log New Activity
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>A log of all reported political activities.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4 mb-4">
                <Input placeholder="Filter by party or location..." className="max-w-sm"/>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4"/>
                    Apply Filter
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Party</TableHead>
                        <TableHead>Activity Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Est. Attendance</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Sanctioned</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activities.map((activity) => (
                        <TableRow key={activity.id}>
                            <TableCell className="font-medium">{activity.party}</TableCell>
                            <TableCell>{activity.type}</TableCell>
                            <TableCell>{activity.location}</TableCell>
                            <TableCell>{activity.attendance}</TableCell>
                            <TableCell>{activity.date}</TableCell>
                            <TableCell>
                                <Badge variant={activity.isSanctioned ? 'default' : 'destructive'}>
                                    {activity.isSanctioned ? 'Yes' : 'No'}
                                </Badge>
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
