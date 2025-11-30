'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Incident } from "@/lib/types";
import { IncidentStatusBadge, PriorityBadge } from "@/components/incidents/incident-status-badge";
import { format } from "date-fns";
import Link from "next/link";
import { Eye, UserPlus, CheckCircle2 } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth-user";
import { assignIncidentToStaff } from "@/app/actions";
import { useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ResolutionIncidentTableProps {
    incidents: Incident[];
    showAssignButton?: boolean;
    showResolutionDetails?: boolean;
}

const initialState = { success: false, message: '' };

export function ResolutionIncidentTable({
    incidents,
    showAssignButton = false,
    showResolutionDetails = false
}: ResolutionIncidentTableProps) {
    const { user } = useAuthUser();

    if (incidents.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No incidents in this category
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported</TableHead>
                    {showResolutionDetails && <TableHead>Resolved</TableHead>}
                    {showResolutionDetails && <TableHead>Resolution Type</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {incidents.map((incident) => (
                    <TableRow key={incident.id}>
                        <TableCell className="font-medium">{incident.title}</TableCell>
                        <TableCell>{incident.category}</TableCell>
                        <TableCell>
                            <PriorityBadge priority={incident.priority} />
                        </TableCell>
                        <TableCell>
                            <IncidentStatusBadge status={incident.status} />
                        </TableCell>
                        <TableCell>
                            {incident.dateReported && format(new Date(incident.dateReported), 'PPp')}
                        </TableCell>
                        {showResolutionDetails && (
                            <TableCell>
                                {incident.resolution && format(new Date(incident.resolution.resolvedAt), 'PPp')}
                            </TableCell>
                        )}
                        {showResolutionDetails && (
                            <TableCell>
                                {incident.resolution && (
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        {incident.resolution.resolutionType}
                                    </div>
                                )}
                            </TableCell>
                        )}
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Link href={`/resolution-portal/${incident.id}`}>
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                </Link>
                                {showAssignButton && user && (
                                    <AssignToMeButton incidentId={incident.id} userId={user.id} userName={`${user.firstName} ${user.lastName}`} />
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function AssignToMeButton({ incidentId, userId, userName }: { incidentId: string; userId: string; userName: string }) {
    const [state, formAction] = useActionState(assignIncidentToStaff, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.success) {
            toast({ title: "Success", description: state.message });
        } else if (state.message) {
            toast({ title: "Error", description: state.message, variant: "destructive" });
        }
    }, [state, toast]);

    return (
        <form action={formAction}>
            <input type="hidden" name="incidentId" value={incidentId} />
            <input type="hidden" name="staffId" value={userId} />
            <input type="hidden" name="staffName" value={userName} />
            <Button type="submit" variant="default" size="sm">
                <UserPlus className="h-4 w-4 mr-1" />
                Assign to Me
            </Button>
        </form>
    );
}
