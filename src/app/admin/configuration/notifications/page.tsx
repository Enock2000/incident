
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useCollection, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateNotificationRule, deleteNotificationRule } from '@/app/actions';
import type { NotificationRule, IncidentType } from '@/lib/types';

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

export default function NotificationRulesPage() {
    const database = useDatabase();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [state, formAction] = useActionState(createOrUpdateNotificationRule, initialState);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Success", description: state.message });
                setIsFormOpen(false);
                setEditingRule(null);
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

    const rulesCollection = useMemoFirebase(
        () => database ? query(ref(database, 'notificationRules'), orderByChild('name')) : null,
        [database]
    );
    const { data: rules, isLoading: isLoadingRules } = useCollection<NotificationRule>(rulesCollection);

    const incidentTypesCollection = useMemoFirebase(
        () => database ? query(ref(database, 'incidentTypes'), orderByChild('name')) : null,
        [database]
    );
    const { data: incidentTypes, isLoading: isLoadingIncidentTypes } = useCollection<IncidentType>(incidentTypesCollection);

    const isLoading = isLoadingRules || isLoadingIncidentTypes;

    const handleEditClick = (rule: NotificationRule) => {
        setEditingRule(rule);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingRule(null);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const formData = new FormData();
        formData.append('id', deleteId);
        const result = await deleteNotificationRule(formData);
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
                        Notification Rules
                    </h1>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Rule
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Rules</CardTitle>
                    <CardDescription>Manage the automated notification rules.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : rules && rules.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Channels</TableHead>
                                    <TableHead>Incident Types</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map(rule => (
                                    <TableRow key={rule.id}>
                                        <TableCell className="font-medium">{rule.name}</TableCell>
                                        <TableCell>{rule.channels.join(', ')}</TableCell>
                                        <TableCell>
                                            {rule.incidentTypes.map(itId => incidentTypes?.find(it => it.id === itId)?.name || itId).join(', ')}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(rule)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(rule.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <p>No rules found. Click "Add New Rule" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if(!open) setEditingRule(null); }}>
                <DialogContent>
                    <NotificationRuleForm
                        key={editingRule?.id || 'new'} 
                        formAction={formAction} 
                        initialState={state} 
                        rule={editingRule}
                        incidentTypes={incidentTypes || []}
                        onClose={() => setIsFormOpen(false)}
                    >
                        <SubmitButton>{editingRule ? 'Save Changes' : 'Create Rule'}</SubmitButton>
                    </NotificationRuleForm>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the rule.
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

function NotificationRuleForm({ formAction, initialState, rule, incidentTypes, onClose, children }: { formAction: any, initialState: any, rule?: NotificationRule | null, incidentTypes: IncidentType[], onClose: () => void, children: React.ReactNode }) {
    return (
        <form action={formAction} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{rule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
                <DialogDescription>
                    {rule ? 'Update the details for this rule.' : 'Add a new notification rule to the system.'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {rule && <input type="hidden" name="id" value={rule.id} />}
                
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={rule?.name} placeholder="e.g., High Priority Alerts" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="channels">Channels</Label>
                    <Input id="channels" name="channels" defaultValue={rule?.channels.join(', ')} placeholder="e.g., sms, email" required />
                </div>

                <div className="space-y-2">
                    <Label>Incident Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {incidentTypes.map(it => (
                            <div key={it.id} className="flex items-center space-x-2">
                                <input type="checkbox" id={`it-${it.id}`} name="incidentTypes" value={it.id} defaultChecked={rule?.incidentTypes.includes(it.id)} />
                                <Label htmlFor={`it-${it.id}`}>{it.name}</Label>
                            </div>
                        ))}
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
