"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidentTable } from "@/components/incidents/incident-table";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Activity, AlertTriangle, CheckCircle, PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Incident } from "@/lib/types";

export default function DashboardPage() {
  const firestore = useFirestore();
  const incidentsCollection = firestore ? collection(firestore, "incidents") : null;
  const { data: incidents, loading } = useCollection<Incident>(incidentsCollection);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter(i => i.status === 'Resolved').length;
  const activeIncidents = incidents.filter(i => i.status === 'In Progress' || i.status === 'Team Dispatched').length;
  const pendingIncidents = incidents.filter(i => i.status === 'Reported' || i.status === 'Verified').length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
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
            <p className="text-xs text-muted-foreground">Completed investigations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Responses</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIncidents}</div>
            <p className="text-xs text-muted-foreground">Teams currently dispatched</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingIncidents}</div>
            <p className="text-xs text-muted-foreground">Awaiting authority review</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentTable incidents={incidents.slice(0, 10)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
