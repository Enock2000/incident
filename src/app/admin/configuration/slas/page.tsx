
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useCollection, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateSla, deleteSla } from '@/app/actions';
import type { Sla, IncidentType, Severity } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, Edit, Trash2, ArrowLeft } from 'lucide-react';
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

export default function SlasPage() {
    const database = useDatabase();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSla, setEditingSla] = useState<Sla | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [state, formAction] = useActionState(createOrUpdateSla, initialState);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Success", description: state.message });
                setIsFormOpen(false);
                setEditingSla(null);
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

    const slasCollection = useMemoFirebase(
        () => database ? query(ref(database, 'slas'), orderByChild('incidentTypeId')) : null,
        [database]
    );
    const { data: slas, isLoading: isLoadingSlas } = useCollection<Sla>(slasCollection);

    const incidentTypesCollection = useMemoFirebase(
        () => database ? query(ref(database, 'incidentTypes'), orderByChild('name')) : null,
        [database]
    );
    const { data: incidentTypes, isLoading: isLoadingIncidentTypes } = useCollection<IncidentType>(incidentTypesCollection);

    const severitiesCollection = useMemoFirebase(
        () => database ? query(ref(database, 'severities'), orderByChild('level')) : null,
        [database]
    );
    const { data: severities, isLoading: isLoadingSeverities } = useCollection<Severity>(severitiesCollection);

    const isLoading = isLoadingSlas || isLoadingIncidentTypes || isLoadingSeverities;

    const handleEditClick = (sla: Sla) => {
        setEditingSla(sla);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingSla(null);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const formData = new FormData();
        formData.append('id', deleteId);
        const result = await deleteSla(formData);
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
                        SLA Manager
                    </h1>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New SLA
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All SLAs</CardTitle>
                    <CardDescription>Manage the Service Level Agreements for incidents.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : slas && slas.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Incident Type</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Response Minutes</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {slas.map(sla => (
                                    <TableRow key={sla.id}>
                                        <TableCell className="font-medium">
                                            {incidentTypes?.find(it => it.id === sla.incidentTypeId)?.name || sla.incidentTypeId}
                                        </TableCell>
                                        <TableCell>
                                            {severities?.find(s => s.id === sla.severityId)?.name || sla.severityId}
                                        </TableCell>
                                        <TableCell>{sla.responseMinutes}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(sla)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(sla.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <p>No SLAs found. Click "Add New SLA" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if(!open) setEditingSla(null); }}>
                <DialogContent>
                    <SlaForm
                        key={editingSla?.id || 'new'} 
                        formAction={formAction} 
                        initialState={state} 
                        sla={editingSla}
                        incidentTypes={incidentTypes || []}
                        severities={severities || []}
                        onClose={() => setIsFormOpen(false)}
                    >
                        <SubmitButton>{editingSla ? 'Save Changes' : 'Create SLA'}</SubmitButton>
                    </SlaForm>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the SLA.
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

function SlaForm({ formAction, initialState, sla, incidentTypes, severities, onClose, children }: { formAction: any, initialState: any, sla?: Sla | null, incidentTypes: IncidentType[], severities: Severity[], onClose: () => void, children: React.ReactNode }) {
    return (
        <form action={formAction} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{sla ? 'Edit SLA' : 'Create New SLA'}</DialogTitle>
                <DialogDescription>
                    {sla ? 'Update the details for this SLA.' : 'Add a new SLA to the system.'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {sla && <input type="hidden" name="id" value={sla.id} />}
                
                <div className="space-y-2">
                    <Label htmlFor="incidentTypeId">Incident Type</Label>
                    <Select name="incidentTypeId" defaultValue={sla?.incidentTypeId}>
                        <SelectTrigger id="incidentTypeId"><SelectValue placeholder="Select an incident type..." /></SelectTrigger>
                        <SelectContent>
                            {incidentTypes.map(it => (
                                <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="severityId">Severity</Label>
                    <Select name="severityId" defaultValue={sla?.severityId}>
                        <SelectTrigger id="severityId"><SelectValue placeholder="Select a severity..." /></SelectTrigger>
                        <SelectContent>
                            {severities.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="responseMinutes">Response Minutes</Label>
                    <Input id="responseMinutes" name="responseMinutes" type="number" defaultValue={sla?.responseMinutes || 0} placeholder="0" />
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
