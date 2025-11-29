
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users2, Clock, Hourglass, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild } from "firebase/database";
import type { PollingStation } from "@/lib/types";
import { useMemo } from "react";

export default function CrowdQueueManagementPage() {
  const database = useDatabase();

  const stationsQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'polling-stations')) : null,
    [database]
  );
  const { data: stations, isLoading } = useCollection<PollingStation>(stationsQuery);

  const stats = useMemo(() => {
    if (!stations || stations.length === 0) return {
      averageQueue: 0,
      waitTime: 0,
      busiestStation: 'N/A',
      chartData: []
    };

    const totalQueue = stations.reduce((acc, s) => acc + (s.queueLength || 0), 0);
    const averageQueue = Math.round(totalQueue / stations.length);

    // Estimate wait time: assume 2 mins per person
    const waitTime = averageQueue * 2;

    const sortedStations = [...stations].sort((a, b) => (b.queueLength || 0) - (a.queueLength || 0));
    const busiestStation = sortedStations[0]?.name || 'N/A';

    // Top 7 busy stations for chart
    const chartData = sortedStations.slice(0, 7).map(s => ({
      name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
      length: s.queueLength || 0,
      full_name: s.name
    }));

    return {
      averageQueue,
      waitTime,
      busiestStation,
      chartData
    };
  }, [stations]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Crowd & Queue Management
      </h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Queue Length</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageQueue} people</div>
            <p className="text-xs text-muted-foreground">across all monitored stations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waitTime} mins</div>
            <p className="text-xs text-muted-foreground">based on current throughput</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busiest Station</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={stats.busiestStation}>{stats.busiestStation}</div>
            <p className="text-xs text-muted-foreground">Highest voter traffic recorded</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Busiest Polling Stations</CardTitle>
          <CardDescription>Real-time view of stations with the longest queues.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} style={{ fontSize: '12px' }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="length" fill="hsl(var(--primary))" name="Queue Length" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
