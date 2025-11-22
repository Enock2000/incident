"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createIncident, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Lightbulb, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { incidentCategories } from "@/lib/incident-categories";

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
  const { user } = useUser();
  const [state, formAction] = useFormState(createIncident, initialState);
  const { toast } = useToast();
  const [category, setCategory] = useState<string>('');

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
  
  const handleSuggestedCategoryClick = (suggestedCategory: string) => {
    if(incidentCategories.includes(suggestedCategory)){
      setCategory(suggestedCategory);
    } else {
      // If the AI suggests a category not in our list, we could either add it,
      // or default to 'Other'. For now, we'll set it and let the `Select` component handle it.
      setCategory(suggestedCategory);
    }
  };


  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden input to pass the user ID to the server action */}
      {user && <input type="hidden" name="userId" value={user.uid} />}

      <div className="space-y-2">
        <Label htmlFor="title">Incident Title</Label>
        <Input id="title" name="title" placeholder="e.g., Power outage in Mandevu" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Provide a detailed description of the incident..." required rows={6} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" placeholder="e.g., Lusaka, Zambia" required />
          <p className="text-sm text-muted-foreground">You can also use GPS or pin a location on the map (coming soon).</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
           <Select name="category" required value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {incidentCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
       {state?.aiSuggestions?.category && state.aiSuggestions.category.length > 0 && (
         <Alert>
          <Lightbulb className="h-4 w-4" />
           <AlertTitle>AI Suggestion</AlertTitle>
           <AlertDescription>
             Based on your description, we suggest the following categories:
             <div className="flex gap-2 mt-2">
              {state.aiSuggestions.category.map(c => (
                 <Button key={c} size="sm" variant="outline" onClick={() => handleSuggestedCategoryClick(c)}>{c}</Button>
              ))}
             </div>
           </AlertDescription>
         </Alert>
       )}
       {(state?.aiSuggestions?.duplicate || state?.aiSuggestions?.suspicious) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>AI Warning</AlertTitle>
            <AlertDescription>
              {state.aiSuggestions.duplicate && "This report might be a duplicate of an existing one. "}
              {state.aiSuggestions.suspicious && "This report has been flagged as potentially suspicious. "}
              Please review the details before submitting.
            </AlertDescription>
          </Alert>
       )}


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
