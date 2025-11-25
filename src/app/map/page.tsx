
'use client';

import { InteractiveMap, type MapPin } from '@/components/map/map';
import { useCollection, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query } from 'firebase/database';
import type { Incident } from '@/lib/types';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';


export default function MapPage() {
  const database = useDatabase();

  const incidentsRef = useMemoFirebase(
    () => database ? query(ref(database, 'incidents')) : null,
    [database]
  );
  
  const { data: incidents, isLoading } = useCollection<Incident>(incidentsRef);

  const pins = useMemo((): MapPin[] => {
    if (!incidents) return [];
    return incidents
        .filter(incident => incident.location && typeof incident.location === 'object' && incident.location.latitude && incident.location.longitude)
        .map(incident => ({
            id: incident.id,
            latitude: incident.location.latitude,
            longitude: incident.location.longitude,
            label: incident.title,
            status: incident.status,
        }));
  }, [incidents]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Map...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <InteractiveMap pins={pins} />
    </div>
  );
}
