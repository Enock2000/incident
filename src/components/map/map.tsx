'use client';

import * as React from 'react';
import Map, {Marker, Popup} from 'react-map-gl';
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

  return (
    <>
      <Map
        initialViewState={{
          latitude: 40,
          longitude: -100,
          zoom: 3.5,
          bearing: 0,
          pitch: 0
        }}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
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
                <div style={{color: 'white', cursor: 'pointer'}}>📍</div>
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