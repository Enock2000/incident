
'use client';

import * as React from 'react';
import Map, {Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZW5vY2syMDAwIiwiYSI6ImNtaWEyZmFkZTBvbDMya3NlbnNoN3o0ZmcifQ.F7pia859U0ApvbVDoKp4AA';

export interface MapPin {
  longitude: number;
  latitude: number;
  label: string;
}

export interface InteractiveMapProps {
  pins: MapPin[];
}

export function InteractiveMap({pins}: InteractiveMapProps) {
  const [popupInfo, setPopupInfo] = React.useState<MapPin | null>(null);
  const [mapStyle, setMapStyle] = React.useState('mapbox://styles/mapbox/streets-v12');

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
      >
        <GeolocateControl position="top-right" />
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />
        <ScaleControl />
        {pins.map((pin, index) => (
            <Marker
                key={`marker-${index}`}
                longitude={pin.longitude}
                latitude={pin.latitude}
                anchor="bottom"
                onClick={e => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo(pin);
                }}
            >
                <div style={{color: 'red', cursor: 'pointer', fontSize: '24px'}}>📍</div>
            </Marker>
        ))}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
          >
            <div>
              {popupInfo.label}
            </div>
          </Popup>
        )}
      </Map>
    </>
  );
}
