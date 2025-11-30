'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MapPin, TrendingUp, Clock, Phone } from "lucide-react";
import type { Incident, Department } from "@/lib/types";
import { useDatabase, useDoc, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface IncidentTrackingProps {
    incident: Incident;
}

export function IncidentTracking({ incident }: IncidentTrackingProps) {
    const database = useDatabase();

    const deptRef = useMemoFirebase(() =>
        database && incident.departmentId
            ? ref(database, `departments/${incident.departmentId}`)
            : null,
        [database, incident.departmentId]
    );

    const { data: department } = useDoc<Department>(deptRef);

    const currentBranch = incident.branchId && department?.branches
        ? department.branches[incident.branchId]
        : null;

    const escalations = incident.escalations ? Object.values(incident.escalations) : [];

    if (!incident.departmentId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Handling Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        This incident has not been assigned to a department yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Handling Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Department */}
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Building className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                        <div className="font-medium">Department</div>
                        <div className="text-sm">{department?.name || 'Loading...'}</div>
                        {department && (
                            <>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {department.province}, {department.district}
                                    {department.constituency && `, ${department.constituency}`}
                                </div>
                                {department.contactNumbers?.landline && (
                                    <div className="flex items-center gap-1 text-xs mt-1">
                                        <Phone className="h-3 w-3" />
                                        {department.contactNumbers.landline}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Branch */}
                {currentBranch && (
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <div className="font-medium">Assigned Branch</div>
                            <div className="text-sm">{currentBranch.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {currentBranch.province}, {currentBranch.district}
                                {currentBranch.constituency && `, ${currentBranch.constituency}`}
                            </div>
                            {currentBranch.contactNumber && (
                                <div className="flex items-center gap-1 text-xs mt-1">
                                    <Phone className="h-3 w-3" />
                                    {currentBranch.contactNumber}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Escalation History */}
                {escalations.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <div className="font-medium text-sm">Escalation History</div>
                            <Badge variant="secondary" className="text-xs">
                                {escalations.length}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            {escalations.map((esc, idx) => (
                                <div key={idx} className="text-sm p-2 bg-muted/30 rounded border-l-2 border-primary">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(esc.escalatedAt), 'PPp')}
                                    </div>
                                    <div className="font-medium">{esc.reason}</div>
                                    <div className="text-xs mt-1 text-muted-foreground">
                                        Escalated by: {esc.escalatedBy.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Status Badge */}
                <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge>{incident.status}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
