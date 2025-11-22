'use client';
import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Incident } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { InteractiveMap } from '@/components/map/map';

export default function MapPage() {
    const firestore = useFirestore();
    const { user } = useUser();

    const incidentsCollection = useMemoFirebase(
        () =>
        firestore && user
            ? query(collection(firestore, 'incidents'))
            : null,
        [firestore, user]
    );
    const { data: incidents, isLoading: isIncidentsLoading } =
        useCollection<Incident>(incidentsCollection);

    const pins = useMemo(() => {
        if (!incidents) return [];
        return incidents.map(incident => ({
            longitude: incident.location.longitude,
            latitude: incident.location.latitude,
            label: incident.description,
        }));
    }, [incidents]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Incident Map
                </h1>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="filter-category" className="text-xs">Category</Label>
                        <Select name="filter-category">
                            <SelectTrigger id="filter-category" className="h-9">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Crime">Crime</SelectItem>
                                <SelectItem value="Fire">Fire</SelectItem>
                                <SelectItem value="Road Accident">Road Accident</SelectItem>
                                <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex-1 space-y-1">
                        <Label htmlFor="filter-status" className="text-xs">Status</Label>
                        <Select name="filter-status">
                            <SelectTrigger id="filter-status" className="h-9">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Reported">Reported</SelectItem>
                                <SelectItem value="Verified">Verified</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <Card>
                <CardContent className="p-0 relative h-[60vh] md:h-[70vh]">
                   {isIncidentsLoading && (
                     <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     </div>
                   )}
                   <InteractiveMap pins={pins} />
                </CardContent>
            </Card>
        </div>
    );
}
