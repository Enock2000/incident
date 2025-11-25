
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

export default function IllegalCampaignActivityPage() {
  const database = useDatabase();
  const activitiesQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Election')) : null,
    [database]
  );
  const { data: activities, isLoading } = useCollection<Incident>(activitiesQuery);

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
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : activities && activities.length > 0 ? (
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
                          <TableCell className="font-medium">{activity.title}</TableCell>
                          <TableCell>{typeof activity.location === 'object' ? activity.location.address : activity.location}</TableCell>
                          <TableCell><Badge variant={activity.status === 'Resolved' ? 'default' : 'secondary'}>{activity.status}</Badge></TableCell>
                          <TableCell>{activity.reporter?.isAnonymous ? 'Anonymous' : 'Citizen'}</TableCell>
                          <TableCell className="text-right">
                              <Link href={`/incidents/${activity.id}`}>
                                <Button variant="outline" size="sm">View Report</Button>
                              </Link>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-10">No illegal campaign activities reported.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
