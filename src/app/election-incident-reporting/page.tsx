'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IncidentTable } from '@/components/incidents/incident-table';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import {
  PlusCircle,
  Loader2,
  AlertCircle,
  Vote
} from 'lucide-react';
import Link from 'next/link';
import type { Incident } from '@/lib/types';

export default function ElectionIncidentReportingPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // Query for incidents with the "Election" category
  const electionIncidentsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'artifacts/default-app-id/public/data/incidents'), 
            where('category', '==', 'Election'),
            orderBy('dateReported', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: incidents, isLoading: isIncidentsLoading } =
    useCollection<Incident>(electionIncidentsQuery);

  if (isUserLoading || (user && isIncidentsLoading)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Election Incident Reporting
        </h1>
        <div className="flex items-center space-x-2">
          {/* TODO: Create a dedicated election incident report form */}
          <Link href="/report">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Report Election Incident
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Election-Related Incidents</CardTitle>
          <CardDescription>
            This table displays all incidents categorized under 'Election'.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incidents && incidents.length > 0 ? (
            <IncidentTable incidents={incidents} />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
              <div className="mx-auto bg-primary/10 p-4 rounded-full">
                <Vote className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-headline">
                No Election Incidents Reported
              </h3>
              <p className="text-muted-foreground">
                When an incident is categorized as 'Election', it will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
