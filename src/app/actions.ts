"use server";

import { z } from "zod";
import { suggestIncidentCategories } from "@/ai/flows/suggest-incident-categories";
import { detectDuplicateOrSuspiciousReports } from "@/ai/flows/detect-duplicate-suspicious-reports";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

const reportIncidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  location: z.string().min(3, "Location is required."),
  isAnonymous: z.boolean(),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function createIncident(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const { firestore } = initializeFirebase();
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
      }
    };
  }

  const { title, description, location, isAnonymous } = parsed.data;

  // --- AI INTEGRATION ---
  try {
    console.log("AI: Suggesting categories...");
    const categorySuggestions = await suggestIncidentCategories({
      reportDescription: description,
      reportData: { title, location },
    });
    console.log("AI Suggestions:", categorySuggestions);

    console.log("AI: Detecting duplicates...");
    const duplicateCheck = await detectDuplicateOrSuspiciousReports({
      reportContent: `${title}: ${description}`,
      location: location,
      metadata: { timestamp: new Date().toISOString() },
    });
    console.log("AI Duplicate Check:", duplicateCheck);

  } catch (error) {
    console.error("AI processing failed:", error);
    // Continue without AI data if it fails
  }

  try {
    const incidentsCollection = collection(firestore, "incidents");
    await addDoc(incidentsCollection, {
      title,
      description,
      location,
      status: "Reported",
      priority: "Medium", // Default priority
      dateReported: serverTimestamp(),
      reporter: {
        name: isAnonymous ? "Anonymous" : "Authenticated User", // Replace with actual user data later
      },
      media: [], // Handle file uploads separately
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
