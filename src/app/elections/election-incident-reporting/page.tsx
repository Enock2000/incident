
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Loader2 } from "lucide-react";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import type { Incident } from "@/lib/types";
import { ref, query, orderByChild, equalTo } from "firebase/database";

const getPriorityVariant = (priority: string) => {
    switch (priority) {
        case 'High': return 'destructive';
        case 'Critical': return 'destructive';
        case 'Medium': return 'secondary';
        default: return 'outline';
    }
}

export default function ElectionIncidentReportingPage() {
  const database = useDatabase();
  const incidentsQuery = useMemoFirebase(() => 
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Election')) : null,
    [database]
  );
  const { data: incidents, isLoading } = useCollection<Incident>(incidentsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
            Election Incident Reporting
        </h1>
         <Link href="/report">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Report Election Incident
            </Button>
          </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Election Incidents</CardTitle>
          <CardDescription>A real-time feed of all reported election-related incidents.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : incidents && incidents.length > 0 ? (
            <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Incident ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {incidents.map(incident => (
                      <TableRow key={incident.id}>
                          <TableCell className="font-medium">{incident.id}</TableCell>
                          <TableCell>{incident.title}</TableCell>
                          <TableCell>{typeof incident.location === 'object' ? incident.location.address : incident.location}</TableCell>
                          <TableCell>{incident.status}</TableCell>
                          <TableCell><Badge variant={getPriorityVariant(incident.priority)}>{incident.priority}</Badge></TableCell>
                          <TableCell className="text-right">
                               <Link href={`/incidents/${incident.id}`}>
                                  <Button variant="outline" size="sm">View Details</Button>
                              </Link>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p>No election-related incidents reported yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
