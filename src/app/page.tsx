

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
  FileText,
  Shield,
  BarChart,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import type { Incident, IncidentType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary-radial opacity-10" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 animate-fade-in">
                <div className="space-y-2 animate-slide-up">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Zambia Tracking Incident System (ZTIS)
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    A unified platform for reporting, tracking, and managing incidents nationwide. Empowering citizens and response teams for a safer Zambia.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <Link href="/report">
                    <Button size="lg" variant="gradient" className="w-full min-[400px]:w-auto">Report an Incident</Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">Login / Sign Up</Button>
                  </Link>
                </div>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1568317711805-97917847953d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8bWFwJTIwY2l0eXxlbnwwfHx8fDE3NjM3ODQzOTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                width="600"
                height="400"
                alt="Hero Map"
                data-ai-hint="map city"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last animate-float shadow-soft"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A Platform Built for Action</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From citizen reporting to emergency response coordination, ZTIS provides the tools needed to manage incidents effectively.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center p-6 rounded-lg transition-all duration-300 hover:bg-card hover:shadow-soft hover:-translate-y-2">
                <div className="mx-auto bg-gradient-primary p-4 rounded-full mb-2 transition-transform duration-300 hover:scale-110">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold font-headline">Real-time Reporting</h3>
                <p className="text-sm text-muted-foreground">
                  Citizens can instantly report incidents from anywhere, providing crucial on-the-ground information.
                </p>
              </div>
              <div className="grid gap-1 text-center p-6 rounded-lg transition-all duration-300 hover:bg-card hover:shadow-soft hover:-translate-y-2">
                <div className="mx-auto bg-gradient-primary p-4 rounded-full mb-2 transition-transform duration-300 hover:scale-110">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold font-headline">Response Coordination</h3>
                <p className="text-sm text-muted-foreground">
                  Relevant authorities and departments are notified immediately to dispatch and manage response teams.
                </p>
              </div>
              <div className="grid gap-1 text-center p-6 rounded-lg transition-all duration-300 hover:bg-card hover:shadow-soft hover:-translate-y-2">
                <div className="mx-auto bg-gradient-primary p-4 rounded-full mb-2 transition-transform duration-300 hover:scale-110">
                  <BarChart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold font-headline">Analytics & Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize incident data, track trends, and generate reports to improve future response strategies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">How It Works</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                A simple, transparent process from report to resolution.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 md:grid-cols-4 gap-8 pt-12">
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold">1</div>
                <h3 className="font-bold">Submit Report</h3>
                <p className="text-sm text-muted-foreground">A citizen or official reports an incident via the web or mobile app.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold">2</div>
                <h3 className="font-bold">Verify & Triage</h3>
                <p className="text-sm text-muted-foreground">The system verifies the report and assigns it a priority level.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold">3</div>
                <h3 className="font-bold">Dispatch Team</h3>
                <p className="text-sm text-muted-foreground">The relevant response department is notified and dispatches a team.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold">4</div>
                <h3 className="font-bold">Resolve & Document</h3>
                <p className="text-sm text-muted-foreground">The incident is resolved, and all actions are documented for future analysis.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Ready to Make a Difference?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join the platform today. Report incidents, stay informed, and help build a safer Zambia.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <div className="flex justify-center">
                <Link href="/report">
                  <Button type="submit" size="lg" variant="gradient">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Zambia Tracking Incident System. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  const database = useDatabase();
  const { user, isUserLoading } = useUser();

  const incidentsRef = useMemoFirebase(
    () =>
      database && user
        ? query(ref(database, 'incidents'), orderByChild('status'))
        : null,
    [database, user]
  );

  const { data: incidents, isLoading: isIncidentsLoading } = useCollection<Incident>(incidentsRef);

  const incidentTypesRef = useMemoFirebase(() => database ? query(ref(database, 'incidentTypes')) : null, [database]);
  const { data: incidentTypes, isLoading: isTypesLoading } = useCollection<IncidentType>(incidentTypesRef);


  // SEED DATA
  useEffect(() => {
    if (!database) return;

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
        if (!pollingSnapshot.exists()) {
          const pollingStations = [
            { id: 'PS001', name: 'Chawama Primary School', province: 'Lusaka', district: 'Lusaka', status: 'Open', queueLength: 35, hasMissingMaterials: false, staffAttendance: { present: 5, absent: 0 }, hasPowerOutage: false, hasTamperingReport: false, registeredVoters: 1200, lastCheckin: Date.now(), location: { latitude: -15.4612, longitude: 28.3031 } },
            { id: 'PS002', name: 'Libala Secondary School', province: 'Lusaka', district: 'Lusaka', status: 'Open', queueLength: 50, hasMissingMaterials: true, staffAttendance: { present: 4, absent: 1 }, hasPowerOutage: false, hasTamperingReport: false, registeredVoters: 1500, lastCheckin: Date.now(), location: { latitude: -15.4496, longitude: 28.3218 } },
            { id: 'PS003', name: 'Ndeke Primary', province: 'Copperbelt', district: 'Kitwe', status: 'Delayed', queueLength: 120, hasMissingMaterials: false, staffAttendance: { present: 5, absent: 0 }, hasPowerOutage: true, hasTamperingReport: false, registeredVoters: 1800, lastCheckin: Date.now(), location: { latitude: -12.8625, longitude: 28.2567 } },
            { id: 'PS004', name: 'Jacaranda Basic', province: 'Copperbelt', district: 'Ndola', status: 'Closed', queueLength: 0, hasMissingMaterials: false, staffAttendance: { present: 5, absent: 0 }, hasPowerOutage: false, hasTamperingReport: false, registeredVoters: 950, lastCheckin: Date.now(), location: { latitude: -12.9833, longitude: 28.6500 } },
            { id: 'PS005', name: 'Maramba Cultural Village', province: 'Southern', district: 'Livingstone', status: 'Interrupted', queueLength: 25, hasMissingMaterials: false, staffAttendance: { present: 3, absent: 2 }, hasPowerOutage: false, hasTamperingReport: true, registeredVoters: 800, lastCheckin: Date.now(), location: { latitude: -17.8225, longitude: 25.8425 } },
          ];

          for (const station of pollingStations) {
            await set(ref(database, `polling-stations/${station.id}`), station);
          }
        }

      } catch (e) {
        console.error("Error seeding data:", e);
      }
    };

    const seeded = sessionStorage.getItem('data_seeded_rtdb_v2');
    if (!seeded) {
      seedData();
      sessionStorage.setItem('data_seeded_rtdb_v2', 'true');
    }
  }, [database]);

  if (isUserLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (isIncidentsLoading || isTypesLoading) {
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
            {incidents && <IncidentTable incidents={incidents.slice(0, 10)} incidentTypes={incidentTypes || []} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
