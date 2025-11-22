'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IncidentTable } from '@/components/incidents/incident-table';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Loader2,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import type { Incident } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { getCollectionPath } from '@/lib/utils';


export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const incidentsCollection = useMemoFirebase(
    () =>
      firestore && user
        ? query(collection(firestore, getCollectionPath('incidents')), orderBy('dateReported', 'desc'))
        : null,
    [firestore, user]
  );
  const { data: incidents, isLoading: isIncidentsLoading } =
    useCollection<Incident>(incidentsCollection);

  if (isUserLoading || (user && isIncidentsLoading)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="mx-auto rounded-full bg-primary/10 p-4">
          <LogIn className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Welcome to ZTIS</h2>
        <p className="text-muted-foreground">
          Please log in to view the incident dashboard.
        </p>
        <div className="flex gap-4">
           <Link href="/login">
            <Button>
              <LogIn className="mr-2 h-4 w-4" /> Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalIncidents = incidents?.length ?? 0;
  const resolvedIncidents =
    incidents?.filter((i) => i.status === 'Resolved').length ?? 0;
  const activeIncidents =
    incidents?.filter(
      (i) => i.status === 'In Progress' || i.status === 'Team Dispatched'
    ).length ?? 0;
  const pendingIncidents =
    incidents?.filter(
      (i) => i.status === 'Reported' || i.status === 'Verified'
    ).length ?? 0;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Incident Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Link href="/report">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Report New Incident
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground">All incidents reported</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Completed investigations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Responses
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Teams currently dispatched
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Verification
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting authority review
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {incidents && <IncidentTable incidents={incidents.slice(0, 10)} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
