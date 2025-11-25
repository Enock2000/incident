
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from "@/components/ui/badge";

const hotspots = [
    { name: "Chawama Compound, Lusaka", level: "High", reports: 12, type: "Protests" },
    { name: "Chimwemwe, Kitwe", level: "Medium", reports: 5, type: "Clashes" },
    { name: "Monze Town", level: "Low", reports: 2, type: "Disputes" },
];

export default function PostElectionConflictMonitoringPage() {
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
                mapStyle="mapbox://styles/mapbox/dark-v11"
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
                {hotspots.map((spot, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <p className="font-bold">{spot.name}</p>
                            <p className="text-sm text-muted-foreground">{spot.reports} reports of {spot.type}</p>
                        </div>
                        <Badge variant={spot.level === 'High' ? 'destructive' : 'secondary'}>{spot.level} Threat</Badge>
                    </div>
                ))}
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
