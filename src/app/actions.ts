
"use server";

import { z } from "zod";
import { suggestIncidentCategories } from "@/ai/flows/suggest-incident-categories";
import { detectDuplicateOrSuspiciousReports } from "@/ai/flows/detect-duplicate-suspicious-reports";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ref, set, serverTimestamp, push, update, serverTimestamp as rtdbServerTimestamp, remove, get } from "firebase/database";
import { initializeServerFirebase } from "@/firebase/server";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import type { IncidentStatus, Priority, Responder, Department } from '@/lib/types';

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
  success: boolean;
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
      success: false,
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
    const incidentId = `ZTIS-INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIncidentRef = ref(database, `incidents/${incidentId}`);

    const locationData = (latitude && longitude) ? {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: location,
    } : location;

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
      success: false,
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

export async function addInvestigationNote(prevState: any, formData: FormData) {
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
        const newNoteRef = push(notesRef);
        await set(newNoteRef, {
            note: note,
            authorId: userId,
            authorName: userName,
            timestamp: rtdbServerTimestamp(),
        });

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

const addBranchSchema = z.object({
    departmentId: z.string(),
    name: z.string().min(1, "Branch name is required"),
    province: z.string().min(1, "Province is required"),
    district: z.string().min(1, "District is required"),
    address: z.string().optional(),
});

export async function addBranchToDepartment(prevState: any, formData: FormData) {
    const { database } = initializeServerFirebase();
    const data = Object.fromEntries(formData);
    const parsed = addBranchSchema.safeParse(data);

    if (!parsed.success) {
        return { success: false, message: "Invalid branch data.", issues: parsed.error.issues.map(i => i.message) };
    }

    const { departmentId, ...branchData } = parsed.data;

    try {
        const branchesRef = ref(database, `departments/${departmentId}/branches`);
        const newBranchRef = push(branchesRef);
        await set(newBranchRef, branchData);

        revalidatePath(`/departments/${departmentId}`);
        return { success: true, message: 'Branch added successfully!' };

    } catch (error) {
        console.error("Error adding branch:", error);
        return { success: false, message: 'Failed to add branch.' };
    }
}

const addAssetSchema = z.object({
    departmentId: z.string().min(1, "Department is required"),
    name: z.string().min(1, "Asset name is required"),
    assetType: z.string().min(1, "Asset type is required"),
    status: z.string().min(1, "Status is required"),
});

export async function addAssetToDepartment(prevState: any, formData: FormData) {
    const { database } = initializeServerFirebase();
    const data = Object.fromEntries(formData);
    const parsed = addAssetSchema.safeParse(data);

    if (!parsed.success) {
        return { success: false, message: "Invalid asset data.", issues: parsed.error.issues.map(i => i.message) };
    }

    const { departmentId, ...assetData } = parsed.data;

    try {
        const assetsRef = ref(database, `departments/${departmentId}/assets`);
        const newAssetRef = push(assetsRef);
        await set(newAssetRef, { ...assetData, departmentId });

        revalidatePath(`/assets`);
        revalidatePath(`/departments/${departmentId}`);
        return { success: true, message: 'Asset added successfully!' };

    } catch (error) {
        console.error("Error adding asset:", error);
        return { success: false, message: 'Failed to add asset.' };
    }
}


const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  officeAddress: z.string().optional(),
  landline: z.string().optional(),
  operatingHours: z.string().optional(),
  escalationRules: z.string().optional(),
  priorityAssignmentRules: z.string().optional(),
  incidentTypesHandled: z.array(z.string()).optional(),
  otherCategory: z.string().optional(),
});


export async function createDepartment(prevState: any, formData: FormData): Promise<{ success: boolean; message: string; issues?: string[]; id?: string | null; }> {
  const { database } = initializeServerFirebase();
  const data = Object.fromEntries(formData);
  
  // Handle array from FormData
  const incidentTypes = formData.getAll('incidentTypesHandled');
  const finalData = { ...data, incidentTypesHandled: incidentTypes };

  const parsed = departmentSchema.safeParse(finalData);

  if (!parsed.success) {
    return { success: false, message: "Invalid form data.", issues: parsed.error.issues.map(i => i.message) };
  }
  
  const { otherCategory, ...deptData } = parsed.data;

  try {
    const deptId = `ZTIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDeptRef = ref(database, `departments/${deptId}`);
    
    const categoryToSave = deptData.category === 'Other' && otherCategory ? otherCategory : deptData.category;

    await set(newDeptRef, {
      name: deptData.name,
      category: categoryToSave,
      province: deptData.province,
      district: deptData.district,
      officeAddress: deptData.officeAddress,
      contactNumbers: { landline: deptData.landline || '', responders: [] },
      operatingHours: deptData.operatingHours || '',
      escalationRules: deptData.escalationRules || '',
      priorityAssignmentRules: deptData.priorityAssignmentRules || '',
      incidentTypesHandled: deptData.incidentTypesHandled || [],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    revalidatePath('/departments');
    return { success: true, message: 'Department created!', id: deptId };
  } catch (error) {
    console.error("Create department error:", error);
    return { success: false, message: "Failed to create department." };
  }
}

