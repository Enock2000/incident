
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import {
  PlusCircle,
  Loader2,
  Building,
  Edit,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type Department = {
    id: string;
    name: string;
    description: string;
}

export default function DepartmentsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');


  const departmentsCollection = useMemoFirebase(
    () =>
      firestore && user
        ? query(collection(firestore, 'departments'), orderBy('name'))
        : null,
    [firestore, user]
  );
  const { data: departments, isLoading: isDepartmentsLoading } =
    useCollection<Department>(departmentsCollection);
    
  const handleCreateDepartment = async () => {
    if (!newDeptName.trim() || !newDeptDesc.trim()) {
        toast({ title: "Error", description: "Department name and description are required.", variant: "destructive" });
        return;
    }
    if (!departmentsCollection) return;

    try {
        await addDoc(collection(firestore, 'departments'), {
            name: newDeptName,
            description: newDeptDesc,
        });
        toast({ title: "Success", description: "Department created successfully." });
        setNewDeptName('');
        setNewDeptDesc('');
        setOpen(false);
    } catch (error) {
        console.error("Error creating department: ", error);
        toast({ title: "Error", description: "Failed to create department.", variant: "destructive" });
    }
  }


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Department Management
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Department
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
                <DialogDescription>
                    Add a new department to the system. You can assign roles and staff later.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                        Name
                        </Label>
                        <Input id="name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                        Description
                        </Label>
                        <Input id="description" value={newDeptDesc} onChange={(e) => setNewDeptDesc(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleCreateDepartment}>Create Department</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

       {isDepartmentsLoading ? (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : !departments || departments.length === 0 ? (
            <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
                <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                    <Building className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">
                    No Departments Found
                </CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground">
                    Get started by creating your first department.
                </p>
                </CardContent>
            </Card>
        ) : (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                    <Card key={dept.id}>
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="font-headline">{dept.name}</CardTitle>
                                <CardDescription>{dept.description}</CardDescription>
                            </div>
                             <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Manage roles, staff, and resources for this department.</p>
                             <Link href={`/departments/${dept.id}`}>
                                <Button variant="outline" className="w-full">
                                    Manage Department
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
             </div>
        )}
    </div>
  );
}

    