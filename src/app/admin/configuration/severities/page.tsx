
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useCollection, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateSeverity, deleteSeverity } from '@/app/actions';
import type { Severity } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function SeveritiesPage() {
    const database = useDatabase();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSeverity, setEditingSeverity] = useState<Severity | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [state, formAction] = useActionState(createOrUpdateSeverity, initialState);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Success", description: state.message });
                setIsFormOpen(false);
                setEditingSeverity(null);
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

    const severitiesCollection = useMemoFirebase(
        () => database ? query(ref(database, 'severities'), orderByChild('level')) : null,
        [database]
    );

    const { data: severities, isLoading } = useCollection<Severity>(severitiesCollection);

    const handleEditClick = (severity: Severity) => {
        setEditingSeverity(severity);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingSeverity(null);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const formData = new FormData();
        formData.append('id', deleteId);
        const result = await deleteSeverity(formData);
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
                        Severity Manager
                    </h1>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Severities</CardTitle>
                    <CardDescription>Manage the severity levels of incidents.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : severities && severities.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {severities.map(severity => (
                                    <TableRow key={severity.id}>
                                        <TableCell className="font-medium">{severity.name}</TableCell>
                                        <TableCell>{severity.level}</TableCell>
                                        <TableCell>{severity.color}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(severity)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(severity.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <p>No severities found. Click "Add New" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if(!open) setEditingSeverity(null); }}>
                <DialogContent>
                    <SeverityForm 
                        key={editingSeverity?.id || 'new'} 
                        formAction={formAction} 
                        initialState={state} 
                        severity={editingSeverity}
                        onClose={() => setIsFormOpen(false)}
                    >
                        <SubmitButton>{editingSeverity ? 'Save Changes' : 'Create'}</SubmitButton>
                    </SeverityForm>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the severity level.
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

function SeverityForm({ formAction, initialState, severity, onClose, children }: { formAction: any, initialState: any, severity?: Severity | null, onClose: () => void, children: React.ReactNode }) {
    return (
        <form action={formAction} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{severity ? 'Edit Severity' : 'Create New Severity'}</DialogTitle>
                <DialogDescription>
                    {severity ? 'Update the details for this severity level.' : 'Add a new severity level to the system.'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {severity && <input type="hidden" name="id" value={severity.id} />}
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={severity?.name} placeholder="e.g., High" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="level">Level</Label>
                        <Input id="level" name="level" type="number" defaultValue={severity?.level} placeholder="e.g., 3" required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" name="color" defaultValue={severity?.color} placeholder="e.g., red" />
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
