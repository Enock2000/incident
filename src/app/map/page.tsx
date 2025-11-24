
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useCollection } from '@/firebase/database/use-collection';
import { ref, query, orderByChild, equalTo, QueryConstraint } from 'firebase/database';
import { useDatabase, useUser, useMemoFirebase } from '@/firebase';
import type { Incident, IncidentStatus } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { InteractiveMap, type MapPin } from '@/components/map/map';
import { incidentCategories } from '@/lib/incident-categories';

export default function MapPage() {
    const database = useDatabase();
    const { user } = useUser();
    
    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
    });

    const incidentsCollection = useMemoFirebase(() => {
        if (!database || !user) return null;
        
        let queryRef: Query;
        if(filters.category !== 'all' && filters.status !== 'all') {
            // RTDB does not support multiple orderByChild calls.
            // This would require client-side filtering or a denormalized data structure.
            // For now, we will filter by status if both are selected.
            queryRef = query(ref(database, 'incidents'), orderByChild('status'), equalTo(filters.status));
        } else if (filters.category !== 'all') {
             queryRef = query(ref(database, 'incidents'), orderByChild('category'), equalTo(filters.category));
        } else if (filters.status !== 'all') {
             queryRef = query(ref(database, 'incidents'), orderByChild('status'), equalTo(filters.status));
        } else {
             queryRef = ref(database, 'incidents');
        }

        return queryRef;

    }, [database, user, filters]);
    
    const { data: incidents, isLoading: isIncidentsLoading } =
        useCollection<Incident>(incidentsCollection);

    const pins: MapPin[] = useMemo(() => {
        if (!incidents) return [];

        let filteredIncidents = incidents;
        // If we couldn't filter by both in the query, do the second filter on the client
         if (filters.category !== 'all' && filters.status !== 'all') {
            filteredIncidents = incidents.filter(i => i.category === filters.category);
        }

        return filteredIncidents
            .filter(incident => 
                incident.location && 
                typeof incident.location === 'object' &&
                'latitude' in incident.location &&
                'longitude' in incident.location &&
                typeof incident.location.latitude === 'number' && 
                typeof incident.location.longitude === 'number'
            )
            .map(incident => ({
                id: incident.id,
                longitude: incident.location.longitude,
                latitude: incident.location.latitude,
                label: incident.title,
                status: incident.status
            }));
    }, [incidents, filters]);

    const handleFilterChange = (filterName: 'category' | 'status') => (value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const statuses: IncidentStatus[] = ['Reported', 'Verified', 'Team Dispatched', 'In Progress', 'Resolved', 'Rejected'];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Incident Map
                </h1>
                
                {/* Filters Wrapper */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="w-full sm:w-[180px] space-y-1">
                        <Label htmlFor="filter-category" className="text-xs text-muted-foreground">Category</Label>
                        <Select 
                            name="filter-category" 
                            onValueChange={handleFilterChange('category')} 
                            defaultValue="all"
                        >
                            <SelectTrigger id="filter-category" className="h-9">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {incidentCategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                     <div className="w-full sm:w-[180px] space-y-1">
                        <Label htmlFor="filter-status" className="text-xs text-muted-foreground">Status</Label>
                        <Select 
                            name="filter-status" 
                            onValueChange={handleFilterChange('status')} 
                            defaultValue="all"
                        >
                            <SelectTrigger id="filter-status" className="h-9">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {statuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden">
                <CardContent className="p-0 relative h-[60vh] md:h-[70vh]">
                   {isIncidentsLoading && (
                     <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     </div>
                   )}
                   
                   <InteractiveMap pins={pins} />
                </CardContent>
            </Card>
        </div>
    );
}

    