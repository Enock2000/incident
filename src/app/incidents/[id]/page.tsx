"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidentStatusBadge } from "@/components/incidents/incident-status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, MapPin, User, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { Incident } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function IncidentDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const incidentRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "incidents", params.id) : null),
    [firestore, params.id]
  );
  const { data: incident, isLoading } = useDoc<Incident>(incidentRef);

  const mapImage = PlaceHolderImages.find((img) => img.id === "map_placeholder");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!incident) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Incident Details
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-headline text-2xl mb-2">{incident.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {incident.location}
                  </CardDescription>
                </div>
                <IncidentStatusBadge status={incident.status} />
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Description</h3>
                  <p className="text-muted-foreground">{incident.description}</p>
                </div>
                {incident.reporter && (
                  <div>
                    <h3 className="font-semibold text-lg">Reporter</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{incident.reporter.name}</span>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">Photos</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {incident.media && incident.media.map((mediaUrl, index) => {
                      return (
                        <Image key={index} src={mediaUrl} alt={`Incident photo ${index + 1}`} width={300} height={200} className="rounded-lg object-cover" />
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              {mapImage && (
                <Image src={mapImage.imageUrl} alt={mapImage.description} width={800} height={600} className="w-full h-auto rounded-lg" data-ai-hint={mapImage.imageHint} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
              <CardDescription>Verify, assign, and update incident status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Check className="mr-2 h-4 w-4" /> Verify
                </Button>
                <Button variant="destructive" className="w-full">
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={incident.status}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Set status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reported">Reported</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Team Dispatched">Team Dispatched</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue={incident.priority}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Set priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full">Assign Responder</Button>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="notes">Investigation Notes</Label>
                <Textarea id="notes" placeholder="Add notes for the response team..." rows={5} />
              </div>
              <Button className="w-full" variant="secondary">Save Notes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
