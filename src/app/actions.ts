
"use server";

import { z } from "zod";
import { suggestIncidentCategories } from "@/ai/flows/suggest-incident-categories";
import { detectDuplicateOrSuspiciousReports } from "@/ai/flows/detect-duplicate-suspicious-reports";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

const reportIncidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  location: z.string().min(3, "Location is required."),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  category: z.string().min(3, "Category is required."),
  isAnonymous: z.boolean(),
  userId: z.string().optional(), // Added to link the incident to the user
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  aiSuggestions?: {
    category?: string[];
    duplicate?: boolean;
    suspicious?: boolean;
  };
};

export async function createIncident(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const { firestore } = initializeFirebase();
  // Note: Getting auth on the server is complex. For this action, we'll pass UID from client.
  // In a real app, you'd use a session or verify an ID token.
  
  const formData = Object.fromEntries(data);
  const parsed = reportIncidentSchema.safeParse({
    ...formData,
    isAnonymous: formData.isAnonymous === "on",
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message);
    return {
      message: "Invalid form data.",
      issues,
      fields: {
        title: parsed.error.formErrors.fieldErrors.title?.join(", ") ?? "",
        description: parsed.error.formErrors.fieldErrors.description?.join(", ") ?? "",
        location: parsed.error.formErrors.fieldErrors.location?.join(", ") ?? "",
        category: parsed.error.formErrors.fieldErrors.category?.join(", ") ?? "",
      }
    };
  }

  const { title, description, location, latitude, longitude, isAnonymous, userId, category } = parsed.data;

  let aiSuggestions: FormState['aiSuggestions'] = {};

  // --- AI INTEGRATION ---
  try {
    console.log("AI: Suggesting categories...");
    const categorySuggestions = await suggestIncidentCategories({
      reportDescription: description,
      reportData: { title, location },
    });
    aiSuggestions.category = categorySuggestions.suggestedCategories;
    console.log("AI Suggestions:", categorySuggestions);

    console.log("AI: Detecting duplicates...");
    const duplicateCheck = await detectDuplicateOrSuspiciousReports({
      reportContent: `${title}: ${description}`,
      location: location,
      metadata: { timestamp: new Date().toISOString(), userId: userId || 'anonymous' },
    });
    aiSuggestions.duplicate = duplicateCheck.isDuplicate;
    aiSuggestions.suspicious = duplicateCheck.isSuspicious;
    console.log("AI Duplicate Check:", duplicateCheck);

  } catch (error) {
    console.error("AI processing failed:", error);
    // Continue without AI data if it fails
  }

  // If AI flags as suspicious or duplicate, we can return early for user confirmation
  // For now, let's just log it and proceed with saving. In a real app, you might want a confirmation step.
  if (aiSuggestions.duplicate || aiSuggestions.suspicious) {
     console.warn("AI flagged this report as potentially duplicate or suspicious.", aiSuggestions);
  }

  try {
    const incidentsCollection = collection(firestore, "incidents");

    const locationData = (latitude && longitude) ? {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: location,
    } : location;


    await addDoc(incidentsCollection, {
      title,
      description,
      location: locationData,
      category,
      status: "Reported",
      priority: "Medium", // Default priority
      dateReported: serverTimestamp(),
      reporter: {
        isAnonymous: isAnonymous,
        userId: isAnonymous ? null : userId,
      },
      media: [], // Handle file uploads separately
      aiMetadata: {
        suggestedCategories: aiSuggestions.category ?? [],
        isDuplicate: aiSuggestions.duplicate ?? false,
        isSuspicious: aiSuggestions.suspicious ?? false,
      }
    });
    console.log("New incident reported:", parsed.data);
  } catch (e) {
    console.error(e);
    return {
      message: "Failed to create incident in Firestore."
    }
  }
  
  revalidatePath("/");
  redirect(`/`);
}
