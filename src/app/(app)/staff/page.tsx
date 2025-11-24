

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection } from '@/firebase/database/use-collection';
import { ref, query, orderByChild, update } from 'firebase/database';
import { useDatabase, useUser, useMemoFirebase } from '@/firebase';
import { Loader2, Users, Check, Shield, Search, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, UserRole } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { zambiaProvinces } from '@/lib/zambia-locations';
import Link from 'next/link';


export default function StaffPage() {
  const database = useDatabase();
  const { user } = useUser();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
      province: 'all',
      district: 'all',
      role: 'all',
      department: 'all',
  });

  const usersCollection = useMemoFirebase(
    () =>
      database && user
        ? query(ref(database, 'users'), orderByChild('lastName'))
        : null,
    [database, user]
  );
  const { data: users, isLoading: isUsersLoading } = useCollection<UserProfile>(usersCollection);
  
  const departmentsCollection = useMemoFirebase(
    () =>
      database && user
        ? query(ref(database, 'departments'), orderByChild('name'))
        : null,
    [database, user]
  );
  const { data: departments } = useCollection<{id: string, name: string}>(departmentsCollection);


  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!database) return;
    try {
        const userDocRef = ref(database, `users/${userId}`);
        await update(userDocRef, { userType: newRole });
        toast({
            title: "Role Updated",
            description: `User role has been successfully changed to ${newRole}.`,
        });
    } catch (error) {
        console.error("Error updating role: ", error);
        toast({
            title: "Error",
            description: "Failed to update user role.",
            variant: "destructive",
        });
    }
  };
  
  const getInitials = (firstName: string, lastName: string) => {
      return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  }
  
  const userRoles: UserRole[] = ['citizen', 'admin', 'regionalAuthority', 'responseUnit', 'dataAnalyst'];

  const handleFilterChange = (filterName: string) => (value: string) => {
      setFilters(prev => {
          const newFilters = {...prev, [filterName]: value};
          if (filterName === 'province') {
              newFilters.district = 'all'; // Reset district when province changes
          }
          return newFilters;
      });
  };

  const districtsForSelectedProvince = useMemo(() => {
    const selectedProvince = zambiaProvinces.find(p => p.name === filters.province);
    return selectedProvince ? selectedProvince.districts : [];
  }, [filters.province]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(u => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            u.firstName?.toLowerCase().includes(searchTermLower) ||
            u.lastName?.toLowerCase().includes(searchTermLower) ||
            u.email?.toLowerCase().includes(searchTermLower) ||
            u.nrc?.toLowerCase().includes(searchTermLower);

        const matchesProvince = filters.province === 'all' || u.province === filters.province;
        const matchesDistrict = filters.district === 'all' || u.district === filters.district;
        const matchesRole = filters.role === 'all' || u.userType === filters.role;
        const matchesDepartment = filters.department === 'all' || u.departmentId === filters.department;

        return matchesSearch && matchesProvince && matchesDistrict && matchesRole && matchesDepartment;
    });
  }, [users, searchTerm, filters]);


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Staff & Role Management
        </h1>
      </div>

       {isUsersLoading ? (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : !users || users.length === 0 ? (
            <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
                <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                    <Users className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">
                    No Users Found
                </CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground">
                    There are no users in the system to manage yet.
                </p>
                </CardContent>
            </Card>
        ) : (
             <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>View and manage all registered users and their assigned roles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 flex flex-wrap gap-4">
                        <div className="relative flex-grow min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input 
                                placeholder="Search by name, email, or NRC..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filters.role} onValueChange={handleFilterChange('role')}>
                           <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by role..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {userRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filters.province} onValueChange={handleFilterChange('province')}>
                           <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by province..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Provinces</SelectItem>
                                {zambiaProvinces.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filters.district} onValueChange={handleFilterChange('district')} disabled={filters.province === 'all'}>
                           <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by district..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Districts</SelectItem>
                                {districtsForSelectedProvince.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select value={filters.department} onValueChange={handleFilterChange('department')}>
                           <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by department..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={(u as any).photoURL} />
                                                <AvatarFallback>{getInitials(u.firstName, u.lastName)}</AvatarFallback>
                                            </Avatar>
                                            <span>{u.firstName} {u.lastName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.userType === 'admin' ? 'destructive' : 'secondary'}>
                                            <div className="flex items-center gap-2">
                                                {u.userType === 'admin' && <Shield className="h-3 w-3"/>}
                                                {u.userType}
                                            </div>
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{u.province ? `${u.district}, ${u.province}` : 'N/A'}</TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                        <Select value={u.userType} onValueChange={(value) => handleRoleChange(u.id, value as UserRole)}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Change role..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userRoles.map(role => (
                                                     <SelectItem key={role} value={role}>{role}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Link href={`/staff/${u.id}`} passHref>
                                          <Button variant="outline" size="icon">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        )}
    </div>
  );
}
