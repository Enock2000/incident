"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  IncidentStatusBadge,
  PriorityBadge,
} from "@/components/incidents/incident-status-badge";
import { IncidentImagesDialog } from "@/components/incidents/incident-images-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  updateIncident,
  addInvestigationNote,
  assignResponder,
} from "@/app/actions";
import {
  FileImage,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
} from "lucide-react";
import type { Incident, InvestigationNote, UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

export function IncidentDetailClientPage({
  initialIncident,
}: {
  initialIncident: Incident;
}) {
  const { toast } = useToast();
  const { user } = useUser();

  const [incident, setIncident] = useState(initialIncident);
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp), "PPP p");
  };

  const handleFormAction = async (action: (formData: FormData) => Promise<any>, successMessage: string) => {
    return async (formData: FormData) => {
        const result = await action(formData);
        if (result?.success) {
            toast({ title: "Success", description: result.message || successMessage });
            // Re-fetch or update state if needed, for now we can just show a toast
        } else {
            toast({ title: "Error", description: result?.message || "An error occurred.", variant: "destructive" });
        }
    }
  }

  const sortedNotes = useMemo(() => {
    if (!incident.investigationNotes) return [];
    return Object.entries(incident.investigationNotes)
      .map(([key, value]) => ({...value, id: key}))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [incident.investigationNotes]);

  const responders: UserRole[] = ["responseUnit", "regionalAuthority", "admin"];

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{incident.title}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Description</Label>
              <p className="text-sm text-muted-foreground">
                {incident.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {typeof incident.location === "object"
                  ? incident.location.address
                  : incident.location}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Reported: {formatDate(incident.dateReported)}</span>
            </div>

            {incident.dateVerified && (
              <div className="flex items-center gap-2">
                <span>Verified: {formatDate(incident.dateVerified)}</span>
              </div>
            )}

            <div className="flex gap-4">
              <div>
                <Label>Status</Label>
                <IncidentStatusBadge status={incident.status} />
              </div>
              <div>
                <Label>Priority</Label>
                <PriorityBadge priority={incident.priority} />
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <p className="font-medium">{incident.category}</p>
            </div>
            
            {incident.reporter && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{incident.reporter.isAnonymous ? "Anonymous" : `Citizen Reporter (ID: ...${incident.reporter.userId?.slice(-4)})`}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentImagesDialog incident={incident}>
              <Button
                variant="outline"
                disabled={!incident.media || incident.media.length === 0}
              >
                <FileImage className="h-4 w-4 mr-2" />
                View Images ({incident.media?.length || 0})
              </Button>
            </IncidentImagesDialog>
          </CardContent>
        </Card>
      </div>

      {/* AI Flags */}
      {incident.aiMetadata &&
        (incident.aiMetadata.isDuplicate ||
          incident.aiMetadata.isSuspicious) && (
          <Card className="mt-6 border-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                AI Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incident.aiMetadata.isDuplicate && (
                <p>This report may be a duplicate.</p>
              )}
              {incident.aiMetadata.isSuspicious && (
                <p>This report has suspicious patterns.</p>
              )}
              {incident.aiMetadata.suggestedCategories &&
                incident.aiMetadata.suggestedCategories.length > 0 && (
                  <p>
                    Suggested categories:{" "}
                    {incident.aiMetadata.suggestedCategories.join(", ")}
                  </p>
                )}
            </CardContent>
          </Card>
        )}

      {/* Update Status & Priority */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Update Status / Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleFormAction(updateIncident, "Incident status updated.")} className="grid gap-4 md:grid-cols-3">
            <input name="incidentId" value={incident.id} type="hidden" />
            <div>
              <Label>Status</Label>
              <Select name="status" defaultValue={incident.status}>
                <SelectTrigger>
                  <SelectValue />
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
            </div>

            <div>
              <Label>Priority</Label>
              <Select name="priority" defaultValue={incident.priority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit">Update</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Assign Responder */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Assign Responder</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleFormAction(assignResponder, "Responder assigned.")} className="flex gap-4 items-end">
            <input name="incidentId" value={incident.id} type="hidden" />
            <div className="flex-1">
              <Label>Responder / Branch</Label>
              <Select name="responder" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose responder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Police">Police</SelectItem>
                  <SelectItem value="Fire">Fire Department</SelectItem>
                  <SelectItem value="Ambulance">Ambulance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Assign</Button>
          </form>
        </CardContent>
      </Card>

      {/* Investigation Notes */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Investigation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleFormAction(addInvestigationNote, "Note added.")} className="space-y-4">
            <input name="incidentId" value={incident.id} type="hidden" />
            {user && (
                <>
                  <input type="hidden" name="userId" value={user.uid} />
                  <input type="hidden" name="userName" value={user.displayName || user.email || 'Admin User'} />
                </>
            )}
            <Textarea name="note" placeholder="Add a note..." required />
            <Button type="submit">Add Note</Button>
          </form>

          <div className="mt-6 space-y-3">
            {sortedNotes.length > 0 ? (
              sortedNotes.map((note: InvestigationNote & {id: string}) => (
                <div key={note.id} className="border-l-4 border-primary pl-4">
                  <p className="text-sm font-medium">{note.authorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(note.timestamp)}
                  </p>
                  <p>{note.note}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No notes yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
