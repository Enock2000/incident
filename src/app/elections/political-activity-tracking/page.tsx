
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";
import { format } from 'date-fns';

export default function PoliticalActivityTrackingPage() {
  const database = useDatabase();
  const activitiesQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Political')) : null,
    [database]
  );
  const { data: activities, isLoading } = useCollection<Incident>(activitiesQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Political Activity Tracking
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Political Events</CardTitle>
          <CardDescription>A schedule of known political rallies, meetings, and other activities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">{activity.title}</h3>
                  <Badge variant={activity.priority === 'High' || activity.priority === 'Critical' ? 'destructive' : 'secondary'}>{activity.priority} Priority</Badge>
                </div>
                <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{typeof activity.location === 'object' ? activity.location.address : activity.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(activity.dateReported), 'PPP')}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10">No political activities reported.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
