
"use server";

import { z } from "zod";
import { suggestIncidentCategories } from "@/ai/flows/suggest-incident-categories";
import { detectDuplicateOrSuspiciousReports } from "@/ai/flows/detect-duplicate-suspicious-reports";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ref, set, serverTimestamp, push } from "firebase/database";
import { initializeServerFirebase } from "@/firebase/server";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Schema for signing up a new user
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  nrc: z.string().min(1, "NRC number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  occupation: z.string().min(1, "Occupation is required"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
});


// Schema for logging in an existing user
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});


export async function signup(prevState: any, formData: FormData) {
  const { auth, database } = initializeServerFirebase();
  const data = Object.fromEntries(formData);
  const parsed = signupSchema.safeParse(data);

  if (!parsed.success) {
    return { message: "Invalid form data.", issues: parsed.error.issues.map(i => i.message) };
  }

  const { email, password, firstName, lastName, phoneNumber, nrc, dateOfBirth, occupation, province, district } = parsed.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = ref(database, 'users/' + user.uid);
    await set(userRef, {
        id: user.uid, // Ensure the ID is saved within the document
        firstName,
        lastName,
        email,
        phoneNumber,
        nrc,
        dateOfBirth,
        occupation,
        province,
        district,
        userType: 'citizen', // Default role
    });
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { message: "An account with this email already exists." };
    }
    console.error("Signup error:", error);
    return { message: "Failed to create user." };
  }

  redirect("/");
}


export async function login(prevState: any, formData: FormData) {
  const { auth } = initializeServerFirebase();
  const data = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return { message: "Invalid form data." };
  }
  
  const { email, password } = parsed.data;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e: any) {
    return { message: "Failed to log in" };
  }

  redirect("/");
}


const reportIncidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  location: z.string().min(3, "Location is required."),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  category: z.string().min(3, "Category is required."),
  isAnonymous: z.string().optional(),
  userId: z.string().optional(),
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
  const { database } = initializeServerFirebase();
  
  const formData = Object.fromEntries(data);
  const parsed = reportIncidentSchema.safeParse(formData);

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

  const { title, description, location, latitude, longitude, userId, category, isAnonymous } = parsed.data;

  const reporter: { isAnonymous: boolean, userId: string | null } = {
      isAnonymous: isAnonymous === 'on',
      userId: isAnonymous === 'on' ? null : (userId ?? null)
  };


  let aiSuggestions: FormState['aiSuggestions'] = {};

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
      metadata: { timestamp: new Date().toISOString(), userId: userId },
    });
    aiSuggestions.duplicate = duplicateCheck.isDuplicate;
    aiSuggestions.suspicious = duplicateCheck.isSuspicious;
    console.log("AI Duplicate Check:", duplicateCheck);

  } catch (error) {
    console.error("AI processing failed:", error);
  }

  if (aiSuggestions.duplicate || aiSuggestions.suspicious) {
     console.warn("AI flagged this report as potentially duplicate or suspicious.", aiSuggestions);
  }

  try {
    const incidentsRef = ref(database, 'incidents');

    const locationData = (latitude && longitude) ? {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: location,
    } : location;

    const newIncidentRef = push(incidentsRef);
    await set(newIncidentRef, {
      title,
      description,
      location: locationData,
      category,
      status: "Reported",
      priority: "Medium", // Default priority
      dateReported: serverTimestamp(),
      reporter: reporter,
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
      message: "Failed to create incident in Realtime Database."
    }
  }
  
  revalidatePath("/");
  redirect(`/`);
}
