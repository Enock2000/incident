'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';


// --- Types ---
type ActionState = {
  success: boolean;
  message: string;
  issues?: string[];
};

// --- Helpers ---

// 1. Standardized Response Helpers
function errorState(message: string, issues?: string[]): ActionState {
  return { success: false, message, issues: issues || [] };
}

function successState(message: string): ActionState {
  return { success: true, message };
}

// 2. Generic CRUD Handler (Reduces Boilerplate)
async function handleCreateOrUpdate<T extends z.ZodTypeAny>(
  schema: T,
  collectionPath: string,
  rawData: any,
  revalidateUrl: string,
  idOverride?: string
) {
  const db = getDatabase(initializeAdminApp());
  const validatedFields = schema.safeParse(rawData);

  if (!validatedFields.success) {
    return errorState(
      "Invalid form data.",
      Object.values(validatedFields.error.flatten().fieldErrors).flat() as string[]
    );
  }

  const { id, ...data } = validatedFields.data;
  // Use existing ID from form, or generate a new one
  const recordId = idOverride || id || db.ref(collectionPath).push().key;

  try {
    // Ensure the ID is saved within the document as well
    await db.ref(`${collectionPath}/${recordId}`).set({ ...data, id: recordId });
    revalidatePath(revalidateUrl);
    return successState(id ? "Record updated." : "Record created.");
  } catch (e: any) {
    return errorState(e.message);
  }
}

async function handleDelete(
  collectionPath: string,
  formData: FormData,
  revalidateUrl: string
) {
  const db = getDatabase(initializeAdminApp());
  const id = formData.get('id') as string;
  if (!id) return errorState("Missing ID for deletion.");
  
  try {
    await db.ref(`${collectionPath}/${id}`).remove();
    revalidatePath(revalidateUrl);
    return successState("Record deleted.");
  } catch (e: any) {
    return errorState(e.message);
  }
}

// --- Schemas ---

const IncidentTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  isEnabled: z.coerce.boolean(),
  parentId: z.string().optional().nullable().transform(v => (v === '' ? null : v)),
  defaultSeverity: z.string().optional(),
  order: z.coerce.number().optional(),
});


const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  parentId: z.string().optional(),
});

const SeveritySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  level: z.coerce.number().min(1),
  color: z.string().min(3),
});

const DepartmentRuleSchema = z.object({
  id: z.string().optional(),
  incidentTypeId: z.string().min(1),
  departmentId: z.string().min(1),
  priority: z.coerce.number().min(1)
});

const EscalationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  waitMinutes: z.coerce.number().min(0)
});

const StatusSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  order: z.coerce.number().min(0)
});

const LocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  type: z.enum(['province', 'district', 'ward', 'village']),
  // Fix: Convert empty strings or "null" strings to real null/undefined
  parentId: z.string().optional().nullable().transform(v => (v === 'null' || v === '' ? null : v)),
});

const SlaSchema = z.object({
  id: z.string().optional(),
  incidentTypeId: z.string().min(1),
  severityId: z.string().min(1),
  responseMinutes: z.coerce.number().min(0)
});

// Fix: Removed dependency on global formData. Logic moved to the Action function.
const NotificationRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  channels: z.string().transform(val => val.split(',').map(s => s.trim())),
  incidentTypes: z.array(z.string()), // Expects an array now
});

const CustomFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  type: z.enum(['text', 'number', 'select', 'checkbox', 'date', 'file']),
  options: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()) : []),
});

const RoleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  permissions: z.string().transform(val => val.split(',').map(s => s.trim())),
});

const IntegrationSettingsSchema = z.object({
  smsGateway: z.string().optional(),
  emailServer: z.string().optional(),
  mapProvider: z.string().optional(),
});

const ElectionModeSchema = z.object({
  enabled: z.coerce.boolean(),
});

const AssetSchema = z.object({
  name: z.string().min(2, "Asset name is required."),
  assetType: z.enum(['Vehicle', 'Equipment', 'Other']),
  status: z.enum(['Active', 'Maintenance', 'Inactive']),
  departmentId: z.string().min(1, "Department is required."),
});


