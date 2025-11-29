
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Shield, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';

export default function ElectionSecurityAlertsPage() {
  const database = useDatabase();
  const alertsQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Public Disturbance')) : null,
    [database]
  );
  const { data: alerts, isLoading } = useCollection<Incident>(alertsQuery);

  const getLevel = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'Critical';
      case 'High': return 'High';
      case 'Medium': return 'Medium';
      default: return 'Low';
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Election Security Alerts
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Live Security Feed</CardTitle>
          <CardDescription>Real-time security alerts from across the country.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : alerts && alerts.length > 0 ? (
            alerts.map(alert => (
              <div key={alert.id} className="border-l-4 p-4 rounded-r-lg bg-card" style={{ borderColor: alert.priority === 'Critical' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{alert.title}</h3>
                  <Badge variant={alert.priority === 'Critical' ? 'destructive' : 'secondary'}>{getLevel(alert.priority)}</Badge>
                </div>
                <p className="text-muted-foreground mt-1">{alert.description}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatDistanceToNow(new Date(alert.dateReported))} ago</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10">No security alerts at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
