'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Phone, MessageSquare, PlusCircle } from "lucide-react";
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

export default function PollingStaffEmergencySupportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
            Polling Staff Emergency Support
        </h1>
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Request Support
                </Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Emergency Support Request</DialogTitle>
                    <DialogDescription>
                        Fill out this form to request immediate assistance. This will be treated as high priority.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="stationId">Polling Station ID</Label>
                            <Input id="stationId" placeholder="e.g., PS004" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportType">Type of Support</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="security">Security Threat</SelectItem>
                                    <SelectItem value="medical">Medical Emergency</SelectItem>
                                    <SelectItem value="logistical">Logistical Failure</SelectItem>
                                    <SelectItem value="other">Other Urgent Issue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="details">Details of Emergency</Label>
                        <Textarea id="details" placeholder="Briefly describe the situation..." />
                    </div>
                </div>
                 <DialogFooter>
                    <Button type="submit" variant="destructive">Submit Request</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

       <div className="grid md:grid-cols-2 gap-6">
           <Card className="flex flex-col items-center justify-center text-center p-6">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 p-4 rounded-full">
                        <Phone className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-headline">
                        Emergency Hotline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold tracking-wider">991</p>
                    <p className="text-muted-foreground mt-2">
                        For immediate voice assistance, call the emergency hotline.
                    </p>
                </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center p-6">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full">
                        <MessageSquare className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-headline">
                        Quick Chat Support
                    </CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground mb-4">
                        For less urgent matters, use the secure chat feature.
                    </p>
                    <Button>Launch Secure Chat</Button>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