// --- Actions (Implementation) ---

// 1. Incident Types
export async function createOrUpdateIncidentType(prevState: any, formData: FormData) {
  const raw = Object.fromEntries(formData);
  if (!raw.isEnabled) raw.isEnabled = 'false'; 
  
  return handleCreateOrUpdate(IncidentTypeSchema, 'incidentTypes', raw, '/admin/configuration/incident-types');
}
export async function deleteIncidentType(formData: FormData) {
  return handleDelete('incidentTypes', formData, '/admin/configuration/incident-types');
}

// 2. Categories
export async function createOrUpdateCategory(prevState: any, formData: FormData) {
  return handleCreateOrUpdate(CategorySchema, 'categories', Object.fromEntries(formData), '/admin/configuration/categories');
}
export async function deleteCategory(formData: FormData) {
  return handleDelete('categories', formData, '/admin/configuration/categories');
}

// 3. Severities
export async function createOrUpdateSeverity(prevState: any, formData: FormData) {
  return handleCreateOrUpdate(SeveritySchema, 'severities', Object.fromEntries(formData), '/admin/configuration/severities');
}
export async function deleteSeverity(formData: FormData) {
  return handleDelete('severities', formData, '/admin/configuration/severities');
}

// 4. Department Rules
export async function createOrUpdateDepartmentRule(prevState: any, formData: FormData) {
  return handleCreateOrUpdate(DepartmentRuleSchema, 'departmentRules', Object.fromEntries(formData), '/admin/configuration/department-rules');
}
export async function deleteDepartmentRule(formData: FormData) {
  return handleDelete('departmentRules', formData, '/admin/configuration/department-rules');
}

// 5. Escalations
export async function createOrUpdateEscalation(prevState: any, formData: FormData) {
  return handleCreateOrUpdate(EscalationSchema, 'escalations', Object.fromEntries(formData), '/admin/configuration/escalations');
}
export async function deleteEscalation(formData: FormData) {
  return handleDelete('escalations', formData, '/admin/configuration/escalations');
}

// 6. Statuses
export async function createOrUpdateStatus(prevState: any, formData: FormData) {
  return handleCreateOrUpdate(StatusSchema, 'statuses', Object.fromEntries(formData), '/admin/configuration/statuses');
}
export async function deleteStatus(formData: FormData) {
  return handleDelete('statuses', formData, '/admin/configuration/statuses');
}

// 7. Locations
export async function createOrUpdateLocation(prevState: any, formData: FormData) {
  return handleCreateOrUpdate(LocationSchema, 'locations', Object.fromEntries(formData), '/admin/configuration/locations');
}
export async function deleteLocation(formData: FormData) {
  return handleDelete('locations', formData, '/admin/configuration/locations');
}

// 8. SLAs
export async function createOrUpdateSla(prevState: any, formData: FormData) {
  return handleCreateOrUpdate(SlaSchema, 'slas', Object.fromEntries(formData), '/admin/configuration/slas');
}
export async function deleteSla(formData: FormData) {
  return handleDelete('slas', formData, '/admin/configuration/slas');
}

// 9. Notification Rules (FIXED LOGIC)
export async function createOrUpdateNotificationRule(prevState: any, formData: FormData) {
  const raw = {
    ...Object.fromEntries(formData),
    // Fix: Explicitly get all values for the multi-select field
    incidentTypes: formData.getAll('incidentTypes'), 
  };
  return handleCreateOrUpdate(NotificationRuleSchema, 'notificationRules', raw, '/admin/configuration/notifications');
}
export async function deleteNotificationRule(formData: FormData) {
  return handleDelete('notificationRules', formData, '/admin/configuration/notifications');
}

// 10. Custom Fields
export async function createOrUpdateCustomField(prevState: any, formData: FormData) {
  return handleCreateOrUpdate(CustomFieldSchema, 'customFields', Object.fromEntries(formData), '/admin/configuration/custom-fields');
}
export async function deleteCustomField(formData: FormData) {
  return handleDelete('customFields', formData, '/admin/configuration/custom-fields');
}

