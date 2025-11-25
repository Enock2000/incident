
'use client';

import { useCollection, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild } from 'firebase/database';
import type { AuditEntry } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuditLogsPage() {
    const database = useDatabase();

    const auditLogsCollection = useMemoFirebase(
        () => database ? query(ref(database, 'auditEntries'), orderByChild('timestamp')) : null,
        [database]
    );

    const { data: auditLogs, isLoading } = useCollection<AuditEntry>(auditLogsCollection);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center space-x-4">
                <Link href="/admin/configuration" passHref>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Configuration</span>
                    </Button>
                </Link>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Audit Logs
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Logs</CardTitle>
                    <CardDescription>View the audit logs for the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : auditLogs && auditLogs.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {auditLogs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>{log.user}</TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell>{log.details}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <p>No audit logs found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
