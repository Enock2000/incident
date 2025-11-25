
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, MessageSquare, Shield, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const requests = [
    { id: "ESR-001", station: "Libala Primary", type: "Medical Assistance", status: "Responder Dispatched" },
    { id: "ESR-002", station: "Kamwala Secondary", type: "Security Backup", status: "Team En Route" },
    { id: "ESR-003", station: "Matero Hall", type: "Logistical Question", status: "Resolved" },
];


export default function PollingStaffEmergencySupportPage() {
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
                        <Phone className="mr-2"/> Call Helpline
                    </Button>
                     <Button variant="secondary" className="h-20 text-lg">
                        <Shield className="mr-2"/> Request Security
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
            {requests.map(req => (
                <div key={req.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                        <p className="font-bold">{req.type}</p>
                        <p className="text-sm text-muted-foreground">{req.station}</p>
                    </div>
                    <p className="font-semibold text-primary">{req.status}</p>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
