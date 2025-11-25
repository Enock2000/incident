
'use client';

import { useState, useEffect, useActionState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { useCollection, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateLocation, deleteLocation } from '@/app/actions';
import type { Location } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, Edit, Trash2, ArrowLeft, CornerDownRight } from 'lucide-react';
import Link from 'next/link';

const initialState: { success: boolean; message: string; issues?: string[]; } = {
  success: false,
  message: "",
};

function SubmitButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export default function LocationsPage() {
    const database = useDatabase();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [state, formAction] = useActionState(createOrUpdateLocation, initialState);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Success", description: state.message });
                setIsFormOpen(false);
                setEditingLocation(null);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: (
                        <div>
                            <p>{state.message}</p>
                            {state.issues && state.issues.length > 0 && (
                                <ul className="list-disc list-inside mt-2">{state.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}</ul>
                            )}
                        </div>
                    )
                });
            }
        }
    }, [state, toast]);

    const locationsCollection = useMemoFirebase(
        () => database ? query(ref(database, 'locations'), orderByChild('name')) : null,
        [database]
    );

    const { data: locations, isLoading } = useCollection<Location>(locationsCollection);

    const { rootLocations, locationsByParent } = useMemo(() => {
        const root: Location[] = [];
        const byParent = new Map<string, Location[]>();

        if (locations) {
            for (const location of locations) {
                if (location.parentId) {
                    if (!byParent.has(location.parentId)) {
                        byParent.set(location.parentId, []);
                    }
                    byParent.get(location.parentId)!.push(location);
                } else {
                    root.push(location);
                }
            }
        }
        return { rootLocations: root, locationsByParent: byParent };
    }, [locations]);

    const renderLocationRows = (locations: Location[], level = 0) => {
        let allRows: JSX.Element[] = [];
        locations.forEach(location => {
            allRows.push(
                <TableRow key={location.id}>
                    <TableCell style={{ paddingLeft: `${1 + level * 1.5}rem` }}>
                        <span className="flex items-center gap-2">
                         {level > 0 && <CornerDownRight className="h-4 w-4 text-muted-foreground" />}
                         <span className="font-medium">{location.name}</span>
                        </span>
                    </TableCell>
                    <TableCell>{location.type}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(location)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(location.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                </TableRow>
            );
            const children = locationsByParent.get(location.id);
            if (children) {
                allRows = allRows.concat(renderLocationRows(children, level + 1));
            }
        });
        return allRows;
    }

    const handleEditClick = (location: Location) => {
        setEditingLocation(location);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingLocation(null);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const formData = new FormData();
        formData.append('id', deleteId);
        const result = await deleteLocation(formData);
        if (result.success) {
            toast({ title: "Success", description: result.message });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setDeleteId(null);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/configuration" passHref>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Configuration</span>
                        </Button>
                    </Link>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">
                        Location Manager
                    </h1>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Locations</CardTitle>
                    <CardDescription>Manage the location hierarchy.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : locations && locations.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderLocationRows(rootLocations)}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <p>No locations found. Click "Add New" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if(!open) setEditingLocation(null); }}>
                <DialogContent>
                    <LocationForm 
                        key={editingLocation?.id || 'new'} 
                        formAction={formAction} 
                        initialState={state} 
                        location={editingLocation}
                        allLocations={locations || []}
                        onClose={() => setIsFormOpen(false)}
                    >
                        <SubmitButton>{editingLocation ? 'Save Changes' : 'Create'}</SubmitButton>
                    </LocationForm>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the location.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function LocationForm({ formAction, initialState, location, allLocations, onClose, children }: { formAction: any, initialState: any, location?: Location | null, allLocations: Location[], onClose: () => void, children: React.ReactNode }) {
    return (
        <form action={formAction} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{location ? 'Edit Location' : 'Create New Location'}</DialogTitle>
                <DialogDescription>
                    {location ? 'Update the details for this location.' : 'Add a new location to the system.'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {location && <input type="hidden" name="id" value={location.id} />}
                
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={location?.name} placeholder="e.g., Lusaka" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" defaultValue={location?.type}>
                            <SelectTrigger id="type"><SelectValue placeholder="Select type..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="province">Province</SelectItem>
                                <SelectItem value="district">District</SelectItem>
                                <SelectItem value="ward">Ward</SelectItem>
                                <SelectItem value="village">Village</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="parentId">Parent Location</Label>
                        <Select name="parentId" defaultValue={location?.parentId || ''}>
                            <SelectTrigger id="parentId"><SelectValue placeholder="None (Top-Level)" /></SelectTrigger>
                            <SelectContent>
                                {allLocations.filter(l => l.id !== location?.id).map(loc => (
                                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {initialState.message && !initialState.success && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {initialState.message}
                    </AlertDescription>
                </Alert>
            )}

            <DialogFooter>
                <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                {children}
            </DialogFooter>
        </form>
    );
}
