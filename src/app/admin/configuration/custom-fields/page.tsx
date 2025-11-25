
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useCollection, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateCustomField, deleteCustomField } from '@/app/actions';
import type { CustomField } from '@/lib/types';

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

export default function CustomFieldsPage() {
    const database = useDatabase();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingField, setEditingField] = useState<CustomField | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [state, formAction] = useActionState(createOrUpdateCustomField, initialState);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Success", description: state.message });
                setIsFormOpen(false);
                setEditingField(null);
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

    const fieldsCollection = useMemoFirebase(
        () => database ? query(ref(database, 'customFields'), orderByChild('name')) : null,
        [database]
    );

    const { data: fields, isLoading } = useCollection<CustomField>(fieldsCollection);

    const handleEditClick = (field: CustomField) => {
        setEditingField(field);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingField(null);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const formData = new FormData();
        formData.append('id', deleteId);
        const result = await deleteCustomField(formData);
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
                        Custom Fields
                    </h1>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Field
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Fields</CardTitle>
                    <CardDescription>Manage the custom fields for incidents.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : fields && fields.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Options</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map(field => (
                                    <TableRow key={field.id}>
                                        <TableCell className="font-medium">{field.name}</TableCell>
                                        <TableCell>{field.type}</TableCell>
                                        <TableCell>{field.options?.join(', ')}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(field)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(field.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <p>No fields found. Click "Add New Field" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if(!open) setEditingField(null); }}>
                <DialogContent>
                    <CustomFieldForm
                        key={editingField?.id || 'new'} 
                        formAction={formAction} 
                        initialState={state} 
                        field={editingField}
                        onClose={() => setIsFormOpen(false)}
                    >
                        <SubmitButton>{editingField ? 'Save Changes' : 'Create Field'}</SubmitButton>
                    </CustomFieldForm>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the field.
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

function CustomFieldForm({ formAction, initialState, field, onClose, children }: { formAction: any, initialState: any, field?: CustomField | null, onClose: () => void, children: React.ReactNode }) {
    const [type, setType] = useState(field?.type || 'text');

    return (
        <form action={formAction} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{field ? 'Edit Field' : 'Create New Field'}</DialogTitle>
                <DialogDescription>
                    {field ? 'Update the details for this field.' : 'Add a new custom field to the system.'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {field && <input type="hidden" name="id" value={field.id} />}
                
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={field?.name} placeholder="e.g., Number of injuries" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" defaultValue={type} onValueChange={setType}>
                        <SelectTrigger id="type"><SelectValue placeholder="Select a type..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {type === 'select' && (
                    <div className="space-y-2">
                        <Label htmlFor="options">Options</Label>
                        <Input id="options" name="options" defaultValue={field?.options?.join(', ')} placeholder="e.g., Option 1, Option 2" />
                    </div>
                )}
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
