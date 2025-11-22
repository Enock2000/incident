
'use client';

import * as React from 'react';
import Map, {Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { IncidentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZW5vY2syMDAwIiwiYSI6ImNtaWEyZmFkZTBvbDMya3NlbnNoN3o0ZmcifQ.F7pia859U0ApvbVDoKp4AA';

export interface MapPin {
  id: string;
  longitude: number;
  latitude: number;
  label: string;
  status: IncidentStatus;
}

export interface InteractiveMapProps {
  pins: MapPin[];
}

const statusColors: Record<IncidentStatus, string> = {
    Reported: "bg-gray-500",
    Verified: "bg-blue-500",
    "Team Dispatched": "bg-yellow-500",
    "In Progress": "bg-orange-500",
    Resolved: "bg-green-500",
    Rejected: "bg-red-500",
};


function Pin({ pin }: { pin: MapPin }) {
    const color = statusColors[pin.status] || "bg-gray-500";
    return (
        <div className={cn("w-3 h-3 rounded-full border-2 border-white shadow-md", color)}></div>
    );
}

export function InteractiveMap({pins}: InteractiveMapProps) {
  const [popupInfo, setPopupInfo] = React.useState<MapPin | null>(null);
  const [mapStyle, setMapStyle] = React.useState('mapbox://styles/mapbox/streets-v12');
  const router = useRouter();

  return (
    <>
       <div className="absolute top-3 left-3 z-10 bg-card rounded-md shadow-md">
            <select
                onChange={(e) => setMapStyle(e.target.value)}
                value={mapStyle}
                className="p-2 rounded-md bg-card text-card-foreground border-transparent focus:border-primary focus:ring-primary"
            >
                <option value="mapbox://styles/mapbox/streets-v12">Streets</option>
                <option value="mapbox://styles/mapbox/outdoors-v12">Outdoors</option>
                <option value="mapbox://styles/mapbox/light-v11">Light</option>
                <option value="mapbox://styles/mapbox/dark-v11">Dark</option>
                <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
                <option value="mapbox://styles/mapbox/satellite-streets-v12">Satellite Streets</option>
            </select>
        </div>
      <Map
        initialViewState={{
          latitude: -13.1339,
          longitude: 27.8493,
          zoom: 5,
          bearing: 0,
          pitch: 0
        }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{width: '100%', height: '100%'}}
      >
        <GeolocateControl position="top-right" />
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />
        <ScaleControl />
        {pins.map((pin) => (
            <Marker
                key={`marker-${pin.id}`}
                longitude={pin.longitude}
                latitude={pin.latitude}
                anchor="bottom"
                onClick={e => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo(pin);
                }}
            >
               <Pin pin={pin} />
            </Marker>
        ))}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
          >
            <div className='p-1 max-w-xs'>
              <h3 className="font-semibold text-base mb-1">{popupInfo.label}</h3>
              <button 
                onClick={() => router.push(`/incidents/${popupInfo.id}`)}
                className="text-sm text-primary hover:underline"
              >
                View Details
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </>
  );
}
