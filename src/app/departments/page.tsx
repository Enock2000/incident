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
  DialogTrigger,
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
  AlertDialogTrigger,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Department, IncidentType } from '@/lib/types';
import { PermissionGate } from '@/components/auth/permission-gate';

const departmentCategories = [
  { id: 'law_enforcement', name: 'Law Enforcement' },
  { id: 'emergency_response', name: 'Emergency Response' },
  { id: 'medical', name: 'Medical' },
  { id: 'administrative', name: 'Administrative' },
  { id: 'infrastructure', name: 'Infrastructure' },
  { id: 'social_services', name: 'Social Services' },
];

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

function DepartmentForm({ department, onSuccess }: { department?: Department, onSuccess?: () => void }) {
  const { toast } = useToast();
  const [province, setProvince] = useState(department?.province || '');
  const [district, setDistrict] = useState(department?.district || '');
  const [category, setCategory] = useState(department?.category || '');
  const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<string[]>(department?.incidentTypesHandled || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const database = useDatabase();
  const incidentTypesRef = useMemoFirebase(() => database ? query(ref(database, 'incidentTypes'), orderByChild('order')) : null, [database]);
  const { data: allIncidentTypes, isLoading: isLoadingTypes } = useCollection<IncidentType>(incidentTypesRef);

  // Filter only enabled types
  const enabledIncidentTypes = useMemo(() =>
    allIncidentTypes?.filter(t => t.isEnabled) || [],
    [allIncidentTypes]);

  const districtsForSelectedProvince = useMemo(() => {
    const selectedProvince = zambiaProvinces.find(p => p.name === province);
    return selectedProvince ? selectedProvince.districts : [];
  }, [province]);

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setDistrict('');
  };

  const handleIncidentTypesChange = (typeName: string) => {
    setSelectedIncidentTypes(prev => {
      const newTypes = prev.includes(typeName)
        ? prev.filter(c => c !== typeName)
        : [...prev, typeName];
      return newTypes;
    });
  };

  useEffect(() => {
    if (state.success) {
      toast({ title: "Success", description: state.message });
      if (onSuccess) onSuccess();
    }
  }, [state, toast, onSuccess]);

  return (
    <form action={formAction}>
      <DialogHeader>
        <DialogTitle>{department ? 'Edit Department' : 'Create New Department'}</DialogTitle>
        <DialogDescription>
          {department ? 'Update the details for this department.' : 'Add a new department to the system.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
        {department && <input type="hidden" name="id" value={department.id} />}

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={department?.name} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          {category === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="otherCategory">Please Specify Category</Label>
              <Input id="otherCategory" name="otherCategory" defaultValue={department?.category !== 'Other' ? '' : department?.category} />
            </div>
          )}
        </div>

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
          <Input id="landline" name="landline" defaultValue={department?.contactNumbers?.landline} />
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
                  {selectedIncidentTypes.length > 0 ? `${selectedIncidentTypes.length} selected` : 'Select incident types...'}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search incident types..." />
                <CommandEmpty>No incident type found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  <CommandList>
                    {isLoadingTypes ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : enabledIncidentTypes.map((type) => (
                      <CommandItem
                        key={type.id}
                        onSelect={() => handleIncidentTypesChange(type.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedIncidentTypes.includes(type.name) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {type.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedIncidentTypes.map(type => (
              <Badge key={type} variant="secondary">{type}</Badge>
            ))}
          </div>
          {selectedIncidentTypes.map(type => (
            <input key={type} type="hidden" name="incidentTypesHandled" value={type} />
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="operatingHours">Operating Hours</Label>
          <Input id="operatingHours" name="operatingHours" placeholder="e.g., 24/7 or 9am-5pm" defaultValue={department?.operatingHours} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="escalationRules">Escalation Rules</Label>
          <Textarea id="escalationRules" name="escalationRules" placeholder="Describe rules for escalation..." defaultValue={department?.escalationRules} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priorityAssignmentRules">Priority Assignment Rules</Label>
          <Textarea id="priorityAssignmentRules" name="priorityAssignmentRules" placeholder="Describe rules for priority assignment..." defaultValue={department?.priorityAssignmentRules} />
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
        <SubmitButton>{department ? 'Update Department' : 'Create Department'}</SubmitButton>
      </DialogFooter>
    </form>
  );
}

export default function DepartmentsPage() {
  const database = useDatabase();
  const departmentsRef = useMemoFirebase(() => database ? ref(database, 'departments') : null, [database]);
  const { data: departments, isLoading } = useCollection<Department>(departmentsRef);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Departments</h2>
        <div className="flex items-center space-x-2">
          <PermissionGate permission="departments.manage">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Department
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DepartmentForm onSuccess={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? <div className="col-span-full flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : departments?.map(dept => (
          <Card key={dept.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {dept.name}
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dept.category}</div>
              <p className="text-xs text-muted-foreground">
                {dept.province}, {dept.district}
              </p>
              <div className="mt-4 flex space-x-2">
                <Link href={`/departments/${dept.id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                <PermissionGate permission="departments.manage">
                  <Dialog open={editingDepartment?.id === dept.id} onOpenChange={(open) => setEditingDepartment(open ? dept : null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DepartmentForm department={dept} onSuccess={() => setEditingDepartment(null)} />
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the department and remove its data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            if (!database) return;
                            try {
                              const { ref, remove } = await import('firebase/database');
                              await remove(ref(database, `departments/${dept.id}`));
                              toast({ title: 'Success', description: 'Department deleted successfully' });
                            } catch (error: any) {
                              console.error('Delete error:', error);
                              toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete department' });
                            }
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </PermissionGate>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
