
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Truck, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";

export default function TransportationRouteMonitoringPage() {
  const database = useDatabase();
  const routesQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Logistics Disruption')) : null,
    [database]
  );
  const { data: routes, isLoading } = useCollection<Incident>(routesQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Transportation Route Monitoring
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Live Vehicle Map</CardTitle>
          <CardDescription>Real-time GPS tracking of all logistics vehicles.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
            <Map
                initialViewState={{
                latitude: -13.1339,
                longitude: 27.8493,
                zoom: 5
                }}
                style={{width: '100%', height: '100%'}}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken="pk.eyJ1IjoiZW5vY2syMDAwIiwiYSI6ImNtaWEyZmFkZTBvbDMya3NlbnNoN3o0ZmcifQ.F7pia859U0ApvbVDoKp4AA"
            />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Routes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : routes && routes.length > 0 ? (
            routes.map(route => (
              <div key={route.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <Truck className="h-8 w-8 text-primary"/>
                      <div>
                          <p className="font-bold text-lg">{route.title}</p>
                          <p className="text-sm text-muted-foreground">{typeof route.location === 'object' ? route.location.address : route.location}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      {route.status === "Resolved" ? <CheckCircle className="text-green-500" /> : <AlertTriangle className="text-yellow-500" />}
                      <Badge variant={route.status === "Resolved" ? "default" : "secondary"}>{route.status}</Badge>
                  </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10">No active transportation issues.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
