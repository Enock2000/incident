'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/types";
import { Loader2, Mail, Building } from "lucide-react";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import type { Department } from "@/lib/types";
import { useMemo } from "react";

interface StaffTableProps {
    users: UserProfile[];
    isLoading: boolean;
}

export function StaffTable({ users, isLoading }: StaffTableProps) {
    const database = useDatabase();

    const departmentsRef = useMemoFirebase(() =>
        database ? ref(database, 'departments') : null,
        [database]
    );

    const { data: departments } = useCollection<Department>(departmentsRef);

    const departmentMap = useMemo(() => {
        if (!departments) return new Map();
        return new Map(departments.map(dept => [dept.id, dept.name]));
    }, [departments]);

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName) return 'U';
        if (!lastName) return firstName[0].toUpperCase();
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No staff members found
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
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
                        <TableCell>
                            {user.username ? (
                                <code className="text-sm bg-muted px-2 py-1 rounded">{user.username}</code>
                            ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {user.email}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                {user.departmentId ? (
                                    departmentMap.get(user.departmentId) || 'Unknown'
                                ) : (
                                    <span className="text-muted-foreground">Unassigned</span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={user.userType === 'regionalAuthority' ? 'default' : 'secondary'}>
                                {user.userType === 'responseUnit' ? 'Response Unit' : 'Regional Authority'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {user.phoneNumber || <span className="text-muted-foreground text-sm">N/A</span>}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