export async function updateDepartment(prevState: any, formData: FormData) {
  const { database } = initializeServerFirebase();
  const data = Object.fromEntries(formData);
  
  const incidentTypes = formData.getAll('incidentTypesHandled');
  const finalData = { ...data, incidentTypesHandled: incidentTypes };

  const updateSchema = departmentSchema.extend({
    id: z.string().min(1, "Department ID is missing"),
  });

  const parsed = updateSchema.safeParse(finalData);

  if (!parsed.success) {
    return { success: false, message: "Invalid form data.", issues: parsed.error.issues.map(i => i.message) };
  }

  const { id, otherCategory, ...deptData } = parsed.data;

  try {
    const departmentRef = ref(database, `departments/${id}`);
    const categoryToSave = deptData.category === 'Other' && otherCategory ? otherCategory : deptData.category;
    
    await update(departmentRef, {
      name: deptData.name,
      category: categoryToSave,
      province: deptData.province,
      district: deptData.district,
      officeAddress: deptData.officeAddress,
      'contactNumbers/landline': deptData.landline || '',
      operatingHours: deptData.operatingHours || '',
      escalationRules: deptData.escalationRules || '',
      priorityAssignmentRules: deptData.priorityAssignmentRules || '',
      incidentTypesHandled: deptData.incidentTypesHandled || [],
      updated_at: serverTimestamp(),
    });
    revalidatePath('/departments');
    revalidatePath(`/departments/${id}`);
    return { success: true, message: 'Department updated successfully!' };
  } catch (error) {
    console.error("Update department error:", error);
    return { success: false, message: "Failed to update department." };
  }
}

export async function deleteDepartment(formData: FormData) {
  const { database } = initializeServerFirebase();
  const id = formData.get('id') as string;

  if (!id) {
    return { success: false, message: "Department ID is missing." };
  }

  try {
    const departmentRef = ref(database, `departments/${id}`);
    await remove(departmentRef);

    revalidatePath('/departments');
    return { success: true, message: 'Department deleted successfully!' };
  } catch (error) {
    console.error("Delete department error:", error);
    return { success: false, message: "Failed to delete department." };
  }
}

export async function getDepartmentById(id: string): Promise<(Department & { id: string }) | null> {
    const { database } = initializeServerFirebase();
    const departmentRef = ref(database, `departments/${id}`);
    try {
        const snapshot = await get(departmentRef);
        if (snapshot.exists()) {
            return { ...snapshot.val(), id: snapshot.key };
        }
        return null;
    } catch (error) {
        console.error("Error fetching department:", error);
        return null;
    }
}

const assignStaffSchema = z.object({
  departmentId: z.string(),
  userId: z.string(),
});

export async function assignStaffToDepartment(prevState: any, formData: FormData) {
    const { database } = initializeServerFirebase();
    const data = Object.fromEntries(formData);
    const parsed = assignStaffSchema.safeParse(data);

    if (!parsed.success) {
        return { success: false, message: "Invalid data.", issues: parsed.error.issues.map(i => i.message) };
    }

    const { departmentId, userId } = parsed.data;

    try {
        // Add departmentId to the user's profile
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, { departmentId: departmentId });

        // Optional: Add userId to the department's staff list
        const departmentStaffRef = ref(database, `departments/${departmentId}/staff/${userId}`);
        await set(departmentStaffRef, true);

        revalidatePath(`/departments/${departmentId}`);
        return { success: true, message: 'Staff assigned successfully!' };

    } catch (error) {
        console.error("Error assigning staff:", error);
        return { success: false, message: 'Failed to assign staff.' };
    }
}

    