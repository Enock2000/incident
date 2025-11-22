'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Incident } from '@/lib/types';
import { IncidentTable } from "@/components/incidents/incident-table";
import { getCollectionPath } from "@/lib/utils";

export default function VoterSafetyIncidentPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const safetyIncidentsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, getCollectionPath('incidents')), 
            where('category', '==', 'Voter Safety'),
            orderBy('dateReported', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: incidents, isLoading: isIncidentsLoading } = useCollection<Incident>(safetyIncidentsQuery);
    
  if (isUserLoading || (user && isIncidentsLoading)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const incidentsInvestigating = incidents?.filter(i => i.status === 'Investigating' || i.status === 'Verified' || i.status === 'Reported').length || 0;
  const incidentsActioned = incidents?.filter(i => i.status === 'Actioned' || i.status === 'Team Dispatched' || i.status === 'In Progress').length || 0;
  const incidentsResolved = incidents?.filter(i => i.status === 'Resolved').length || 0;


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Voter Safety Incidents
        </h1>
        <Link href="/report?category=Voter%20Safety">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Report New Safety Incident
            </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Incident by Type</CardTitle>
            </CardHeader>
            <CardContent>
                {/* This would need more data or sub-categories to be meaningful */}
                <p className="text-muted-foreground">Statistics by incident subtype will be shown here.</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Resolution Status</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="flex justify-around">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{incidentsInvestigating}</p>
                        <p className="text-sm text-muted-foreground">Investigating</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold">{incidentsActioned}</p>
                        <p className="text-sm text-muted-foreground">Actioned</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold">{incidentsResolved}</p>
                        <p className="text-sm text-muted-foreground">Resolved</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Reported Safety Incidents</CardTitle>
            <CardDescription>Incidents specifically related to the safety and security of voters.</CardDescription>
        </CardHeader>
        <CardContent>
             {incidents && incidents.length > 0 ? (
                <IncidentTable incidents={incidents} />
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full">
                        <AlertCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="mt-4 text-xl font-headline">
                        No Voter Safety Incidents Reported
                    </h3>
                    <p className="text-muted-foreground">
                        When an incident is categorized as 'Voter Safety', it will appear here.
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
