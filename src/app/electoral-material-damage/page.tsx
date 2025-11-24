
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Archive, AlertCircle, Eye, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const damageReports = [
    { id: 'EMD001', material: 'Ballot Boxes', location: 'PS005', severity: 'High', status: 'Actioned', details: 'Ballot boxes tampered with.' },
    { id: 'EMD002', material: 'Voter Register', location: 'PS003', severity: 'Medium', status: 'Investigating', details: 'Register reported missing.' },
    { id: 'EMD003', material: 'Voting Booths', location: 'PS002', severity: 'Low', status: 'Resolved', details: 'Minor damage to a booth.' },
];

export default function ElectoralMaterialDamagePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Electoral Material Damage
            </h1>
             <Link href="/report?category=Electoral%20Material%20Damage">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Report Damage
                </Button>
            </Link>
       </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>High Severity Reports</CardTitle>
                <CardDescription>Critical incidents requiring immediate attention.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <AlertCircle className="h-10 w-10 text-destructive"/>
                <p className="text-4xl font-bold">{damageReports.filter(r => r.severity === 'High').length}</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Total Reports</CardTitle>
                <CardDescription>All reports of material damage.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Archive className="h-10 w-10 text-primary"/>
                 <p className="text-4xl font-bold">{damageReports.length}</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Damage Reports Log</CardTitle>
            <CardDescription>A log of all reported damage to electoral materials.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {damageReports.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.material}</TableCell>
                            <TableCell>{report.location}</TableCell>
                            <TableCell><Badge variant={report.severity === 'High' ? 'destructive' : 'secondary'}>{report.severity}</Badge></TableCell>
                            <TableCell className="max-w-xs truncate">{report.details}</TableCell>
                            <TableCell>{report.status}</TableCell>
                             <TableCell className="text-right">
                                <Link href={`/incidents/${report.id}`} passHref>
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
