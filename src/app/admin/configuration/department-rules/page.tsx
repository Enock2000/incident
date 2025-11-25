
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useCollection, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateDepartmentRule, deleteDepartmentRule } from '@/app/actions';
import type { DepartmentRule, IncidentType, Department } from '@/lib/types';

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

export default function DepartmentRulesPage() {
    const database = useDatabase();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<DepartmentRule | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [state, formAction] = useActionState(createOrUpdateDepartmentRule, initialState);
    
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
        () => database ? query(ref(database, 'departmentRules'), orderByChild('incidentTypeId')) : null,
        [database]
    );
    const { data: rules, isLoading: isLoadingRules } = useCollection<DepartmentRule>(rulesCollection);

    const incidentTypesCollection = useMemoFirebase(
        () => database ? query(ref(database, 'incidentTypes'), orderByChild('name')) : null,
        [database]
    );
    const { data: incidentTypes, isLoading: isLoadingIncidentTypes } = useCollection<IncidentType>(incidentTypesCollection);

    const departmentsCollection = useMemoFirebase(
        () => database ? query(ref(database, 'departments'), orderByChild('name')) : null,
        [database]
    );
    const { data: departments, isLoading: isLoadingDepartments } = useCollection<Department>(departmentsCollection);

    const isLoading = isLoadingRules || isLoadingIncidentTypes || isLoadingDepartments;

    const handleEditClick = (rule: DepartmentRule) => {
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
        const result = await deleteDepartmentRule(formData);
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
                        Department Assignment Rules
                    </h1>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Rule
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Rules</CardTitle>
                    <CardDescription>Manage how incidents are assigned to departments.</CardDescription>
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
                                    <TableHead>Incident Type</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map(rule => (
                                    <TableRow key={rule.id}>
                                        <TableCell className="font-medium">
                                            {incidentTypes?.find(it => it.id === rule.incidentTypeId)?.name || rule.incidentTypeId}
                                        </TableCell>
                                        <TableCell>
                                            {departments?.find(d => d.id === rule.departmentId)?.name || rule.departmentId}
                                        </TableCell>
                                        <TableCell>{rule.priority}</TableCell>
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
                    <DepartmentRuleForm
                        key={editingRule?.id || 'new'} 
                        formAction={formAction} 
                        initialState={state} 
                        rule={editingRule}
                        incidentTypes={incidentTypes || []}
                        departments={departments || []}
                        onClose={() => setIsFormOpen(false)}
                    >
                        <SubmitButton>{editingRule ? 'Save Changes' : 'Create Rule'}</SubmitButton>
                    </DepartmentRuleForm>
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

function DepartmentRuleForm({ formAction, initialState, rule, incidentTypes, departments, onClose, children }: { formAction: any, initialState: any, rule?: DepartmentRule | null, incidentTypes: IncidentType[], departments: Department[], onClose: () => void, children: React.ReactNode }) {
    return (
        <form action={formAction} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{rule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
                <DialogDescription>
                    {rule ? 'Update the details for this rule.' : 'Add a new assignment rule to the system.'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {rule && <input type="hidden" name="id" value={rule.id} />}
                
                <div className="space-y-2">
                    <Label htmlFor="incidentTypeId">Incident Type</Label>
                    <Select name="incidentTypeId" defaultValue={rule?.incidentTypeId}>
                        <SelectTrigger id="incidentTypeId"><SelectValue placeholder="Select an incident type..." /></SelectTrigger>
                        <SelectContent>
                            {incidentTypes.map(it => (
                                <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="departmentId">Department</Label>
                    <Select name="departmentId" defaultValue={rule?.departmentId}>
                        <SelectTrigger id="departmentId"><SelectValue placeholder="Select a department..." /></SelectTrigger>
                        <SelectContent>
                            {departments.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input id="priority" name="priority" type="number" defaultValue={rule?.priority || 0} placeholder="0" />
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
