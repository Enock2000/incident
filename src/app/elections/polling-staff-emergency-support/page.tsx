'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, MessageSquare, Shield, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function PollingStaffEmergencySupportPage() {
  const database = useDatabase();
  const requestsQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Staff Support')) : null,
    [database]
  );
  const { data: requests, isLoading } = useCollection<Incident>(requestsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Polling Staff Emergency Support
      </h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Request immediate assistance.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="destructive" className="h-20 text-lg">
              <Phone className="mr-2" /> Call Helpline
            </Button>
            <Button variant="secondary" className="h-20 text-lg">
              <Shield className="mr-2" /> Request Security
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Send a Message to HQ</CardTitle>
            <CardDescription>For non-urgent matters and status updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Textarea placeholder="Type your message..." />
              <Button size="icon" className="h-full"><Send /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Support Requests</CardTitle>
          <CardDescription>Track the status of your emergency support requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : requests && requests.length > 0 ? (
              requests.map(req => (
                <div key={req.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-bold">{req.title}</p>
                    <p className="text-sm text-muted-foreground">{typeof req.location === 'object' ? req.location.address : req.location}</p>
                  </div>
                  <Badge variant={req.status === 'Resolved' ? 'default' : 'secondary'}>{req.status}</Badge>
                </div>
              ))
            ) : (
              <p className="text-center py-10">No support requests found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
