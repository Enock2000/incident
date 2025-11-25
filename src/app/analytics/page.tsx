
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query } from 'firebase/database';
import type { Incident } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { IncidentCategoryChart } from '@/components/analytics/incident-category-chart';
import { IncidentTimelineChart } from '@/components/analytics/incident-timeline-chart';

export default function AnalyticsPage() {
  const database = useDatabase();
  const incidentsRef = useMemoFirebase(() => database ? query(ref(database, 'incidents')) : null, [database]);
  const { data: incidents, isLoading } = useCollection<Incident>(incidentsRef);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const chartIncidents = incidents || [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Incident Analytics
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentCategoryChart incidents={chartIncidents} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incident Timeline (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentTimelineChart incidents={chartIncidents} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
