
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, AlertTriangle, CheckCircle, PlusCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const disruptions = [
    { id: 'LD001', route: 'Lusaka to Chipata', type: 'Vehicle Breakdown', status: 'Rerouted', impact: 'Medium', reportedAt: '04:30 AM' },
    { id: 'LD002', route: 'Ndola to Solwezi', type: 'Road Closure', status: 'Ongoing', impact: 'High', reportedAt: '06:00 AM' },
    { id: 'LD003', route: 'Livingstone to Mongu', type: 'Adverse Weather', status: 'Resolved', impact: 'Low', reportedAt: 'Yesterday' },
];

const getImpactBadge = (impact: string) => {
    switch (impact) {
        case 'High': return 'destructive';
        case 'Medium': return 'secondary';
        case 'Low': return 'default';
        default: return 'outline';
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Ongoing': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        case 'Rerouted': return <Truck className="h-4 w-4 text-blue-500" />;
        case 'Resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
        default: return null;
    }
}

export default function ElectionLogisticsDisruptionPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Election Logistics Disruption
            </h1>
            <Link href="/report?category=Logistics%20Disruption">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Report Disruption
                </Button>
            </Link>
       </div>
      
       <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ongoing Disruptions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{disruptions.filter(d => d.status === 'Ongoing').length}</div>
                <p className="text-xs text-muted-foreground">Active issues affecting logistics</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{disruptions.length}</div>
                <p className="text-xs text-muted-foreground">All logged disruptions</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{disruptions.filter(d => d.status === 'Resolved').length}</div>
                <p className="text-xs text-muted-foreground">Issues resolved in the last 24h</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Disruption Log</CardTitle>
            <CardDescription>Real-time log of all reported logistical disruptions.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Disruption Type</TableHead>
                        <TableHead>Impact Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {disruptions.map((d) => (
                        <TableRow key={d.id}>
                            <TableCell className="font-medium">{d.route}</TableCell>
                            <TableCell>{d.type}</TableCell>
                            <TableCell>
                                <Badge variant={getImpactBadge(d.impact)}>{d.impact}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(d.status)}
                                    {d.status}
                                </div>
                            </TableCell>
                            <TableCell>{d.reportedAt}</TableCell>
                            <TableCell className="text-right">
                                <Link href={`/incidents/${d.id}`} passHref>
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
