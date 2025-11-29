
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from "@/components/ui/badge";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function PostElectionConflictMonitoringPage() {
  const database = useDatabase();
  const hotspotsQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Public Disturbance')) : null,
    [database]
  );
  const { data: hotspots, isLoading } = useCollection<Incident>(hotspotsQuery);

  const getThreatLevel = (priority: string) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return 'High';
      case 'Medium':
        return 'Medium';
      default:
        return 'Low';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Post-Election Conflict Monitoring
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Conflict Hotspot Map</CardTitle>
          <CardDescription>Geographic overview of post-election tension areas.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
           <Map
                initialViewState={{
                latitude: -13.1339,
                longitude: 27.8493,
                zoom: 5
                }}
                style={{width: '100%', height: '100%'}}
                mapStyle="mapbox://styles/mapbox/light-v11"
                mapboxAccessToken="pk.eyJ1IjoiZW5vY2syMDAwIiwiYSI6ImNtaWEyZmFkZTBvbDMya3NlbnNoN3o0ZmcifQ.F7pia859U0ApvbVDoKp4AA"
            />
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Hotspot Areas</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : hotspots && hotspots.length > 0 ? (
                    hotspots.map((spot) => (
                        <div key={spot.id} className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <p className="font-bold">{typeof spot.location === 'object' ? spot.location.address : spot.location}</p>
                                <p className="text-sm text-muted-foreground">{spot.title}</p>
                            </div>
                            <Badge variant={getThreatLevel(spot.priority) === 'High' ? 'destructive' : 'secondary'}>{getThreatLevel(spot.priority)} Threat</Badge>
                        </div>
                    ))
                ) : (
                  <p className="text-center py-10">No conflict hotspots reported.</p>
                )}
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
