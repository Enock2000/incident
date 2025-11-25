'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query } from "firebase/database";
import type { UserProfile, Department } from "@/lib/types";
import { Loader2, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StaffPage() {
  const database = useDatabase();
  const [searchTerm, setSearchTerm] = useState("");

  const usersQuery = useMemoFirebase(() => database ? query(ref(database, 'users')) : null, [database]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const departmentsQuery = useMemoFirebase(() => database ? query(ref(database, 'departments')) : null, [database]);
  const { data: departments, isLoading: departmentsLoading } = useCollection<Department>(departmentsQuery);

  const departmentMap = useMemo(() => {
    if (!departments) return new Map();
    return new Map(departments.map(dept => [dept.id, dept.name]));
  }, [departments]);
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return 'U';
    if (!lastName) return firstName[0].toUpperCase();
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user =>
      (user.firstName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const isLoading = usersLoading || departmentsLoading;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Staff & Roles
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Staff</CardTitle>
          <CardDescription>View, search, and manage staff members across all departments.</CardDescription>
           <div className="pt-4">
             <Input 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
             />
           </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.photoURL} />
                          <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        {user.departmentId ? departmentMap.get(user.departmentId) || 'Unknown Dept.' : <span className="text-muted-foreground">Unassigned</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.userType === 'admin' ? 'destructive' : 'secondary'}>
                        {user.userType}
                      </Badge>
                    </TableCell>
                     <TableCell className="text-right">
                       <Link href={`/profile/${user.id}`}>
                          <Button variant="outline" size="sm">View Profile</Button>
                       </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                    <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-headline">
                    No Staff Found
                </h3>
                <p className="text-muted-foreground">
                    There are no users matching your search.
                </p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
