"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createIncident, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/componentsui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const initialState: FormState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Submit Report
    </Button>
  );
}

export function ReportIncidentForm() {
  const [state, formAction] = useFormState(createIncident, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message && state.issues) {
      toast({
        variant: "destructive",
        title: state.message,
        description: (
          <ul className="list-disc pl-5">
            {state.issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        ),
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Incident Title</Label>
        <Input id="title" name="title" placeholder="e.g., Power outage in Mandevu" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Provide a detailed description of the incident..." required rows={6} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" placeholder="e.g., Lusaka, Zambia" required />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="media">Photos/Videos</Label>
        <Input id="media" name="media" type="file" />
        <p className="text-sm text-muted-foreground">
          You can upload relevant photos or videos.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="isAnonymous" name="isAnonymous" />
        <Label htmlFor="isAnonymous">Report Anonymously</Label>
      </div>

      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
