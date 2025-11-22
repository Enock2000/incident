
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, AlertTriangle, CheckCircle, PlusCircle, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { Incident } from "@/lib/types";
import { format } from "date-fns";

const getImpactBadge = (impact: string) => {
    switch (impact) {
        case 'High': return 'destructive';
        case 'Critical': return 'destructive';
        case 'Medium': return 'secondary';
        case 'Low': return 'default';
        default: return 'outline';
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'In Progress': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        case 'Team Dispatched': return <Truck className="h-4 w-4 text-blue-500" />;
        case 'Resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
        default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
}

export default function ElectionLogisticsDisruptionPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const disruptionsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'artifacts/default-app-id/public/data/incidents'), 
            where('category', '==', 'Logistics Disruption'),
            orderBy('dateReported', 'desc')
          )
        : null,
    [firestore, user]
    );
    const { data: disruptions, isLoading: isDisruptionsLoading } = useCollection<Incident>(disruptionsQuery);

    if (isUserLoading || (user && isDisruptionsLoading)) {
        return (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        );
    }
    
    const ongoingDisruptions = disruptions?.filter(d => d.status === 'In Progress' || d.status === 'Team Dispatched' || d.status === 'Verified' || d.status === 'Reported').length || 0;
    const resolvedDisruptions = disruptions?.filter(d => d.status === 'Resolved').length || 0;
    const totalDisruptions = disruptions?.length || 0;

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, "p");
    };

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
                <div className="text-2xl font-bold">{ongoingDisruptions}</div>
                <p className="text-xs text-muted-foreground">Active issues affecting logistics</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalDisruptions}</div>
                <p className="text-xs text-muted-foreground">All logged disruptions</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{resolvedDisruptions}</div>
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
            {disruptions && disruptions.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Route/Location</TableHead>
                            <TableHead>Disruption</TableHead>
                            <TableHead>Impact Level</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reported At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {disruptions.map((d) => (
                            <TableRow key={d.id}>
                                <TableCell className="font-medium">{typeof d.location === 'object' ? d.location.address : d.location}</TableCell>
                                <TableCell>{d.title}</TableCell>
                                <TableCell>
                                    <Badge variant={getImpactBadge(d.priority)}>{d.priority}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(d.status)}
                                        {d.status}
                                    </div>
                                </TableCell>
                                <TableCell>{formatDate(d.dateReported)}</TableCell>
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
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-10 min-h-[200px]">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full">
                        <Truck className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="mt-4 text-xl font-headline">
                        No Disruptions Reported
                    </h3>
                    <p className="text-muted-foreground">
                        When a logistics disruption is reported, it will appear here.
                    </p>
               </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
