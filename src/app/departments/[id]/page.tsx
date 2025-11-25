

'use client';

import { getDepartmentById } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Building, Phone, Clock, ListChecks, ArrowUpCircle, ShieldAlert, Edit, PlusCircle, Home, UserPlus, Users, Package, BarChart2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addBranchToDepartment } from "@/app/actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zambiaProvinces } from "@/lib/zambia-locations";
import React, { useState, useMemo, useEffect } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import type { Department } from "@/lib/types";

interface DepartmentDetailsProps {
  params: { id: string };
}

export default function DepartmentDetailsPage({ params }: DepartmentDetailsProps) {
  const { id } = params;
  const [department, setDepartment] = useState< (Department & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartment() {
      setIsLoading(true);
      const dept = await getDepartmentById(id);
      setDepartment(dept);
      setIsLoading(false);
    }
    fetchDepartment();
  }, [id]);


  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!department) {
    notFound();
  }
  
  const branchesList = department?.branches ? Object.entries(department.branches).map(([branchId, branch]) => ({ ...branch, id: branchId })) : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center space-x-4 mb-4">
         <Link href="/departments" passHref>
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
         <div className="ml-auto">
            <Link href={`/departments/${id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Department
              </Button>
            </Link>
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
                        <AddBranchDialog departmentId={department.id} />
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
                            <div className="mt-4">
                                <AddBranchDialog departmentId={department.id} />
                            </div>
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


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Add Branch
    </Button>
  );
}


function AddBranchDialog({ departmentId }: { departmentId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const initialState = { success: false, message: "", issues: [] };
    const [state, formAction] = useFormState(addBranchToDepartment, initialState);

    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');

    const districtsForSelectedProvince = useMemo(() => {
        const selectedProvince = zambiaProvinces.find(p => p.name === province);
        return selectedProvince ? selectedProvince.districts : [];
    }, [province]);

    const handleProvinceChange = (value: string) => {
        setProvince(value);
        setDistrict('');
    };
    
    useEffect(() => {
        if(state.message) {
            if(state.success) {
                toast({ title: 'Success', description: state.message });
                setIsOpen(false);
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: state.message });
            }
        }
    }, [state, toast])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Branch
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Branch</DialogTitle>
                    <DialogDescription>
                        Create a new branch for this department.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="departmentId" value={departmentId} />
                    <div className="space-y-2">
                        <Label htmlFor="name">Branch Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Downtown Branch" />
                    </div>
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
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" placeholder="e.g., 123 Main St" />
                    </div>
                    <div className="flex justify-end">
                       <SubmitButton />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
