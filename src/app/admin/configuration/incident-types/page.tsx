
'use client';

import { useState, useMemo, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useCollection, useDatabase, useMemoFirebase, useUser } from '@/firebase';
import { ref, query, orderByChild } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateIncidentType, deleteIncidentType } from '@/app/actions';
import type { IncidentType, Priority } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

export default function IncidentTypesPage() {
    const database = useDatabase();
    const { user } = useUser();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingType, setEditingType] = useState<IncidentType | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [state, formAction] = useActionState(createOrUpdateIncidentType, initialState);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Success", description: state.message });
                setIsFormOpen(false);
                setEditingType(null);
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

    const incidentTypesCollection = useMemoFirebase(
        () => database && user ? query(ref(database, 'incidentTypes'), orderByChild('order')) : null,
        [database, user]
    );

    const { data: incidentTypes, isLoading } = useCollection<IncidentType>(incidentTypesCollection);

    const { rootTypes, typesByParent } = useMemo(() => {
        const root: IncidentType[] = [];
        const byParent = new Map<string, IncidentType[]>();

        if (incidentTypes) {
            for (const type of incidentTypes) {
                if (type.parentId) {
                    if (!byParent.has(type.parentId)) {
                        byParent.set(type.parentId, []);
                    }
                    byParent.get(type.parentId)!.push(type);
                } else {
                    root.push(type);
                }
            }
        }
        return { rootTypes: root, typesByParent: byParent };
    }, [incidentTypes]);
    
    const renderTypeRows = (types: IncidentType[], level = 0) => {
        let allRows: JSX.Element[] = [];
        types.forEach(type => {
            allRows.push(
                <TableRow key={type.id}>
                    <TableCell style={{ paddingLeft: `${1 + level * 1.5}rem` }}>
                        <span className="flex items-center gap-2">
                         {level > 0 && <CornerDownRight className="h-4 w-4 text-muted-foreground" />}
                         <span className="font-medium">{type.name}</span>
                        </span>
                    </TableCell>
                    <TableCell>
                        <Badge variant={type.defaultSeverity === 'Critical' || type.defaultSeverity === 'High' ? 'destructive' : 'secondary'}>
                            {type.defaultSeverity}
                        </Badge>
                    </TableCell>
                    <TableCell>{type.order}</TableCell>
                    <TableCell>
                        <Badge variant={type.isEnabled ? 'default' : 'outline'}>
                            {type.isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(type)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(type.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                </TableRow>
            );
            const children = typesByParent.get(type.id);
            if (children) {
                allRows = allRows.concat(renderTypeRows(children, level + 1));
            }
        });
        return allRows;
    }


    const handleEditClick = (type: IncidentType) => {
        setEditingType(type);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingType(null);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const formData = new FormData();
        formData.append('id', deleteId);
        const result = await deleteIncidentType(formData);
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
                        Incident Category Manager
                    </h1>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Categories & Types</CardTitle>
                    <CardDescription>Manage the types and categories of incidents that can be reported.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : incidentTypes && incidentTypes.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Default Severity</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderTypeRows(rootTypes)}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <p>No incident types or categories found. Click "Add New" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if(!open) setEditingType(null); }}>
                <DialogContent>
                    <IncidentTypeForm 
                        key={editingType?.id || 'new'} 
                        formAction={formAction} 
                        initialState={state} 
                        incidentType={editingType}
                        allTypes={incidentTypes || []}
                        onClose={() => setIsFormOpen(false)}
                    >
                        <SubmitButton>{editingType ? 'Save Changes' : 'Create'}</SubmitButton>
                    </IncidentTypeForm>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category/type.
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

function IncidentTypeForm({ formAction, initialState, incidentType, allTypes, onClose, children }: { formAction: any, initialState: any, incidentType?: IncidentType | null, allTypes: IncidentType[], onClose: () => void, children: React.ReactNode }) {
    const [isEnabled, setIsEnabled] = useState(incidentType?.isEnabled ?? true);

    return (
        <form action={formAction} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{incidentType ? 'Edit Category / Type' : 'Create New Category / Type'}</DialogTitle>
                <DialogDescription>
                    {incidentType ? 'Update the details for this item.' : 'Add a new category or incident type to the system.'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {incidentType && <input type="hidden" name="id" value={incidentType.id} />}
                
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={incidentType?.name} placeholder="e.g., Security, or Assault" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="parentId">Parent Category</Label>
                        <Select name="parentId" defaultValue={incidentType?.parentId || ''}>
                            <SelectTrigger id="parentId"><SelectValue placeholder="None (Top-Level)" /></SelectTrigger>
                            <SelectContent>
                                {allTypes.filter(t => !t.parentId && t.id !== incidentType?.id).map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="defaultSeverity">Default Severity</Label>
                        <Select name="defaultSeverity" defaultValue={incidentType?.defaultSeverity} required>
                            <SelectTrigger id="defaultSeverity"><SelectValue placeholder="Select severity..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="order">Order</Label>
                    <Input id="order" name="order" type="number" defaultValue={incidentType?.order ?? 0} placeholder="0" />
                    <p className="text-xs text-muted-foreground">Items with lower numbers appear first.</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Switch id="isEnabled" name="isEnabled" checked={isEnabled} onCheckedChange={setIsEnabled} />
                    <Label htmlFor="isEnabled">Enable this item</Label>
                </div>
            </div>

            {initialState.message && !initialState.success && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {initialState.message}
                        {initialState.issues && initialState.issues.length > 0 && (
                            <ul className="list-disc list-inside mt-2">
                                {initialState.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                            </ul>
                        )}
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
