
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const incidents = [
    { id: "VIM-001", type: "Physical Assault", location: "Chaisa, Lusaka", victimGroup: "Opposition Supporters", status: "Under Investigation" },
    { id: "VIM-002", type: "Threats", location: "Mpulungu", victimGroup: "ECZ Officials", status: "Security Dispatched" },
    { id: "VIM-003", type: "Property Damage", location: "Mpatamatu, Luanshya", victimGroup: "Candidate's Home", status: "Reported" },
    { id: "VIM-004", type: "Forced Disruption of Rally", location: "Monze", victimGroup: "Independent Candidate", status: "Under Investigation" },
];

export default function ViolenceIntimidationMonitoringPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Violence & Intimidation Monitoring
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Incident Log</CardTitle>
          <CardDescription>Tracking reports of violence and intimidation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Victim/Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {incidents.map(incident => (
                    <TableRow key={incident.id}>
                        <TableCell className="font-medium">{incident.type}</TableCell>
                        <TableCell>{incident.location}</TableCell>
                        <TableCell>{incident.victimGroup}</TableCell>
                        <TableCell><Badge variant="secondary">{incident.status}</Badge></TableCell>
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
