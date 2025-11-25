
'use client';

import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, UserPlus, Users, MapPin, BarChart2, Building, Phone, Clock, ShieldAlert, ListChecks, ArrowUpCircle, Package, PlusCircle, Home } from "lucide-react";
import Link from "next/link";
import { useDoc } from "@/firebase/database/use-doc";
import { ref } from "firebase/database"; // Removed unused push/update
import { useDatabase, useMemoFirebase } from "@/firebase";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zambiaProvinces } from "@/lib/zambia-locations";
import { addBranchToDepartment } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Branch = {
    id: string;
    name: string;
    province: string;
    district: string;
    address: string;
}

type Department = {
    id: string;
    name: string;
    category: string;
    province: string;
    district: string;
    officeAddress: string;
    contactNumbers: {
        landline: string;
        responders: string[];
    };
    operatingHours: string;
    escalationRules: string;
    priorityAssignmentRules: string;
    incidentTypesHandled: string[];
    branches?: Record<string, Branch>;
}

export default function DepartmentDetailPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);
  const database = useDatabase();
  const { toast } = useToast();

  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
      name: '',
      province: '',
      district: '',
      address: '',
  });

  const departmentRef = useMemoFirebase(
    () => (database ? ref(database, `departments/${id}`) : null),
    [database, id]
  );
  const { data: department, isLoading } = useDoc<Department>(departmentRef);

  const handleAddBranch = async () => {
        if (!newBranch.name || !newBranch.province || !newBranch.district) {
            toast({ title: "Error", description: "Branch name, province, and district are required.", variant: "destructive" });
            return;
        }

        const formData = new FormData();
        formData.append('departmentId', id);
        formData.append('name', newBranch.name);
        formData.append('province', newBranch.province);
        formData.append('district', newBranch.district);
        formData.append('address', newBranch.address);

        const result = await addBranchToDepartment({}, formData);
        
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });

        if (result.success) {
            setNewBranch({ name: '', province: '', district: '', address: '' });
            setIsBranchDialogOpen(false);
        }
   }
   
   const handleBranchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const { name, value } = e.target;
       setNewBranch(prev => ({...prev, [name]: value}));
   }

   const handleBranchSelectChange = (name: string) => (value: string) => {
        if (name === 'province') {
            setNewBranch(prev => ({ ...prev, province: value, district: '' }));
        } else {
            setNewBranch(prev => ({ ...prev, [name]: value }));
        }
   }

   const districtsForSelectedProvince = useMemo(() => {
        const selectedProvince = zambiaProvinces.find(p => p.name === newBranch.province);
        return selectedProvince ? selectedProvince.districts : [];
   }, [newBranch.province]);

   const branchesList = department?.branches ? Object.entries(department.branches).map(([branchId, branch]) => ({ ...branch, id: branchId })) : [];

   if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!department) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center space-x-4 mb-4">
         <Link href="/departments">
           <Button variant="outline" size="icon" className="h-8 w-8">
             <ArrowLeft className="h-4 w-4" />
             <span className="sr-only">Back</span>
           </Button>
         </Link>
         <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
            {department.name}
            </h1>
            <Badge variant="secondary">{department.category}</Badge>
         </div>
       </div>

        <Tabs defaultValue="overview">
            <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="branches">Branches</TabsTrigger>
                <TabsTrigger value="staff">Staff / Users</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Core Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> <strong>Location:</strong> {department.province}, {department.district}</div>
                            <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /> <strong>Address:</strong> {department.officeAddress || 'N/A'}</div>
                            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> <strong>Landline:</strong> {department.contactNumbers?.landline || 'N/A'}</div>
                            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> <strong>Hours:</strong> {department.operatingHours || 'N/A'}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Operational Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold flex items-center gap-2"><ListChecks className="h-4 w-4"/> Incident Types Handled</h4>
                                <p className="text-muted-foreground">{department.incidentTypesHandled?.join(', ') || 'Not specified'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2"><ArrowUpCircle className="h-4 w-4"/> Escalation Rules</h4>
                                <p className="text-muted-foreground">{department.escalationRules || 'Not specified'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2"><ShieldAlert className="h-4 w-4"/> Priority Assignment Rules</h4>
                                <p className="text-muted-foreground">{department.priorityAssignmentRules || 'Not specified'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="branches">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Branches</CardTitle>
                            <CardDescription>Manage the physical branches for this department.</CardDescription>
                        </div>
                        <Dialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Branch
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Branch</DialogTitle>
                                    <DialogDescription>Enter the details for the new branch.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="branch-name">Branch Name</Label>
                                        <Input id="branch-name" name="name" value={newBranch.name} onChange={handleBranchInputChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="branch-province">Province</Label>
                                            <Select value={newBranch.province} onValueChange={handleBranchSelectChange('province')}>
                                                <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
                                                <SelectContent>
                                                    {zambiaProvinces.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="branch-district">District</Label>
                                            <Select value={newBranch.district} onValueChange={handleBranchSelectChange('district')} disabled={!newBranch.province}>
                                                <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
                                                <SelectContent>
                                                    {districtsForSelectedProvince.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="branch-address">Address</Label>
                                        <Input id="branch-address" name="address" value={newBranch.address} onChange={handleBranchInputChange} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddBranch}>Add Branch</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {branchesList.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Branch Name</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {branchesList.map(branch => (
                                        <TableRow key={branch.id}>
                                            <TableCell className="font-medium">{branch.name}</TableCell>
                                            <TableCell>{branch.district}, {branch.province}</TableCell>
                                            <TableCell>{branch.address || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-10 min-h-[200px]">
                                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                                <Home className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="mt-4 text-xl font-headline">
                                No Branches Found
                            </h3>
                            <p className="text-muted-foreground">
                                Add your first branch to get started.
                            </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="staff">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Staff & Roles</CardTitle>
                         <Button>
                            <UserPlus className="mr-2 h-4 w-4"/>
                            Assign Staff
                        </Button>
                    </CardHeader>
                     <CardContent className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full">
                           <Users className="h-10 w-10 text-primary" />
                       </div>
                       <h3 className="mt-4 text-xl font-headline">
                           No Staff Assigned
                       </h3>
                       <p className="text-muted-foreground">
                           Assign staff members to this department to manage roles and permissions.
                       </p>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="assets">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Assets</CardTitle>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Asset
                        </Button>
                    </CardHeader>
                     <CardContent className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full">
                           <Package className="h-10 w-10 text-primary" />
                       </div>
                       <h3 className="mt-4 text-xl font-headline">
                           No Assets Found
                       </h3>
                       <p className="text-muted-foreground">
                           Track vehicles, equipment, and other assets for this department.
                       </p>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="performance">
                 <Card>
                    <CardHeader>
                        <CardTitle>Department Performance</CardTitle>
                    </CardHeader>
                     <CardContent className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                         <div className="mx-auto bg-primary/10 p-4 rounded-full">
                            <BarChart2 className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="mt-4 text-xl font-headline">
                            Performance Data Unavailable
                        </h3>
                        <p className="text-muted-foreground">
                            Performance analytics for this department will be available soon.
                        </p>
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>

    </div>
  );
}
