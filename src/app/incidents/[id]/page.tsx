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
import { ArrowLeft, Check, MapPin, User, X, Loader2, Lightbulb, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc, Timestamp } from "firebase/firestore";
import { useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Incident } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { addInvestigationNote, updateIncident } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { format } from "date-fns";


export default function IncidentDetailPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const notesFormRef = useRef<HTMLFormElement>(null);

  const incidentRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "incidents", params.id) : null),
    [firestore, params.id]
  );
  const { data: incident, isLoading } = useDoc<Incident>(incidentRef);

  const mapImage = PlaceHolderImages.find((img) => img.id === "map_placeholder");

  const handleManagementAction = async (formData: FormData) => {
    const result = await updateIncident(formData);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleAddNote = async (formData: FormData) => {
      const note = formData.get('note') as string;
      if (!note || note.trim() === '') {
          toast({ title: "Note cannot be empty.", variant: "destructive" });
          return;
      }
      const result = await addInvestigationNote(formData);
      toast({
          title: result.success ? "Success" : "Error",
          description: result.message,
          variant: result.success ? "default" : "destructive",
      });
      if (result.success) {
        notesFormRef.current?.reset();
      }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPpp');
  };

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
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {incident.location}
                    </span>
                    <Badge variant="secondary">{incident.category}</Badge>
                  </div>
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

                {incident.aiMetadata && (incident.aiMetadata.isDuplicate || incident.aiMetadata.isSuspicious) && (
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" />AI Analysis</h3>
                     <div className="text-destructive text-sm space-y-1 mt-2">
                        {incident.aiMetadata.isDuplicate && <p>This report might be a duplicate.</p>}
                        {incident.aiMetadata.isSuspicious && <p>This report has been flagged as potentially suspicious.</p>}
                     </div>
                  </div>
                )}
                
                {incident.aiMetadata?.suggestedCategories && incident.aiMetadata.suggestedCategories.length > 0 && (
                   <div>
                     <h3 className="font-semibold text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" />AI Suggested Categories</h3>
                     <div className="flex gap-2 mt-2">
                        {incident.aiMetadata.suggestedCategories.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
                     </div>
                   </div>
                )}


                {incident.reporter && (
                  <div>
                    <h3 className="font-semibold text-lg">Reporter</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{incident.reporter.isAnonymous ? "Anonymous" : (incident.reporter.name || "N/A")}</span>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">Photos</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {incident.media && incident.media.length > 0 ? incident.media.map((mediaUrl, index) => {
                      return (
                        <Image key={index} src={mediaUrl} alt={`Incident photo ${index + 1}`} width={300} height={200} className="rounded-lg object-cover" />
                      );
                    }) : <p className="text-muted-foreground text-sm">No photos were uploaded.</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Investigation Notes
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  {incident.investigationNotes && incident.investigationNotes.length > 0 ? (
                      <div className="space-y-4">
                          {incident.investigationNotes.map((note, index) => (
                              <div key={index} className="flex flex-col gap-1 text-sm border-b pb-2">
                                  <p className="text-foreground">{note.note}</p>
                                  <p className="text-xs text-muted-foreground">
                                      By {note.authorName} on {formatDate(note.timestamp)}
                                  </p>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-muted-foreground text-sm">No investigation notes yet.</p>
                  )}
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
               <form action={handleManagementAction} className="flex gap-2">
                   <input type="hidden" name="incidentId" value={incident.id} />
                   <Button type="submit" name="status" value="Verified" className="w-full bg-emerald-600 hover:bg-emerald-700">
                       <Check className="mr-2 h-4 w-4" /> Verify
                   </Button>
                   <Button type="submit" name="status" value="Rejected" variant="destructive" className="w-full">
                       <X className="mr-2 h-4 w-4" /> Reject
                   </Button>
               </form>

              <Separator />

              <form action={handleManagementAction} className="space-y-2">
                 <input type="hidden" name="incidentId" value={incident.id} />
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={incident.status} onValueChange={(value) => {
                    const formData = new FormData();
                    formData.append('incidentId', incident.id);
                    formData.append('status', value);
                    handleManagementAction(formData);
                }}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Set status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reported">Reported</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Team Dispatched">Team Dispatched</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </form>
               <form action={handleManagementAction} className="space-y-2">
                   <input type="hidden" name="incidentId" value={incident.id} />
                   <Label htmlFor="priority">Priority</Label>
                   <Select name="priority" defaultValue={incident.priority} onValueChange={(value) => {
                       const formData = new FormData();
                       formData.append('incidentId', incident.id);
                       formData.append('priority', value);
                       handleManagementAction(formData);
                   }}>
                       <SelectTrigger id="priority">
                           <SelectValue placeholder="Set priority" />
                       </SelectTrigger>
                       <SelectContent>
                           <SelectItem value="Low">Low</SelectItem>
                           <SelectItem value="Medium">Medium</SelectItem>
                           <SelectItem value="High">High</SelectItem>
                       </SelectContent>
                   </Select>
               </form>
              
              <Button className="w-full" disabled>Assign Responder</Button>
              
              <Separator />
              
              <form action={handleAddNote} ref={notesFormRef} className="space-y-2">
                  <input type="hidden" name="incidentId" value={incident.id} />
                  {user && (
                      <>
                          <input type="hidden" name="userId" value={user.uid} />
                          <input type="hidden" name="userName" value={user.displayName || user.email || 'Admin'} />
                      </>
                  )}
                  <Label htmlFor="notes">Investigation Notes</Label>
                  <Textarea id="notes" name="note" placeholder="Add notes for the response team..." rows={5} />
                  <Button className="w-full" type="submit" variant="secondary">Save Note</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