// 11. Roles
export async function createOrUpdateRole(prevState: any, formData: FormData) {
  return handleCreateOrUpdate(RoleSchema, 'roles', Object.fromEntries(formData), '/admin/configuration/roles');
}
export async function deleteRole(formData: FormData) {
  return handleDelete('roles', formData, '/admin/configuration/roles');
}

// 12. Integration Settings (Single Document)
export async function updateIntegrationSettings(prevState: any, formData: FormData) {
  const db = getDatabase(initializeAdminApp());
  const validatedFields = IntegrationSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat() as string[]);

  try {
    await db.ref('integrationSettings').set(validatedFields.data);
    revalidatePath('/admin/configuration/integrations');
    return successState("Integration settings updated.");
  } catch (e: any) {
    return errorState(e.message);
  }
}

// 13. Election Mode (Single Document)
export async function updateElectionMode(prevState: any, formData: FormData) {
  const db = getDatabase(initializeAdminApp());
  const raw = Object.fromEntries(formData);
  if (!raw.enabled) raw.enabled = 'false'; // Handle unchecked box

  const validatedFields = ElectionModeSchema.safeParse(raw);
  if (!validatedFields.success) return errorState("Invalid data");

  try {
    await db.ref('electionMode').set(validatedFields.data);
    revalidatePath('/admin/configuration/election-mode');
    return successState("Election mode settings updated.");
  } catch (e: any) {
    return errorState(e.message);
  }
}

// 14. Assets (FIXED LOGIC)
export async function addAssetToDepartment(prevState: any, formData: FormData) {
  const db = getDatabase(initializeAdminApp());
  const validatedFields = AssetSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return errorState("Invalid form data", Object.values(validatedFields.error.flatten().fieldErrors).flat() as string[]);
  }

  const { departmentId, ...assetData } = validatedFields.data;

  try {
    const newRef = db.ref(`departments/${departmentId}/assets`).push();
    await newRef.set(assetData);

    revalidatePath(`/assets`);
    revalidatePath(`/departments/${departmentId}`);
    return successState("Asset added successfully.");
  } catch (e: any) {
    return errorState(e.message);
  }
}

const IncidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  location: z.string().min(3, "Location is required."),
  category: z.string().min(1, "Category is required."),
  userId: z.string().optional(),
  isAnonymous: z.coerce.boolean(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  departmentId: z.string().optional(),
});

export type FormState = {
  success: boolean;
  message: string;
  issues?: string[];
  aiSuggestions?: {
    category?: string[];
    duplicate?: boolean;
    suspicious?: boolean;
  }
};

export async function createIncident(prevState: FormState, formData: FormData): Promise<FormState> {
  const db = getDatabase(initializeAdminApp());
  const rawData = Object.fromEntries(formData);
  const validatedFields = IncidentSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      issues: validatedFields.error.flatten().fieldErrors.title,
    };
  }

  const { title, description, location, category, userId, isAnonymous, latitude, longitude, departmentId } = validatedFields.data;
  
  const newIncidentRef = db.ref('incidents').push();
  
  const incidentData = {
    id: newIncidentRef.key,
    title,
    description,
    location: (latitude && longitude) ? { address: location, latitude, longitude } : location,
    category,
    status: 'Reported' as const,
    priority: 'Medium' as const,
    dateReported: new Date().toISOString(),
    reporter: {
      isAnonymous,
      userId: isAnonymous ? null : userId
    },
    media: [],
    departmentId: departmentId || null,
  };

  try {
    await newIncidentRef.set(incidentData);
    revalidatePath('/incidents');
    revalidatePath('/citizen');
    return { success: true, message: 'Incident reported successfully!' };
  } catch (error: any) {
    return { success: false, message: `Database error: ${error.message}` };
  }
}

