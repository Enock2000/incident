'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Incident } from "@/lib/types";
import { useMemo } from "react";
import { Activity, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface DepartmentMetricsProps {
    incidents: Incident[];
}

export function DepartmentMetrics({ incidents }: DepartmentMetricsProps) {
    const metrics = useMemo(() => {
        const total = incidents.length;
        const active = incidents.filter(i => !i.resolution).length;
        const resolved = incidents.filter(i => i.resolution).length;

        // Calculate average resolution time in hours
        const resolvedWithData = incidents.filter(i =>
            i.resolution && i.resolution.resolvedAt && i.dateReported
        );

        let avgResolutionTime = 0;
        if (resolvedWithData.length > 0) {
            const totalTime = resolvedWithData.reduce((sum, incident) => {
                const reported = new Date(incident.dateReported).getTime();
                const resolved = new Date(incident.resolution!.resolvedAt).getTime();
                return sum + (resolved - reported);
            }, 0);
            avgResolutionTime = Math.round((totalTime / resolvedWithData.length) / (1000 * 60 * 60)); // Convert to hours
        }

        const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

        return { total, active, resolved, avgResolutionTime, resolutionRate };
    }, [incidents]);

    return (
        <div className="grid gap-4 md:grid-cols-5">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.total}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                    <AlertCircle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.active}</div>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                    <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.resolved}</div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Resolution</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.avgResolutionTime}h</div>
                    <p className="text-xs text-muted-foreground">Response time</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.resolutionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Success rate</p>
                </CardContent>
            </Card>
        </div>
    );
}
