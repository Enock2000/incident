
"use server";

import { z } from "zod";
import { suggestIncidentCategories } from "@/ai/flows/suggest-incident-categories";
import { detectDuplicateOrSuspiciousReports } from "@/ai/flows/detect-duplicate-suspicious-reports";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ref, set, serverTimestamp, push, update, serverTimestamp as rtdbServerTimestamp } from "firebase/database";
import { initializeServerFirebase } from "@/firebase/server";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import type { IncidentStatus, Priority, Responder } from '@/lib/types';

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
  departmentId: z.string().optional(),
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

  const { title, description, location, latitude, longitude, userId, category, isAnonymous, departmentId } = parsed.data;

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
      departmentId: departmentId ?? null,
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

const updateProfileSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  occupation: z.string().min(1, "Occupation is required"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
});

export async function updateProfile(prevState: any, formData: FormData) {
  const { database } = initializeServerFirebase();
  const data = Object.fromEntries(formData);
  const parsed = updateProfileSchema.safeParse(data);

  if (!parsed.success) {
    return { message: "Invalid form data.", issues: parsed.error.issues.map(i => i.message) };
  }
  
  const { userId, ...profileData } = parsed.data;

  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, profileData);
    
  } catch (error) {
    console.error("Update profile error:", error);
    return { message: "Failed to update profile." };
  }

  revalidatePath('/profile');
  return { message: 'Profile updated successfully!', issues: [] };
}


const updateIncidentSchema = z.object({
  incidentId: z.string(),
  status: z.string().optional(),
  priority: z.string().optional(),
});

export async function updateIncident(formData: FormData) {
  const { database } = initializeServerFirebase();
  const rawData = Object.fromEntries(formData);
  const parsed = updateIncidentSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error('Invalid data for updating incident:', parsed.error);
    return { success: false, message: 'Invalid data provided.' };
  }

  const { incidentId, status, priority } = parsed.data;

  try {
    const incidentRef = ref(database, `incidents/${incidentId}`);
    const updateData: { status?: IncidentStatus, priority?: Priority, dateVerified?: any, dateResolved?: any } = {};
    if (status) {
        updateData.status = status as IncidentStatus;
        if (status === 'Verified') {
            updateData.dateVerified = rtdbServerTimestamp();
        }
        if (status === 'Resolved') {
            updateData.dateResolved = rtdbServerTimestamp();
        }
    }
    if (priority) updateData.priority = priority as Priority;

    await update(incidentRef, updateData);
    
    revalidatePath(`/incidents/${incidentId}`);
    revalidatePath('/');
    return { success: true, message: 'Incident updated successfully.' };

  } catch (error) {
    console.error('Error updating incident:', error);
    return { success: false, message: 'Failed to update incident.' };
  }
}


const addNoteSchema = z.object({
  incidentId: z.string(),
  note: z.string().min(1, "Note cannot be empty."),
  userId: z.string(),
  userName: z.string(),
});

export async function addInvestigationNote(formData: FormData) {
    const { database } = initializeServerFirebase();
    const rawData = Object.fromEntries(formData);
    const parsed = addNoteSchema.safeParse(rawData);

    if (!parsed.success) {
        console.error('Invalid data for adding note:', parsed.error);
        return { success: false, message: 'Invalid data provided.' };
    }

    const { incidentId, note, userId, userName } = parsed.data;

    try {
        const notesRef = ref(database, `incidents/${incidentId}/investigationNotes`);
        // In RTDB, you push to a list.
        const newNoteRef = await import('firebase/database').then(db => db.push(notesRef));
        await import('firebase/database').then(db => db.set(newNoteRef, {
            note: note,
            authorId: userId,
            authorName: userName,
            timestamp: rtdbServerTimestamp(),
        }));

        revalidatePath(`/incidents/${incidentId}`);
        return { success: true, message: 'Note added successfully.' };

    } catch (error) {
        console.error('Error adding note:', error);
        return { success: false, message: 'Failed to add note.' };
    }
}

const assignResponderSchema = z.object({
  incidentId: z.string(),
  responder: z.string(),
});

export async function assignResponder(formData: FormData) {
  const { database } = initializeServerFirebase();
  const rawData = Object.fromEntries(formData);
  const parsed = assignResponderSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error('Invalid data for assigning responder:', parsed.error);
    return { success: false, message: 'Invalid data provided.' };
  }
  
  const { incidentId, responder } = parsed.data;

  try {
    const incidentRef = ref(database, `incidents/${incidentId}`);
    await update(incidentRef, {
      assignedTo: responder as Responder,
      status: 'Team Dispatched',
      dateDispatched: rtdbServerTimestamp(),
    });

    revalidatePath(`/incidents/${incidentId}`);
    revalidatePath('/');
    return { success: true, message: `Assigned to ${responder} and status updated.`};
  } catch (error) {
    console.error('Error assigning responder:', error);
    return { success: false, message: 'Failed to assign responder.' };
  }
}
