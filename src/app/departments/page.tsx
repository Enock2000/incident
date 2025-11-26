
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection } from '@/firebase/database/use-collection';
import { ref, query, orderByChild } from 'firebase/database';
import { useDatabase, useUser, useMemoFirebase } from '@/firebase';
import {
  PlusCircle,
  Loader2,
  Building,
  Edit,
  Trash2,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";
import { zambiaProvinces } from '@/lib/zambia-locations';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { createDepartment, updateDepartment, deleteDepartment } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Department, IncidentType } from '@/lib/types';


const initialState: { success: boolean; message: string; issues?: string[]; id?: string | null; } = {
  success: false,
  message: "",
  issues: [],
  id: null
};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}


export default function DepartmentsPage() {
  const database = useDatabase();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [createState, createFormAction] = useActionState(createDepartment, initialState);
  const [updateState, updateFormAction] = useActionState(updateDepartment, initialState);

 useEffect(() => {
    if (createState.success && createState.id) {
        toast({ title: "Success", description: createState.message });
        setIsCreateDialogOpen(false);
        router.push(`/departments/${createState.id}`);
    } else if (!createState.success && createState.message) {
        toast({
            variant: "destructive",
            title: "Error Creating Department",
            description: (
                <div>
                    <p>{createState.message}</p>
                    {createState.issues && createState.issues.length > 0 && (
                        <ul className="list-disc list-inside mt-2">{createState.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}</ul>
                    )}
                </div>
            )
        });
    }
  }, [createState, toast, router]);

  useEffect(() => {
    if (updateState.message) {
      if (updateState.success) {
        toast({ title: "Success", description: updateState.message });
        setIsEditDialogOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: (
            <div>
              <p>{updateState.message}</p>
              {updateState.issues && updateState.issues.length > 0 && (
                <ul className="list-disc list-inside mt-2">{updateState.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}</ul>
              )}
            </div>
          )
        });
      }
    }
  }, [updateState, toast]);
  
  const handleEditClick = (dept: Department) => {
    setEditingDepartment(dept);
    setIsEditDialogOpen(true);
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    const formData = new FormData();
    formData.append('id', deleteId);
    const result = await deleteDepartment(formData);
     if (result.success) {
        toast({ title: "Success", description: result.message });
        setDeleteId(null);
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
  }


  const departmentsCollection = useMemoFirebase(
    () =>
      database && user
        ? query(ref(database, 'departments'), orderByChild('name'))
        : null,
    [database, user]
  );
  const { data: departments, isLoading: isDepartmentsLoading } =
    useCollection<Department>(departmentsCollection);

  const incidentTypesCollection = useMemoFirebase(
      () => database ? query(ref(database, 'incidentTypes'), orderByChild('order')) : null,
      [database]
  );
  const { data: incidentTypes, isLoading: isTypesLoading } = useCollection<IncidentType>(incidentTypesCollection);

  const departmentCategories = useMemo(() => {
      if (!incidentTypes) return [];
      return incidentTypes.filter(type => !type.parentId && type.isEnabled);
  }, [incidentTypes]);
    

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Department Management
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Department
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DepartmentForm formAction={createFormAction} initialState={createState} departmentCategories={departmentCategories}>
                <SubmitButton>Create Department</SubmitButton>
              </DepartmentForm>
            </DialogContent>
        </Dialog>
      </div>

       {isDepartmentsLoading || isTypesLoading ? (
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
                                <CardDescription>{dept.category}</CardDescription>
                            </div>
                             <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(dept)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(dept.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Manage roles, staff, and resources for this department.</p>
                             <Link href={`/departments/${dept.id}`} passHref>
                                <Button variant="outline" className="w-full">
                                    Manage Department
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
             </div>
        )}
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
             <DialogContent className="sm:max-w-[600px]">
                <DepartmentForm
                    key={editingDepartment?.id}
                    formAction={updateFormAction}
                    initialState={updateState}
                    department={editingDepartment}
                    departmentCategories={departmentCategories}
                >
                    <SubmitButton>Save Changes</SubmitButton>
                </DepartmentForm>
             </DialogContent>
        </Dialog>

        {/* Delete Alert Dialog */}
         <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the department.
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


// Reusable Department Form Component
function DepartmentForm({ formAction, initialState, department, departmentCategories, children }: { formAction: any, initialState: any, department?: Department | null, departmentCategories: IncidentType[], children: React.ReactNode }) {
  const [province, setProvince] = useState(department?.province || '');
  const [district, setDistrict] = useState(department?.district || '');
  const [category, setCategory] = useState(department?.category || '');
  const [incidentTypes, setIncidentTypes] = useState<string[]>(department?.incidentTypesHandled || []);
  
  const districtsForSelectedProvince = useMemo(() => {
    const selectedProvince = zambiaProvinces.find(p => p.name === province);
    return selectedProvince ? selectedProvince.districts : [];
  }, [province]);

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setDistrict('');
  };

  const handleIncidentTypesChange = (selectedCategory: string) => {
    setIncidentTypes(prev => {
        const newTypes = prev.includes(selectedCategory)
            ? prev.filter(c => c !== selectedCategory)
            : [...prev, selectedCategory];
        return newTypes;
    });
  };
  
  return (
      <form action={formAction}>
        <DialogHeader>
          <DialogTitle>{department ? 'Edit Department' : 'Create New Department'}</DialogTitle>
          <DialogDescription>
              {department ? 'Update the details for this department.' : 'Add a new department to the system. You can assign roles and staff later.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            {department && <input type="hidden" name="id" value={department.id} />}
            <h3 className="font-semibold text-lg">Core Information</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={department?.name}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" value={category} onValueChange={setCategory} defaultValue={department?.category}>
                        <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                        <SelectContent>
                            {departmentCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             {category === 'Other' && (
                <div className="space-y-2">
                    <Label htmlFor="otherCategory">Please Specify Category</Label>
                    <Input id="otherCategory" name="otherCategory" defaultValue={department?.category !== 'Other' ? '' : department?.category} />
                </div>
            )}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                     <Select name="province" value={province} onValueChange={handleProvinceChange} defaultValue={department?.province}>
                        <SelectTrigger><SelectValue placeholder="Select province..." /></SelectTrigger>
                        <SelectContent>
                            {zambiaProvinces.map(p => (
                                <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Select name="district" value={district} onValueChange={setDistrict} disabled={!province} defaultValue={department?.district}>
                        <SelectTrigger><SelectValue placeholder="Select district..." /></SelectTrigger>
                        <SelectContent>
                            {districtsForSelectedProvince.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="officeAddress">Office Address</Label>
                <Input id="officeAddress" name="officeAddress" defaultValue={department?.officeAddress} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="landline">Contact Number (Landline)</Label>
                <Input id="landline" name="landline" defaultValue={department?.contactNumbers?.landline}/>
            </div>

            <h3 className="font-semibold text-lg mt-4 pt-4 border-t">Operational Settings</h3>
            <div className="space-y-2">
                <Label>Incident Types Handled</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        >
                        <span className="truncate">
                            {incidentTypes.length > 0 ? `${incidentTypes.length} selected` : 'Select incident types...'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                        <CommandInput placeholder="Search categories..." />
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                            <CommandList>
                                {departmentCategories.map((cat) => (
                                    <CommandItem
                                    key={cat.id}
                                    onSelect={() => handleIncidentTypesChange(cat.name)}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        incidentTypes.includes(cat.name) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {cat.name}
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
                 <div className="flex flex-wrap gap-2 mt-2">
                    {incidentTypes.map(type => (
                        <Badge key={type} variant="secondary">{type}</Badge>
                    ))}
                </div>
                {/* Hidden inputs for form submission */}
                {incidentTypes.map(type => (
                  <input key={type} type="hidden" name="incidentTypesHandled" value={type} />
                ))}
            </div>
             <div className="space-y-2">
                <Label htmlFor="operatingHours">Operating Hours</Label>
                <Input id="operatingHours" name="operatingHours" placeholder="e.g., 24/7 or 9am-5pm" defaultValue={department?.operatingHours}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="escalationRules">Escalation Rules</Label>
                <Textarea id="escalationRules" name="escalationRules" placeholder="Describe rules for escalation..." defaultValue={department?.escalationRules}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="priorityAssignmentRules">Priority Assignment Rules</Label>
                <Textarea id="priorityAssignmentRules" name="priorityAssignmentRules" placeholder="Describe rules for priority assignment..." defaultValue={department?.priorityAssignmentRules}/>
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

        </div>
        <DialogFooter>
            {children}
        </DialogFooter>
      </form>
  )
}

    