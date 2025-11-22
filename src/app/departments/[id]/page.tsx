
'use client';

import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, UserPlus, Users, MapPin, BarChart2 } from "lucide-react";
import Link from "next/link";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase";

type Department = {
    id: string;
    name: string;
    description: string;
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
         <h1 className="text-3xl font-bold tracking-tight font-headline">
           {department.name}
         </h1>
       </div>
        <CardDescription>{department.description}</CardDescription>

        <Separator className="my-6" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Staff & Roles</CardTitle>
                    <CardDescription>Assign roles and manage staff members for this department.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button className="w-full">
                        <UserPlus className="mr-2 h-4 w-4"/>
                        Assign Staff
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Districts & Cities</CardTitle>
                    <CardDescription>Link this department to specific districts and cities for incident routing.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button className="w-full">Link Locations</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" /> Performance</CardTitle>
                    <CardDescription>Track department performance and manage resources.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">View Performance</Button>
                </CardContent>
            </Card>
        </div>

    </div>
  );
}

    