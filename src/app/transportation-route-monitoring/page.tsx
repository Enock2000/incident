
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Truck, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const routes = [
    { id: "ROUTE-01", name: "Lusaka -> Chipata", status: "On Schedule", vehicle: "Scania Truck ZM-1234", driver: "John Banda" },
    { id: "ROUTE-02", name: "Kitwe -> Solwezi", status: "Delayed", vehicle: "FAW Truck ZM-5678", driver: "Mary Phiri" },
    { id: "ROUTE-03", name: "Livingstone -> Mongu", status: "On Schedule", vehicle: "Toyota Hilux ZM-9101", driver: "Peter Zulu" },
];

export default function TransportationRouteMonitoringPage() {
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
          {routes.map(route => (
            <div key={route.id} className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Truck className="h-8 w-8 text-primary"/>
                    <div>
                        <p className="font-bold text-lg">{route.name}</p>
                        <p className="text-sm text-muted-foreground">{route.vehicle} - {route.driver}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {route.status === "On Schedule" ? <CheckCircle className="text-green-500" /> : <AlertTriangle className="text-yellow-500" />}
                    <Badge variant={route.status === "Delayed" ? "secondary" : "default"}>{route.status}</Badge>
                </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
