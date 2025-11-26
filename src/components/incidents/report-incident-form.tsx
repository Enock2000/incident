

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createIncident } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lightbulb, AlertTriangle, Locate } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDatabase, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ref, query, orderByChild } from "firebase/database";
import type { Department, IncidentType } from "@/lib/types";

const initialState: { success: boolean; message: string; issues?: string[], aiSuggestions?: any } = {
  success: false,
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
  const database = useDatabase();
  const [state, formAction] = useActionState(createIncident, initialState);
  const { toast } = useToast();
  const [category, setCategory] = useState<string>('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState('');

  const departmentsRef = useMemoFirebase(() => database ? query(ref(database, 'departments')) : null, [database]);
  const { data: departments } = useCollection<Department>(departmentsRef);

  const incidentTypesRef = useMemoFirebase(() => database ? query(ref(database, 'incidentTypes'), orderByChild('order')) : null, [database]);
  const { data: incidentTypes, isLoading: isLoadingTypes } = useCollection<IncidentType>(incidentTypesRef);

  const { rootCategories, subCategories } = useMemo(() => {
    const root: IncidentType[] = [];
    const sub = new Map<string, IncidentType[]>();

    if (incidentTypes) {
      for (const type of incidentTypes) {
        if (!type.isEnabled) continue;

        if (type.parentId) {
          if (!sub.has(type.parentId)) {
            sub.set(type.parentId, []);
          }
          sub.get(type.parentId)!.push(type);
        } else {
          root.push(type);
        }
      }
    }
    return { rootCategories: root, subCategories: sub };
  }, [incidentTypes]);


  const relevantDepartments = useMemo(() => {
      if (!category || !departments || !incidentTypes) return [];
      
      const selectedType = incidentTypes.find(t => t.id === category);
      if (!selectedType) return [];

      let categoryName: string | undefined = selectedType.name;

      // If the selected type is a sub-category, we might need to check based on the parent's name
      if (selectedType.parentId) {
          const parentType = incidentTypes.find(t => t.id === selectedType.parentId);
          // Let's assume departments can be assigned to either parent or child categories explicitly.
          // For simplicity, we just use the selected type's name. More complex logic could go here.
      }
      
      return departments.filter(d => d.incidentTypesHandled?.includes(categoryName!)) || [];
  }, [category, departments, incidentTypes]);
  

  useEffect(() => {
    if (state?.success === false && state.message) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: state.message
      });
    } else if (state?.success === true) {
        toast({
            title: "Success",
            description: state.message,
        });
    }
  }, [state, toast]);
  
  const handleSuggestedCategoryClick = (suggestedCategory: string) => {
    const matchedType = incidentTypes?.find(type => type.name === suggestedCategory);
    if (matchedType) {
        setCategory(matchedType.id);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          setLocation(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
          toast({
            title: "Location Fetched",
            description: "Your current location has been set.",
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not retrieve your location. Please enter it manually.",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
      });
    }
  };


  return (
    <form action={formAction} className="space-y-6">
      {user && <input type="hidden" name="userId" value={user.uid} />}
      {latitude && <input type="hidden" name="latitude" value={latitude} />}
      {longitude && <input type="hidden" name="longitude" value={longitude} />}

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
           <div className="flex gap-2">
            <Input id="location" name="location" placeholder="e.g., Lusaka, Zambia or use GPS" required value={location} onChange={(e) => setLocation(e.target.value)} />
            <Button type="button" variant="outline" onClick={handleUseLocation} aria-label="Use my location">
              <Locate />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Enter an address or use your current location.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
           <Select name="category" required value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder={isLoadingTypes ? 'Loading categories...' : 'Select a category'} />
            </SelectTrigger>
            <SelectContent>
              {rootCategories.map(rootCat => (
                <SelectGroup key={rootCat.id}>
                  <SelectLabel>{rootCat.name}</SelectLabel>
                  {subCategories.get(rootCat.id)?.map(subCat => (
                    <SelectItem key={subCat.id} value={subCat.id} className="pl-8">
                      {subCat.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

       {category && (
         <div className="space-y-2">
          <Label htmlFor="departmentId">Assign to Department (Optional)</Label>
           <Select name="departmentId" value={departmentId} onValueChange={setDepartmentId} disabled={relevantDepartments.length === 0}>
            <SelectTrigger id="departmentId">
              <SelectValue placeholder={relevantDepartments.length > 0 ? "Select a department..." : "No departments for this category"} />
            </SelectTrigger>
            <SelectContent>
              {relevantDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">If you know the responsible department, select it. Otherwise, it will be automatically assigned.</p>
        </div>
      )}


       {state?.aiSuggestions?.category && state.aiSuggestions.category.length > 0 && (
         <Alert>
          <Lightbulb className="h-4 w-4" />
           <AlertTitle>AI Suggestion</AlertTitle>
           <AlertDescription>
             Based on your description, we suggest the following categories:
             <div className="flex gap-2 mt-2">
              {state.aiSuggestions.category.map((c: string) => (
                 <Button key={c} size="sm" variant="outline" type="button" onClick={() => handleSuggestedCategoryClick(c)}>{c}</Button>
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
      
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Providing false or misleading information is a serious offense. Action will be taken against individuals who misuse this platform.
        </AlertDescription>
      </Alert>


      <div className="space-y-2">
        <Label htmlFor="media">Photos/Videos</Label>
        <Input id="media" name="media" type="file" />
        <p className="text-sm text-muted-foreground">
          You can upload relevant photos or videos.
        </p>
      </div>

      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
