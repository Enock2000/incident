
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const activities = [
    { id: "ICA-001", type: "Distributing Money", location: "Mandevu Market", status: "Evidence Submitted", reportedBy: "Citizen" },
    { id: "ICA-002", type: "Campaigning on Election Day", location: "Chilenje Polling Station", status: "Under Review", reportedBy: "Monitor" },
    { id: "ICA-003", type: "Defacing Posters", location: "Kabwe Town", status: "Closed", reportedBy: "Citizen" },
    { id: "ICA-004", type: "Using Government Vehicles", location: "Ndola", status: "Under Review", reportedBy: "Anonymous" },
];

export default function IllegalCampaignActivityPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Illegal Campaign Activity
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Activity Reports</CardTitle>
          <CardDescription>Monitoring reports of illegal campaign practices.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {activities.map(activity => (
                    <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.type}</TableCell>
                        <TableCell>{activity.location}</TableCell>
                        <TableCell><Badge variant={activity.status === 'Closed' ? 'default' : 'secondary'}>{activity.status}</Badge></TableCell>
                        <TableCell>{activity.reportedBy}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm">View Report</Button>
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