// Action to update an incident's status or priority
const UpdateIncidentSchema = z.object({
    incidentId: z.string(),
    status: z.enum(['Reported', 'Verified', 'Team Dispatched', 'In Progress', 'Resolved', 'Rejected']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
});
export async function updateIncident(formData: FormData) {
    const db = getDatabase(initializeAdminApp());
    const rawData = Object.fromEntries(formData);
    const validatedFields = UpdateIncidentSchema.safeParse(rawData);

    if (!validatedFields.success) return errorState("Invalid data");

    const { incidentId, ...updates } = validatedFields.data;
    if (Object.keys(updates).length === 0) return errorState("No updates provided.");
    
    try {
        await db.ref(`incidents/${incidentId}`).update(updates);
        revalidatePath(`/incidents/${incidentId}`);
        revalidatePath('/incidents');
        return successState("Incident updated.");
    } catch (e: any) {
        return errorState(e.message);
    }
}


// Action to add an investigation note
const NoteSchema = z.object({
    incidentId: z.string(),
    userId: z.string(),
    userName: z.string(),
    note: z.string().min(1, "Note cannot be empty."),
});
export async function addInvestigationNote(prevState: any, formData: FormData) {
    const db = getDatabase(initializeAdminApp());
    const validatedFields = NoteSchema.safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) return errorState("Invalid note data.");
    
    const { incidentId, userId, userName, note } = validatedFields.data;
    const noteRef = db.ref(`incidents/${incidentId}/investigationNotes`).push();
    
    const noteData = {
        id: noteRef.key,
        note,
        authorId: userId,
        authorName: userName,
        timestamp: new Date().toISOString()
    };

    try {
        await noteRef.set(noteData);
        revalidatePath(`/incidents/${incidentId}`);
        return successState("Note added.");
    } catch (e: any) {
        return errorState(e.message);
    }
}


// Action to assign a responder
const AssignResponderSchema = z.object({
    incidentId: z.string(),
    responder: z.string().min(1, "Responder is required."),
});
export async function assignResponder(formData: FormData) {
     const db = getDatabase(initializeAdminApp());
     const validatedFields = AssignResponderSchema.safeParse(Object.fromEntries(formData));
     if (!validatedFields.success) return errorState("Invalid assignment data.");

     const { incidentId, responder } = validatedFields.data;
     try {
        await db.ref(`incidents/${incidentId}`).update({
            assignedTo: responder,
            status: 'Team Dispatched',
            dateDispatched: new Date().toISOString()
        });
        revalidatePath(`/incidents/${incidentId}`);
        return successState(`Assigned to ${responder}.`);
    } catch (e: any) {
        return errorState(e.message);
    }
}


const DepartmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  category: z.string().min(2, "Category is required"),
  otherCategory: z.string().optional(),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  officeAddress: z.string().optional(),
  landline: z.string().optional(),
  incidentTypesHandled: z.array(z.string()).optional(),
  operatingHours: z.string().optional(),
  escalationRules: z.string().optional(),
  priorityAssignmentRules: z.string().optional(),
});

export async function createDepartment(prevState: any, formData: FormData) {
    const db = getDatabase(initializeAdminApp());
    const rawData = {
        ...Object.fromEntries(formData),
        incidentTypesHandled: formData.getAll('incidentTypesHandled'),
    };
    
    if (rawData.category === 'Other' && rawData.otherCategory) {
        rawData.category = rawData.otherCategory;
    }

    const validatedFields = DepartmentSchema.safeParse(rawData);
    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed.",
            issues: Object.values(validatedFields.error.flatten().fieldErrors).flat()
        };
    }
    
    const newId = db.ref('departments').push().key;
    if (!newId) return errorState("Could not generate new ID.");
    
    const result = await handleCreateOrUpdate(DepartmentSchema, 'departments', validatedFields.data, '/departments', newId);

    if (result.success) {
        return { ...result, id: newId };
    }
    return result;
}

export async function updateDepartment(prevState: any, formData: FormData) {
   const rawData = {
        ...Object.fromEntries(formData),
        incidentTypesHandled: formData.getAll('incidentTypesHandled'),
    };
    return handleCreateOrUpdate(DepartmentSchema, 'departments', rawData, '/departments');
}

export async function deleteDepartment(formData: FormData) {
    return handleDelete('departments', formData, '/departments');
}

