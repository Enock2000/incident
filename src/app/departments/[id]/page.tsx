
'use client';

import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, UserPlus, Users, MapPin, BarChart2, Building, Phone, Clock, ShieldAlert, ListChecks, ArrowUpCircle, Package, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useDoc } from "@/firebase/database/use-doc";
import { ref } from "firebase/database";
import { useDatabase, useMemoFirebase } from "@/firebase";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}


export default function DepartmentDetailPage({ params }: { params: { id: string } }) {
  const database = useDatabase();

  const departmentRef = useMemoFirebase(
    () => (database ? ref(database, `departments/${params.id}`) : null),
    [database, params.id]
  );
  const { data: department, isLoading } = useDoc<Department>(departmentRef);

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
    

    