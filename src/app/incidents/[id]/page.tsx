
'use client';

import * as React from 'react';
import { useDatabase, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { ref } from "firebase/database";
import type { Incident, InvestigationNote, Priority, Responder, UserProfile } from "@/lib/types";
import { notFound, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, MapPin, Tag, ShieldAlert, Calendar, User, MessageSquare, Send, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IncidentStatusBadge, PriorityBadge } from "@/components/incidents/incident-status-badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { addInvestigationNote, updateIncident, assignResponder } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

interface IncidentDetailsPageProps {
  params: { id: string };
}

function IncidentDetails({ id }: { id: string }) {
  const database = useDatabase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const incidentRef = useMemoFirebase(() => database ? ref(database, `incidents/${id}`) : null, [database, id]);
  const { data: incident, isLoading } = useDoc<Incident>(incidentRef);

  const reporterId = incident?.reporter?.userId;
  const reporterRef = useMemoFirebase(() => database && reporterId ? ref(database, `users/${reporterId}`) : null, [database, reporterId]);
  const { data: reporterInfo } = useDoc<UserProfile>(reporterRef);

  const investigationNotes = incident?.investigationNotes ? Object.entries(incident.investigationNotes).map(([noteId, note]) => ({...(note as InvestigationNote), id: noteId})).sort((a,b) => b.timestamp - a.timestamp) : [];

  if (isLoading || isUserLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!incident) {
    notFound();
  }
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return format(date, "PPP p");
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
            {incident.title}
          </h1>
          <IncidentStatusBadge status={incident.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{incident.description}</p>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> <strong>Location:</strong> {typeof incident.location === 'object' ? incident.location.address : incident.location}</div>
                <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /> <strong>Category:</strong> {incident.category}</div>
                <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-muted-foreground" /> <strong>Priority:</strong> <PriorityBadge priority={incident.priority} /></div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> <strong>Reported:</strong> {formatDate(incident.dateReported)}</div>
                 <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> 
                    <strong>Reporter:</strong> 
                    {incident.reporter?.isAnonymous ? 'Anonymous' : (reporterInfo ? `${reporterInfo.firstName} ${reporterInfo.lastName}` : (incident.reporter?.userId || 'Unknown'))}
                </div>
              </div>
            </CardContent>
          </Card>

           {incident.aiMetadata && (incident.aiMetadata.suggestedCategories || incident.aiMetadata.isDuplicate || incident.aiMetadata.isSuspicious) && (
             <Alert>
               <Lightbulb className="h-4 w-4" />
               <AlertTitle>AI Analysis</AlertTitle>
               <AlertDescription>
                 {incident.aiMetadata.isDuplicate && <span className="font-semibold text-destructive">Flagged as potential duplicate. </span>}
                 {incident.aiMetadata.isSuspicious && <span className="font-semibold text-destructive">Flagged as suspicious. </span>}
                 {incident.aiMetadata.suggestedCategories && `Suggested categories: ${incident.aiMetadata.suggestedCategories.join(', ')}.`}
               </AlertDescription>
             </Alert>
           )}

          <Card>
            <CardHeader>
              <CardTitle>Investigation Notes</CardTitle>
              <CardDescription>Internal notes from the response team.</CardDescription>
            </CardHeader>
            <CardContent>
               <AddNoteForm incidentId={incident.id} user={userProfile} />
               <Separator className="my-6" />
                <div className="space-y-4">
                  {investigationNotes.length > 0 ? (
                    investigationNotes.map(note => (
                      <div key={note.id} className="flex gap-3">
                         <div className="flex-shrink-0"><MessageSquare className="h-5 w-5 text-muted-foreground" /></div>
                         <div>
                            <p className="text-sm">{note.note}</p>
                            <p className="text-xs text-muted-foreground mt-1">by {note.authorName} on {formatDate(note.timestamp)}</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No investigation notes yet.</p>
                  )}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Responder Actions</CardTitle>
              <CardDescription>Update status and priority.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <UpdateStatusForm incident={incident} />
              <AssignResponderForm incident={incident} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function IncidentDetailsPage({ params }: IncidentDetailsPageProps) {
    const { id } = params;
    return <IncidentDetails id={id} />;
}


function SubmitButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}


function AddNoteForm({ incidentId, user }: { incidentId: string, user: UserProfile | null }) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(addInvestigationNote, { success: false, message: "" });
    const formRef = React.useRef<HTMLFormElement>(null);

    useEffect(() => {
        if(state.message){
            if(state.success) {
                toast({title: 'Success', description: state.message});
                formRef.current?.reset();
            } else {
                toast({variant: 'destructive', title: 'Error', description: state.message});
            }
        }
    }, [state, toast])

    return (
         <form action={formAction} ref={formRef} className="space-y-2">
            <input type="hidden" name="incidentId" value={incidentId} />
            <input type="hidden" name="userId" value={user?.id || ''} />
            <input type="hidden" name="userName" value={`${user?.firstName} ${user?.lastName}` || 'System'} />
            <Textarea name="note" placeholder="Add an investigation note..." required/>
            <div className="flex justify-end">
                <SubmitButton size="sm"><Send className="mr-2 h-4 w-4" /> Add Note</SubmitButton>
            </div>
        </form>
    )
}

function UpdateStatusForm({ incident }: { incident: Incident }) {
    const [status, setStatus] = useState(incident.status);
    const [priority, setPriority] = useState(incident.priority);
    const { toast } = useToast();

    const handleFormAction = async (formData: FormData) => {
        const result = await updateIncident(formData);
        if (result.success) {
            toast({ title: "Success", description: "Incident updated successfully." });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    }

    return (
        <form action={handleFormAction} className="space-y-4">
            <input type="hidden" name="incidentId" value={incident.id} />
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={status} onValueChange={(val) => setStatus(val as Incident['status'])}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Reported">Reported</SelectItem>
                        <SelectItem value="Verified">Verified</SelectItem>
                        <SelectItem value="Team Dispatched">Team Dispatched</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" value={priority} onValueChange={(val) => setPriority(val as Priority)}>
                    <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <SubmitButton className="w-full">Update Incident</SubmitButton>
        </form>
    )
}

function AssignResponderForm({ incident }: { incident: Incident }) {
    const [responder, setResponder] = useState<string>(incident.assignedTo || '');
     const { toast } = useToast();

     const handleFormAction = async (formData: FormData) => {
        const result = await assignResponder(formData);
        if (result.success) {
            toast({ title: "Success", description: result.message });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    }

    return (
         <form action={handleFormAction} className="space-y-4 pt-4 border-t">
            <input type="hidden" name="incidentId" value={incident.id} />
            <div className="space-y-2">
                <Label htmlFor="responder">Assign Responder Team</Label>
                <Select name="responder" value={responder} onValueChange={setResponder}>
                    <SelectTrigger id="responder"><SelectValue placeholder="Select team..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Police">Police</SelectItem>
                        <SelectItem value="Fire">Fire Brigade</SelectItem>
                        <SelectItem value="Ambulance">Ambulance Service</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <SubmitButton className="w-full" variant="secondary" disabled={!responder}>Assign & Dispatch</SubmitButton>
        </form>
    )
}
