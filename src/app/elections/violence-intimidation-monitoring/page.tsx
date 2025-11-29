
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ViolenceIntimidationMonitoringPage() {
  const database = useDatabase();
  const incidentsQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Political Violence')) : null,
    [database]
  );
  const { data: incidents, isLoading } = useCollection<Incident>(incidentsQuery);

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
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : incidents && incidents.length > 0 ? (
            <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {incidents.map(incident => (
                      <TableRow key={incident.id}>
                          <TableCell className="font-medium">{incident.title}</TableCell>
                          <TableCell>{typeof incident.location === 'object' ? incident.location.address : incident.location}</TableCell>
                          <TableCell><Badge variant="secondary">{incident.status}</Badge></TableCell>
                          <TableCell className="text-right">
                               <Link href={`/incidents/${incident.id}`}>
                                <Button variant="outline" size="sm">View Report</Button>
                               </Link>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-10">No violence or intimidation incidents reported.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
