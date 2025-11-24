'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Users2, Clock, Hourglass } from "lucide-react";

const queueData = [
    { stationId: 'PS001', stationName: 'Lusaka Central Primary', queueLength: 35, waitTime: 15, throughput: 140 },
    { stationId: 'PS002', stationName: 'Northmead Secondary', queueLength: 78, waitTime: 30, throughput: 130 },
    { stationId: 'PS003', stationName: 'Libala High School', queueLength: 15, waitTime: 8, throughput: 110 },
    { stationId: 'PS004', stationName: 'Kitwe Main Hall', queueLength: 120, waitTime: 45, throughput: 160 },
];

export default function CrowdQueueManagementPage() {
  const avgWaitTime = queueData.reduce((acc, curr) => acc + curr.waitTime, 0) / queueData.length;
  const totalQueueLength = queueData.reduce((acc, curr) => acc + curr.queueLength, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">
        Crowd & Queue Management
      </h1>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total People in Queues</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQueueLength.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all monitored stations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWaitTime.toFixed(0)} mins</div>
            <p className="text-xs text-muted-foreground">Estimated average time to vote</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Station</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Kitwe Main Hall</div>
            <p className="text-xs text-muted-foreground">Currently the busiest station</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Live Queue Status</CardTitle>
            <CardDescription>Real-time data from polling stations on queue lengths and wait times.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Polling Station</TableHead>
                        <TableHead>Current Queue</TableHead>
                        <TableHead>Est. Wait Time (mins)</TableHead>
                        <TableHead>Voter Throughput (per hour)</TableHead>
                        <TableHead className="w-[150px]">Congestion Level</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {queueData.map((station) => (
                        <TableRow key={station.stationId}>
                            <TableCell className="font-medium">{station.stationName}</TableCell>
                            <TableCell>{station.queueLength}</TableCell>
                            <TableCell>{station.waitTime}</TableCell>
                            <TableCell>{station.throughput}</TableCell>
                            <TableCell>
                                <Progress value={(station.queueLength / 150) * 100} className="w-full" />
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
