

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { useActionState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zambiaProvinces } from '@/lib/zambia-locations';
import { incidentCategories } from '@/lib/incident-categories';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { createDepartment } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type Department = {
    id: string;
    name: string;
    description: string;
    category: string;
}

const initialState = {
  success: false,
  message: "",
  issues: [],
  id: null
};

function SubmitButton() {
  const { pending } = (React as any).useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Department
    </Button>
  );
}


export default function DepartmentsPage() {
  const database = useDatabase();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [state, formAction] = useActionState(createDepartment, initialState);
  
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('');
  const [incidentTypes, setIncidentTypes] = useState<string[]>([]);
  

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Success",
          description: state.message,
        });
        setIsDialogOpen(false); // Close dialog on success
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: (
            <div>
              <p>{state.message}</p>
              {state.issues && state.issues.length > 0 && (
                <ul className="list-disc list-inside mt-2">
                  {state.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              )}
            </div>
          )
        });
      }
    }
  }, [state, toast]);

  const departmentsCollection = useMemoFirebase(
    () =>
      database && user
        ? query(ref(database, 'departments'), orderByChild('name'))
        : null,
    [database, user]
  );
  const { data: departments, isLoading: isDepartmentsLoading } =
    useCollection<Department>(departmentsCollection);
    
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Department Management
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Department
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form action={formAction}>
                <DialogHeader>
                  <DialogTitle>Create New Department</DialogTitle>
                  <DialogDescription>
                      Add a new department to the system. You can assign roles and staff later.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                    <h3 className="font-semibold text-lg">Core Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" value={category} onValueChange={setCategory}>
                                <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Police">Police</SelectItem>
                                    <SelectItem value="Fire">Fire</SelectItem>
                                    <SelectItem value="Ambulance">Ambulance</SelectItem>
                                    <SelectItem value="Council">Council</SelectItem>
                                    <SelectItem value="Health">Health</SelectItem>
                                    <SelectItem value="Disaster">Disaster</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     {category === 'Other' && (
                        <div className="space-y-2">
                            <Label htmlFor="otherCategory">Please Specify Category</Label>
                            <Input id="otherCategory" name="otherCategory" />
                        </div>
                    )}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="province">Province</Label>
                             <Select name="province" value={province} onValueChange={handleProvinceChange}>
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
                            <Select name="district" value={district} onValueChange={setDistrict} disabled={!province}>
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
                        <Input id="officeAddress" name="officeAddress" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="landline">Contact Number (Landline)</Label>
                        <Input id="landline" name="landline" />
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
                                        {incidentCategories.map((cat) => (
                                            <CommandItem
                                            key={cat}
                                            onSelect={() => handleIncidentTypesChange(cat)}
                                            >
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                incidentTypes.includes(cat) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {cat}
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
                        <Input id="operatingHours" name="operatingHours" placeholder="e.g., 24/7 or 9am-5pm"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="escalationRules">Escalation Rules</Label>
                        <Textarea id="escalationRules" name="escalationRules" placeholder="Describe rules for escalation..."/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priorityAssignmentRules">Priority Assignment Rules</Label>
                        <Textarea id="priorityAssignmentRules" name="priorityAssignmentRules" placeholder="Describe rules for priority assignment..."/>
                    </div>

                    {state.message && !state.success && (
                       <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {state.message}
                                {state.issues && state.issues.length > 0 && (
                                    <ul className="list-disc list-inside mt-2">
                                    {state.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                                    </ul>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                </div>
                <DialogFooter>
                    <SubmitButton />
                </DialogFooter>
              </form>
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
                                <CardDescription>{dept.category}</CardDescription>
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
    </div>
  );
}
