
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users2, Clock, Hourglass } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const queueData = [
  { name: '08:00', length: 35 },
  { name: '09:00', length: 50 },
  { name: '10:00', length: 80 },
  { name: '11:00', length: 120 },
  { name: '12:00', length: 100 },
  { name: '13:00', length: 90 },
  { name: '14:00', length: 75 },
];

export default function CrowdQueueManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Crowd & Queue Management
      </h1>
      <div className="grid gap-6 md:grid-cols-3">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Queue Length</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68 people</div>
            <p className="text-xs text-muted-foreground">across all monitored stations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 mins</div>
            <p className="text-xs text-muted-foreground">based on current throughput</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11:00 AM</div>
            <p className="text-xs text-muted-foreground">Highest voter traffic recorded</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Queue Length Over Time</CardTitle>
          <CardDescription>Visualize queue fluctuations throughout the day.</CardDescription>
        </CardHeader>
        <CardContent>
           <ResponsiveContainer width="100%" height={300}>
                <BarChart data={queueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="length" fill="hsl(var(--primary))" name="Queue Length" />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