// New function to get a single department by ID
export async function getDepartmentById(id: string) {
  const db = getDatabase(initializeAdminApp());
  try {
    const snapshot = await db.ref(`departments/${id}`).once('value');
    const department = snapshot.val();
    if (department) {
      return { ...department, id };
    }
    return null;
  } catch (e: any) {
    console.error("Error fetching department:", e);
    return null;
  }
}

const BranchSchema = z.object({
    name: z.string().min(2, "Name is required"),
    province: z.string().min(1, "Province is required"),
    district: z.string().min(1, "District is required"),
    address: z.string().optional(),
    departmentId: z.string(),
    accessibleModules: z.array(z.string()).optional(),
});
export async function addBranchToDepartment(prevState: any, formData: FormData) {
    const db = getDatabase(initializeAdminApp());
    const rawData = {
        ...Object.fromEntries(formData),
        accessibleModules: formData.getAll('accessibleModules'),
    };
    const validatedFields = BranchSchema.safeParse(rawData);
    if (!validatedFields.success) {
        return errorState("Invalid branch data.", Object.values(validatedFields.error.flatten().fieldErrors).flat() as string[]);
    }
    
    const { departmentId, ...branchData } = validatedFields.data;
    try {
        const newBranchRef = db.ref(`departments/${departmentId}/branches`).push();
        await newBranchRef.set(branchData);
        revalidatePath(`/departments/${departmentId}`);
        return successState("Branch added successfully.");
    } catch(e: any) {
        return errorState(e.message);
    }
}

const AssignStaffSchema = z.object({
    userId: z.string().min(1, "User is required."),
    departmentId: z.string().min(1, "Department is required."),
    branchId: z.string().min(1, "Branch is required."),
});
export async function assignStaffToDepartment(prevState: any, formData: FormData) {
    const db = getDatabase(initializeAdminApp());
    const validatedFields = AssignStaffSchema.safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) {
        return errorState("Invalid assignment data.", Object.values(validatedFields.error.flatten().fieldErrors).flat() as string[]);
    }

    const { userId, departmentId, branchId } = validatedFields.data;
    try {
        await db.ref(`users/${userId}`).update({ departmentId, branchId });
        revalidatePath(`/departments/${departmentId}`);
        revalidatePath('/staff');
        return successState("Staff assigned successfully.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

const ProfileSchema = z.object({
    userId: z.string(),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phoneNumber: z.string().optional(),
    occupation: z.string().optional(),
    province: z.string().optional(),
    district: z.string().optional(),
})
export async function updateProfile(prevState: any, formData: FormData) {
    const db = getDatabase(initializeAdminApp());
    const validatedFields = ProfileSchema.safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) return errorState("Invalid profile data.");

    const { userId, ...profileData } = validatedFields.data;

    try {
        await db.ref(`users/${userId}`).update(profileData);
        revalidatePath(`/profile/${userId}`);
        revalidatePath('/profile');
        return successState("Profile updated successfully.");
    } catch(e: any) {
        return errorState(e.message);
    }
}

// Signup action is missing, so we'll add it.
const SignupSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().optional(),
  nrc: z.string().optional(),
  dateOfBirth: z.string().optional(),
  occupation: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
});
export async function signup(prevState: any, formData: FormData) {
    const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) {
         return {
            success: false,
            message: "Validation failed.",
            issues: Object.values(validatedFields.error.flatten().fieldErrors).flat()
        };
    }
    // This is a placeholder for actual user creation with Firebase Auth
    // In a real app, you would use Firebase Auth Admin SDK here or a client-side call
    console.log("Signup data:", validatedFields.data);
    
    // For now, we just return success
    return successState("Signup successful! Please log in.");
}

// Login action is missing, so we'll add it
const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
export async function login(prevState: any, formData: FormData) {
     const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData));
     if (!validatedFields.success) {
         return errorState("Invalid login data.");
     }
     console.log("Login attempt:", validatedFields.data.email);
     // Placeholder for actual login
     return errorState("This is a placeholder. Actual login is handled client-side.");
}
