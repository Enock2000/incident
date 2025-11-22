
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Siren, ShieldAlert, Check, PlusCircle, Send, Loader2, AlertCircle as AlertCircleIcon } from "lucide-react";
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
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { format } from 'date-fns';

type ElectionSecurityAlert = {
    id: string;
    title: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    area: string;
    status: 'New' | 'Investigating' | 'Actioned' | 'Resolved' | 'Closed';
    timestamp: Timestamp;
}

const getSeverityBadge = (severity: string) => {
    switch (severity) {
        case 'High': return 'destructive';
        case 'Critical': return 'destructive';
        case 'Medium': return 'secondary';
        case 'Low': return 'default';
        default: return 'outline';
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Investigating': return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
        case 'Resolved': return <Check className="h-4 w-4 text-green-500" />;
        case 'Closed': return <Check className="h-4 w-4 text-green-500" />;
        case 'Actioned': return <Siren className="h-4 w-4 text-blue-500" />;
        default: return <ShieldAlert className="h-4 w-4 text-gray-500" />;
    }
}


export default function ElectionSecurityAlertsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const alertsCollection = useMemoFirebase(
    () =>
      firestore && user
        ? query(collection(firestore, 'artifacts/default-app-id/public/data/election-security-alerts'), orderBy('timestamp', 'desc'))
        : null,
    [firestore, user]
  );
  const { data: alerts, isLoading } = useCollection<ElectionSecurityAlert>(alertsCollection);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPpp');
  };


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
                                        <SelectItem value="Critical">Critical</SelectItem>
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
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : !alerts || alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full">
                        <AlertCircleIcon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="mt-4 text-xl font-headline">No Security Alerts</h3>
                    <p className="text-muted-foreground">There are no active security alerts at the moment.</p>
                </div>
            ) : (
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
                                <TableCell>{formatDate(alert.timestamp)}</TableCell>
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
            )}
        </CardContent>
      </Card>
    </div>
  );
}
