
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Swords, Eye, Map, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';


const incidents = [
    { id: 'VI001', category: 'Physical Assault', location: 'Lusaka', severity: 'High', status: 'Investigating', time: '10:30 AM' },
    { id: 'VI002', category: 'Voter Intimidation', location: 'Kitwe', severity: 'Medium', status: 'Actioned', time: '11:00 AM' },
    { id: 'VI003', category: 'Hate Speech', location: 'Ndola', severity: 'Medium', status: 'Resolved', time: '09:15 AM' },
    { id: 'VI004', category: 'Property Damage', location: 'Livingstone', severity: 'Low', status: 'Investigating', time: '12:00 PM' },
];

const chartData = [
  { location: "Lusaka", incidents: 5 },
  { location: "Copperbelt", incidents: 8 },
  { location: "Eastern", incidents: 2 },
  { location: "Southern", incidents: 4 },
  { location: "Western", incidents: 1 },
];

const chartConfig = {
  incidents: {
    label: 'Incidents',
    color: 'hsl(var(--destructive))',
  },
};


export default function ViolenceIntimidationMonitoringPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">
        Violence & Intimidation Monitoring
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5"/>
                Incidents by Province
            </CardTitle>
            <CardDescription>Number of violence & intimidation reports per province.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="location"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="incidents" fill="var(--color-incidents)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Incident Feed</CardTitle>
            <CardDescription>Real-time reports of violence and voter intimidation.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {incidents.map((incident) => (
                        <TableRow key={incident.id}>
                            <TableCell className="font-medium">{incident.category}</TableCell>
                            <TableCell>{incident.location}</TableCell>
                            <TableCell><Badge variant={incident.severity === 'High' ? 'destructive' : 'secondary'}>{incident.severity}</Badge></TableCell>
                            <TableCell>{incident.time}</TableCell>
                            <TableCell>{incident.status}</TableCell>
                            <TableCell className="text-right">
                                <Link href={`/incidents/${incident.id}`} passHref>
                                    <Button variant="ghost" size="icon">
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
    </div>
  );
}
