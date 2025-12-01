'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Incident } from "@/lib/types";
import { useMemo } from "react";

interface StatusDistributionChartProps {
    incidents: Incident[];
}

const COLORS = {
    'Reported': '#94a3b8', // Slate 400
    'Verified': '#f59e0b', // Amber 500
    'Team Dispatched': '#3b82f6', // Blue 500
    'In Progress': '#8b5cf6', // Violet 500
    'Resolved': '#10b981', // Emerald 500
    'Rejected': '#ef4444', // Red 500
};

export function StatusDistributionChart({ incidents }: StatusDistributionChartProps) {
    const data = useMemo(() => {
        const statusCounts: Record<string, number> = {};

        incidents.forEach(inc => {
            const status = inc.status || 'Reported';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        return Object.entries(statusCounts)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0); // Only show statuses with data
    }, [incidents]);

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#cbd5e1'} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
