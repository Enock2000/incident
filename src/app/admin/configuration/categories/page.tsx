
'use client';

import { useState, useMemo, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useCollection, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateCategory, deleteCategory } from '@/app/actions';
import type { Category } from '@/lib/types';

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

export default function CategoriesPage() {
    const database = useDatabase();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [state, formAction] = useActionState(createOrUpdateCategory, initialState);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Success", description: state.message });
                setIsFormOpen(false);
                setEditingCategory(null);
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

    const categoriesCollection = useMemoFirebase(
        () => database ? query(ref(database, 'categories'), orderByChild('name')) : null,
        [database]
    );

    const { data: categories, isLoading } = useCollection<Category>(categoriesCollection);

    const handleEditClick = (category: Category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const formData = new FormData();
        formData.append('id', deleteId);
        const result = await deleteCategory(formData);
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
                        Category Manager
                    </h1>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Categories</CardTitle>
                    <CardDescription>Manage the categories of incidents.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : categories && categories.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map(category => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(category)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(category.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <p>No categories found. Click "Add New" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if(!open) setEditingCategory(null); }}>
                <DialogContent>
                    <CategoryForm 
                        key={editingCategory?.id || 'new'} 
                        formAction={formAction} 
                        initialState={state} 
                        category={editingCategory}
                        onClose={() => setIsFormOpen(false)}
                    >
                        <SubmitButton>{editingCategory ? 'Save Changes' : 'Create'}</SubmitButton>
                    </CategoryForm>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category.
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

function CategoryForm({ formAction, initialState, category, onClose, children }: { formAction: any, initialState: any, category?: Category | null, onClose: () => void, children: React.ReactNode }) {
    return (
        <form action={formAction} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{category ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                <DialogDescription>
                    {category ? 'Update the details for this category.' : 'Add a new category to the system.'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {category && <input type="hidden" name="id" value={category.id} />}
                
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={category?.name} placeholder="e.g., Security" required />
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
