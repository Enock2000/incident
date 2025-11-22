
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
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zambiaProvinces } from '@/lib/zambia-locations';

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
  const [newDept, setNewDept] = useState({
    name: '',
    category: '',
    province: '',
    district: '',
    officeAddress: '',
    landline: '',
    operatingHours: '',
    escalationRules: '',
    priorityAssignmentRules: '',
  });


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
    if (!newDept.name.trim() || !newDept.category.trim() || !newDept.province.trim() || !newDept.district.trim()) {
        toast({ title: "Error", description: "Name, category, province and district are required.", variant: "destructive" });
        return;
    }
    if (!firestore) return;

    try {
        await addDoc(collection(firestore, 'departments'), {
            name: newDept.name,
            category: newDept.category,
            province: newDept.province,
            district: newDept.district,
            officeAddress: newDept.officeAddress,
            contactNumbers: {
                landline: newDept.landline,
                responders: []
            },
            operatingHours: newDept.operatingHours,
            escalationRules: newDept.escalationRules,
            priorityAssignmentRules: newDept.priorityAssignmentRules,
            incidentTypesHandled: []
        });
        toast({ title: "Success", description: "Department created successfully." });
        setNewDept({
            name: '',
            category: '',
            province: '',
            district: '',
            officeAddress: '',
            landline: '',
            operatingHours: '',
            escalationRules: '',
            priorityAssignmentRules: '',
        });
        setOpen(false);
    } catch (error) {
        console.error("Error creating department: ", error);
        toast({ title: "Error", description: "Failed to create department.", variant: "destructive" });
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewDept(prev => ({...prev, [name]: value}));
  }
  
  const handleSelectChange = (name: string) => (value: string) => {
      if (name === 'province') {
          setNewDept(prev => ({ ...prev, province: value, district: '' }));
      } else {
          setNewDept(prev => ({ ...prev, [name]: value }));
      }
  };

  const districtsForSelectedProvince = useMemo(() => {
    const selectedProvince = zambiaProvinces.find(p => p.name === newDept.province);
    return selectedProvince ? selectedProvince.districts : [];
  }, [newDept.province]);


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
            <DialogContent className="sm:max-w-[600px]">
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
                            <Input id="name" name="name" value={newDept.name} onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" value={newDept.category} onValueChange={handleSelectChange('category')}>
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
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="province">Province</Label>
                             <Select name="province" value={newDept.province} onValueChange={handleSelectChange('province')}>
                                <SelectTrigger><SelectValue placeholder="Select province..." /></SelectTrigger>
                                <SelectContent>
                                    {zambiaProvinces.map(province => (
                                        <SelectItem key={province.name} value={province.name}>{province.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="district">District</Label>
                            <Select name="district" value={newDept.district} onValueChange={handleSelectChange('district')} disabled={!newDept.province}>
                                <SelectTrigger><SelectValue placeholder="Select district..." /></SelectTrigger>
                                <SelectContent>
                                    {districtsForSelectedProvince.map(district => (
                                        <SelectItem key={district} value={district}>{district}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="officeAddress">Office Address</Label>
                        <Input id="officeAddress" name="officeAddress" value={newDept.officeAddress} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="landline">Contact Number (Landline)</Label>
                        <Input id="landline" name="landline" value={newDept.landline} onChange={handleInputChange} />
                    </div>

                    <h3 className="font-semibold text-lg mt-4 pt-4 border-t">Operational Settings</h3>
                     <div className="space-y-2">
                        <Label htmlFor="operatingHours">Operating Hours</Label>
                        <Input id="operatingHours" name="operatingHours" value={newDept.operatingHours} onChange={handleInputChange} placeholder="e.g., 24/7 or 9am-5pm"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="escalationRules">Escalation Rules</Label>
                        <Textarea id="escalationRules" name="escalationRules" value={newDept.escalationRules} onChange={handleInputChange} placeholder="Describe rules for escalation..."/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priorityAssignmentRules">Priority Assignment Rules</Label>
                        <Textarea id="priorityAssignmentRules" name="priorityAssignmentRules" value={newDept.priorityAssignmentRules} onChange={handleInputChange} placeholder="Describe rules for priority assignment..."/>
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
                                <CardDescription>{(dept as any).category}</CardDescription>
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

    