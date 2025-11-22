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
} from 'lucide-react';
import Link from 'next/link';
import type { Incident } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { getCollectionPath } from '@/lib/utils';


export default function CitizenPortalPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const userIncidentsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, getCollectionPath('incidents')), 
            where('reporter.userId', '==', user.uid),
            orderBy('dateReported', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: incidents, isLoading: isIncidentsLoading } =
    useCollection<Incident>(userIncidentsQuery);

  if (isUserLoading || (user && isIncidentsLoading)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    router.push('/login');
    return (
         <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
    );
  }


  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Citizen Portal
        </h1>
        <div className="flex items-center space-x-2">
          <Link href="/report">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Report New Incident
            </Button>
          </Link>
        </div>
      </div>
       <div>
        <Card>
          <CardHeader>
            <CardTitle>My Reported Incidents</CardTitle>
            <CardDescription>Here is a list of incidents you have reported. You can track their status here.</CardDescription>
          </CardHeader>
          <CardContent>
            {incidents && incidents.length > 0 ? (
                 <IncidentTable incidents={incidents} />
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-10 min-h-[200px]">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full">
                        <AlertCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="mt-4 text-xl font-headline">
                        No Incidents Reported
                    </h3>
                    <p className="text-muted-foreground">
                        You have not reported any incidents yet.
                    </p>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
