'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Siren, ShieldAlert, Check, PlusCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const alerts = [
    { id: 'AL001', title: 'Suspicious Vehicle Near PS002', severity: 'High', area: 'Lusaka', status: 'Investigating', timestamp: '2024-08-16 09:30 AM' },
    { id: 'AL002', title: 'Crowd gathering at Kitwe Main Hall', severity: 'Medium', area: 'Copperbelt', status: 'Resolved', timestamp: '2024-08-16 09:15 AM' },
    { id: 'AL003', title: 'Report of voter intimidation', severity: 'High', area: 'Lusaka', status: 'Actioned', timestamp: '2024-08-16 08:45 AM' },
    { id: 'AL004', title: 'Power outage affecting multiple stations', severity: 'Low', area: 'Eastern', status: 'Resolved', timestamp: '2024-08-16 08:30 AM' },
];

const getSeverityBadge = (severity: string) => {
    switch (severity) {
        case 'High': return 'destructive';
        case 'Medium': return 'secondary';
        case 'Low': return 'default';
        default: return 'outline';
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Investigating': return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
        case 'Resolved': return <Check className="h-4 w-4 text-green-500" />;
        case 'Actioned': return <Siren className="h-4 w-4 text-blue-500" />;
        default: return null;
    }
}

export default function ElectionSecurityAlertsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Election Security Alerts
        </h1>
        <div className="flex gap-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Alert
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Security Alert</DialogTitle>
                        <DialogDescription>
                            Manually create an alert to be sent to relevant personnel.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Alert Title</Label>
                            <Input id="title" placeholder="e.g., Unrest reported at polling station" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" placeholder="Provide full details of the alert..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="severity">Severity</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select severity..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area">Affected Area/Province</Label>
                                <Input id="area" placeholder="e.g., Lusaka" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Alert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
             <Button variant="secondary">
                <Send className="mr-2 h-4 w-4" />
                Send Broadcast
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>Live feed of security alerts requiring attention.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Severity</TableHead>
                        <TableHead>Alert Title</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {alerts.map((alert) => (
                        <TableRow key={alert.id}>
                            <TableCell>
                                <Badge variant={getSeverityBadge(alert.severity)}>{alert.severity}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{alert.title}</TableCell>
                            <TableCell>{alert.area}</TableCell>
                            <TableCell>{alert.timestamp}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(alert.status)}
                                    {alert.status}
                                </div>
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
