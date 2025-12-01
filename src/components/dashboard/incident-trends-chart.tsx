'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Incident } from "@/lib/types";
import { useMemo } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface IncidentTrendsChartProps {
    incidents: Incident[];
    days?: number;
}

export function IncidentTrendsChart({ incidents, days = 7 }: IncidentTrendsChartProps) {
    const data = useMemo(() => {
        const chartData = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(today, i);
            const start = startOfDay(date).getTime();
            const end = endOfDay(date).getTime();

            const count = incidents.filter(inc => {
                const incDate = inc.dateReported;
                return incDate >= start && incDate <= end;
            }).length;

            chartData.push({
                name: format(date, 'MMM dd'),
                incidents: count
            });
        }
        return chartData;
    }, [incidents, days]);

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Incident Trends (Last {days} Days)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="incidents"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorIncidents)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
