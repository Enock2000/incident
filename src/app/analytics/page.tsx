
'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Loader2, BarChart2, AlertCircle, Map } from 'lucide-react';
import type { Incident } from '@/lib/types';
import { IncidentCategoryChart } from '@/components/analytics/incident-category-chart';
import { IncidentTimelineChart } from '@/components/analytics/incident-timeline-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AnalyticsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const incidentsCollection = useMemoFirebase(
    () =>
      firestore && user
        ? query(collection(firestore, 'incidents'), orderBy('dateReported', 'desc'))
        : null,
    [firestore, user]
  );
  const { data: incidents, isLoading: isIncidentsLoading } =
    useCollection<Incident>(incidentsCollection);

  if (isIncidentsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Analytics Dashboard
        </h1>
        <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full">
            <AlertCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">
            No Incident Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            There is no incident data available to generate analytics.
            <br />
            Once incidents are reported, you will see charts and stats here.
          </p>
        </CardContent>
      </Card>
      </div>
    );
  }

  const handleExport = () => {
    // Basic CSV export logic
    const headers = ['ID', 'Title', 'Category', 'Status', 'Priority', 'Date Reported', 'Location'];
    const csvRows = [headers.join(',')];
    
    incidents.forEach(incident => {
      const date = incident.dateReported?.toDate ? incident.dateReported.toDate().toISOString() : 'N/A';
      const row = [
        incident.id,
        `"${incident.title.replace(/"/g, '""')}"`,
        incident.category,
        incident.status,
        incident.priority,
        date,
        `"${incident.location.replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'incidents_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Analytics Dashboard
        </h1>
        <Button onClick={handleExport}>Export to CSV</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Incidents Over Time
            </CardTitle>
            <CardDescription>
                Shows the number of incidents reported per day over the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentTimelineChart incidents={incidents} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Incidents by Category
            </CardTitle>
            <CardDescription>
                A breakdown of all incidents by their assigned category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentCategoryChart incidents={incidents} />
          </CardContent>
        </Card>
      </div>
       <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Incident Heatmap</CardTitle>
                 <CardDescription>
                    Geospatial visualization of incident hotspots.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                 <div className="mx-auto bg-primary/10 p-4 rounded-full">
                    <Map className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-headline">
                    View Interactive Map
                </h3>
                <p className="text-muted-foreground mb-4">
                    Go to the Map View to see an interactive visualization of all incidents.
                </p>
                <Link href="/map">
                  <Button>Go to Map</Button>
                </Link>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
