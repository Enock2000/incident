

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IncidentTable } from '@/components/incidents/incident-table';
import { useCollection, useDatabase, useUser, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild, get, set, push } from 'firebase/database';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import type { Incident } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const database = useDatabase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const incidentsRef = useMemoFirebase(
    () =>
      database && user
        ? query(ref(database, 'incidents'), orderByChild('status'))
        : null,
    [database, user]
  );
  
  const { data: incidents, isLoading: isIncidentsLoading } = useCollection<Incident>(incidentsRef);

  // SEED DATA
  useEffect(() => {
    if (!database || !user) return;
    
    const seedData = async () => {
        try {
            // Seed Departments & Assets
            const policeDeptRef = ref(database, 'departments/police_dept_123');
            await set(policeDeptRef, {
                name: "Zambia Police Service",
                category: "Police",
                province: "Lusaka",
                district: "Lusaka"
            });

            const fireDeptRef = ref(database, 'departments/fire_dept_456');
             await set(fireDeptRef, {
                name: "Lusaka Fire Brigade",
                category: "Fire",
                province: "Lusaka",
                district: "Lusaka"
            });

            const policeAssetsRef = ref(database, 'departments/police_dept_123/assets');
            const policeSnapshot = await get(policeAssetsRef);
            if (!policeSnapshot.exists()) {
                await push(policeAssetsRef, { name: 'Patrol Car 1', assetType: 'Vehicle', status: 'Active', departmentId: 'police_dept_123' });
                await push(policeAssetsRef, { name: 'Body Armor Set 5', assetType: 'Equipment', status: 'Active', departmentId: 'police_dept_123' });
            }

            const fireAssetsRef = ref(database, 'departments/fire_dept_456/assets');
            const fireSnapshot = await get(fireAssetsRef);
            if (!fireSnapshot.exists()) {
                 await push(fireAssetsRef, { name: 'Fire Engine 3', assetType: 'Vehicle', status: 'Active', departmentId: 'fire_dept_456' });
            }

            // Seed Polling Stations
            const pollingStationsRef = ref(database, 'polling-stations');
            const pollingSnapshot = await get(pollingStationsRef);
            if(!pollingSnapshot.exists()){
                const pollingStations = [
                    { id: 'PS001', name: 'Chawama Primary School', province: 'Lusaka', district: 'Lusaka', status: 'Open', queueLength: 35, hasMissingMaterials: false, staffAttendance: { present: 5, absent: 0}, hasPowerOutage: false, hasTamperingReport: false, registeredVoters: 1200, lastCheckin: Date.now(), location: { latitude: -15.4612, longitude: 28.3031 } },
                    { id: 'PS002', name: 'Libala Secondary School', province: 'Lusaka', district: 'Lusaka', status: 'Open', queueLength: 50, hasMissingMaterials: true, staffAttendance: { present: 4, absent: 1}, hasPowerOutage: false, hasTamperingReport: false, registeredVoters: 1500, lastCheckin: Date.now(), location: { latitude: -15.4496, longitude: 28.3218 } },
                    { id: 'PS003', name: 'Ndeke Primary', province: 'Copperbelt', district: 'Kitwe', status: 'Delayed', queueLength: 120, hasMissingMaterials: false, staffAttendance: { present: 5, absent: 0}, hasPowerOutage: true, hasTamperingReport: false, registeredVoters: 1800, lastCheckin: Date.now(), location: { latitude: -12.8625, longitude: 28.2567 } },
                    { id: 'PS004', name: 'Jacaranda Basic', province: 'Copperbelt', district: 'Ndola', status: 'Closed', queueLength: 0, hasMissingMaterials: false, staffAttendance: { present: 5, absent: 0}, hasPowerOutage: false, hasTamperingReport: false, registeredVoters: 950, lastCheckin: Date.now(), location: { latitude: -12.9833, longitude: 28.6500 } },
                    { id: 'PS005', name: 'Maramba Cultural Village', province: 'Southern', district: 'Livingstone', status: 'Interrupted', queueLength: 25, hasMissingMaterials: false, staffAttendance: { present: 3, absent: 2}, hasPowerOutage: false, hasTamperingReport: true, registeredVoters: 800, lastCheckin: Date.now(), location: { latitude: -17.8225, longitude: 25.8425 } },
                ];

                for(const station of pollingStations){
                    await set(ref(database, `polling-stations/${station.id}`), station);
                }
            }

        } catch(e) {
            console.error("Error seeding data:", e);
        }
    };

    const seeded = sessionStorage.getItem('data_seeded_rtdb_v2');
    if (!seeded) {
        seedData();
        sessionStorage.setItem('data_seeded_rtdb_v2', 'true');
    }
  }, [database, user]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);


  if (isUserLoading || !user || (user && isIncidentsLoading)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const relevantIncidents = incidents?.filter(i => i.status !== 'Rejected') ?? [];
  const totalIncidents = relevantIncidents.length;
  const resolvedIncidents =
    relevantIncidents?.filter((i) => i.status === 'Resolved').length ?? 0;
    
  const activeIncidents =
    relevantIncidents?.filter(
      (i) => i.status === 'In Progress' || i.status === 'Team Dispatched'
    ).length ?? 0;
    
  const pendingIncidents =
    relevantIncidents?.filter(
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
            <p className="text-xs text-muted-foreground">All non-rejected incidents</p>
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
