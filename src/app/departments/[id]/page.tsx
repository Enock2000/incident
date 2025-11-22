
'use client';

import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, UserPlus, Users, MapPin, BarChart2, Building, Phone, Clock, ShieldAlert, ListChecks, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { Badge } from "@/components/ui/badge";

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
  const firestore = useFirestore();

  const departmentRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "departments", params.id) : null),
    [firestore, params.id]
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
       
        <Card className="mb-6">
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

        <div className="grid gap-6 md:grid-cols-2">
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
             <Card>
                <CardHeader>
                    <CardTitle>Management</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4"/> Staff & Roles</h4>
                        <p className="text-muted-foreground mb-2">Assign roles and manage staff members for this department.</p>
                        <Button className="w-full">
                            <UserPlus className="mr-2 h-4 w-4"/>
                            Assign Staff
                        </Button>
                    </div>
                    <div>
                        <h4 className="font-semibold flex items-center gap-2"><BarChart2 className="h-4 w-4"/> Performance</h4>
                        <p className="text-muted-foreground mb-2">Track department performance and manage resources.</p>
                        <Button className="w-full">View Performance</Button>
                    </div>
                </CardContent>
            </Card>
        </div>

    </div>
  );
}
