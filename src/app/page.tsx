
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IncidentTable } from '@/components/incidents/incident-table';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy, addDoc, getDocs } from 'firebase/firestore';
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
import { useEffect } from 'react';


export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const incidentsCollection = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'artifacts/default-app-id/public/data/incidents'),
            where('status', 'in', ['Reported', 'Verified', 'Team Dispatched', 'In Progress']),
            orderBy('dateReported', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: incidents, isLoading: isIncidentsLoading } =
    useCollection<Incident>(incidentsCollection);
    
  // SEED DATA - This will run once to add some placeholder data for assets.
  useEffect(() => {
    if (!firestore || !user) return;
    
    const seedData = async () => {
        try {
            const policeAssetsCollection = collection(firestore, 'artifacts/default-app-id/public/data/departments', 'police_dept_123', 'assets');
            const fireAssetsCollection = collection(firestore, 'artifacts/default-app-id/public/data/departments', 'fire_dept_456', 'assets');
            
            const policeSnapshot = await getDocs(policeAssetsCollection);
            if (policeSnapshot.empty) {
                await addDoc(policeAssetsCollection, { name: 'Patrol Car 1', assetType: 'Vehicle', status: 'Active', departmentId: 'police_dept_123' });
                await addDoc(policeAssetsCollection, { name: 'Body Armor Set 5', assetType: 'Equipment', status: 'Active', departmentId: 'police_dept_123' });
            }

            const fireSnapshot = await getDocs(fireAssetsCollection);
            if (fireSnapshot.empty) {
                 await addDoc(fireAssetsCollection, { name: 'Fire Engine 3', assetType: 'Vehicle', status: 'Active', departmentId: 'fire_dept_456' });
            }
        } catch(e) {
            console.error("Error seeding data:", e);
        }
    };

    const seeded = sessionStorage.getItem('assets_seeded');
    if (!seeded) {
        seedData();
        sessionStorage.setItem('assets_seeded', 'true');
    }
  }, [firestore, user]);


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
          </Header>
          <CardContent>
            {incidents && <IncidentTable incidents={incidents.slice(0, 10)} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
