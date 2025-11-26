

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { UserRole } from '@/lib/types';


/* ---------- types ---------- */
type ActionState = { success: boolean; message: string; issues?: string[], id?: string | null };

/* ---------- helpers ---------- */
const errorState = (m: string, i?: string[]): ActionState => ({ success: false, message: m, issues: i || [] });
const successState = (m: string, id?: string | null): ActionState => ({ success: true, message: m, id });

/* ---------- generic CRUD ---------- */
async function handleCreateOrUpdate<T extends z.ZodTypeAny>(
  schema: T,
  collectionPath: string,
  rawData: any,
  revalidateUrl: string,
  idOverride?: string
): Promise<ActionState> {
  try {
    const v = schema.safeParse(rawData);
    if (!v.success)
      return errorState('Invalid form data.', Object.values(v.error.flatten().fieldErrors).flat() as string[]);

    const { id, ...data } = v.data;
    const key = idOverride || id || db.ref(collectionPath).push()!.key!;
    await db.ref(`${collectionPath}/${key}`).set({ ...data, id: key });
    revalidatePath(revalidateUrl);
    return successState(id ? 'Record updated.' : 'Record created.', key);
  } catch (e: any) {
    console.error(`Error in ${collectionPath}:`, e);
    return errorState(e.message || 'Server error.');
  }
}

async function handleDelete(collectionPath: string, formData: FormData, revalidateUrl: string): Promise<ActionState> {
  try {
    const id = formData.get('id') as string;
    if (!id) return errorState('Missing ID for deletion.');
    await db.ref(`${collectionPath}/${id}`).remove();
    revalidatePath(revalidateUrl);
    return successState('Record deleted.');
  } catch (e: any) {
    console.error(`Delete error in ${collectionPath}:`, e);
    return errorState(e.message);
  }
}

/* ---------- schemas ---------- */
const IncidentTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  isEnabled: z.coerce.boolean(),
  parentId: z.string().optional().nullable().transform(v => (v === 'null' || v === '' ? null : v)),
  defaultSeverity: z.string().optional(),
  order: z.coerce.number().optional(),
  subTypes: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
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
  priority: z.coerce.number().min(1),
});

const EscalationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  waitMinutes: z.coerce.number().min(0),
});

const StatusSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  order: z.coerce.number().min(0),
});

const LocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  type: z.enum(['province', 'district', 'ward', 'village']),
  parentId: z.string().optional().nullable().transform(v => (v === 'null' || v === '' ? null : v)),
});

const SlaSchema = z.object({
  id: z.string().optional(),
  incidentTypeId: z.string().min(1),
  severityId: z.string().min(1),
  responseMinutes: z.coerce.number().min(0),
});

const NotificationRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  channels: z.string().transform(val => val.split(',').map(s => s.trim())),
  incidentTypes: z.array(z.string()),
});

const CustomFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  type: z.enum(['text', 'number', 'select', 'checkbox', 'date', 'file']),
  options: z.string().optional().transform(val => (val ? val.split(',').map(s => s.trim()) : [])),
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
  name: z.string().min(2, 'Asset name is required.'),
  assetType: z.enum(['Vehicle', 'Equipment', 'Other']),
  status: z.enum(['Active', 'Maintenance', 'Inactive']),
  departmentId: z.string().min(1, 'Department is required.'),
});

/* ---------- actions ---------- */
export async function createOrUpdateIncidentType(_: any, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData);
    if (!raw.isEnabled) raw.isEnabled = 'false';

    const v = IncidentTypeSchema.safeParse(raw);
    if (!v.success) return errorState('Invalid form data.', Object.values(v.error.flatten().fieldErrors).flat() as string[]);

    const { id, subTypes, ...data } = v.data;
    const parentId = id || db.ref('incidentTypes').push()!.key!;

    // Create or update the parent category
    await db.ref(`incidentTypes/${parentId}`).set({ ...data, id: parentId });

    // If subTypes are provided, create them as children
    if (subTypes && subTypes.length > 0 && !data.parentId) {
      for (const subTypeName of subTypes) {
        const subTypeKey = db.ref('incidentTypes').push().key!;
        await db.ref(`incidentTypes/${subTypeKey}`).set({
          name: subTypeName,
          parentId: parentId,
          isEnabled: true,
          defaultSeverity: data.defaultSeverity,
          order: data.order,
          id: subTypeKey
        });
      }
    }

    revalidatePath('/admin/configuration/incident-types');
    return successState(id ? 'Record updated.' : 'Record created.', parentId);
  } catch (e: any) {
    console.error(`Error in incidentTypes:`, e);
    return errorState(e.message || 'Server error.');
  }
}
export async function deleteIncidentType(formData: FormData) {
  return handleDelete('incidentTypes', formData, '/admin/configuration/incident-types');
}

export async function createOrUpdateSeverity(_: any, formData: FormData) {
  return handleCreateOrUpdate(SeveritySchema, 'severities', Object.fromEntries(formData), '/admin/configuration/severities');
}
export async function deleteSeverity(formData: FormData) {
  return handleDelete('severities', formData, '/admin/configuration/severities');
}

export async function createOrUpdateDepartmentRule(_: any, formData: FormData) {
  return handleCreateOrUpdate(DepartmentRuleSchema, 'departmentRules', Object.fromEntries(formData), '/admin/configuration/department-rules');
}
export async function deleteDepartmentRule(formData: FormData) {
  return handleDelete('departmentRules', formData, '/admin/configuration/department-rules');
}

export async function createOrUpdateEscalation(_: any, formData: FormData) {
  return handleCreateOrUpdate(EscalationSchema, 'escalations', Object.fromEntries(formData), '/admin/configuration/escalations');
}
export async function deleteEscalation(formData: FormData) {
  return handleDelete('escalations', formData, '/admin/configuration/escalations');
}

export async function createOrUpdateStatus(_: any, formData: FormData) {
  return handleCreateOrUpdate(StatusSchema, 'statuses', Object.fromEntries(formData), '/admin/configuration/statuses');
}
export async function deleteStatus(formData: FormData) {
  return handleDelete('statuses', formData, '/admin/configuration/statuses');
}

export async function createOrUpdateLocation(_: any, formData: FormData) {
  return handleCreateOrUpdate(LocationSchema, 'locations', Object.fromEntries(formData), '/admin/configuration/locations');
}
export async function deleteLocation(formData: FormData) {
  return handleDelete('locations', formData, '/admin/configuration/locations');
}

export async function createOrUpdateSla(_: any, formData: FormData) {
  return handleCreateOrUpdate(SlaSchema, 'slas', Object.fromEntries(formData), '/admin/configuration/slas');
}
export async function deleteSla(formData: FormData) {
  return handleDelete('slas', formData, '/admin/configuration/slas');
}

export async function createOrUpdateNotificationRule(_: any, formData: FormData) {
  const raw = { ...Object.fromEntries(formData), incidentTypes: formData.getAll('incidentTypes') };
  return handleCreateOrUpdate(NotificationRuleSchema, 'notificationRules', raw, '/admin/configuration/notifications');
}
export async function deleteNotificationRule(formData: FormData) {
  return handleDelete('notificationRules', formData, '/admin/configuration/notifications');
}

export async function createOrUpdateCustomField(_: any, formData: FormData) {
  return handleCreateOrUpdate(CustomFieldSchema, 'customFields', Object.fromEntries(formData), '/admin/configuration/custom-fields');
}
export async function deleteCustomField(formData: FormData) {
  return handleDelete('customFields', formData, '/admin/configuration/custom-fields');
}

export async function createOrUpdateRole(_: any, formData: FormData) {
  return handleCreateOrUpdate(RoleSchema, 'roles', Object.fromEntries(formData), '/admin/configuration/roles');
}
export async function deleteRole(formData: FormData) {
  return handleDelete('roles', formData, '/admin/configuration/roles');
}

/* ---------- one-off actions ---------- */
export async function updateIntegrationSettings(_: any, formData: FormData) {
  try {
    const v = IntegrationSettingsSchema.safeParse(Object.fromEntries(formData));
    if (!v.success) return errorState('Invalid data');
    await db.ref('integrationSettings').set(v.data);
    revalidatePath('/admin/configuration/integrations');
    return successState('Integration settings updated.');
  } catch (e: any) {
    return errorState(e.message);
  }
}

export async function updateElectionMode(_: any, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData);
    if (!raw.enabled) raw.enabled = 'false';
    const v = ElectionModeSchema.safeParse(raw);
    if (!v.success) return errorState('Invalid data');
    await db.ref('electionMode').set(v.data);
    revalidatePath('/admin/configuration/election-mode');
    return successState('Election mode updated.');
  } catch (e: any) {
    return errorState(e.message);
  }
}

export async function addAssetToDepartment(_: any, formData: FormData) {
  try {
    const v = AssetSchema.safeParse(Object.fromEntries(formData));
    if (!v.success) return errorState('Invalid data');
    const { departmentId, ...asset } = v.data;
    const ref = db.ref(`departments/${departmentId}/assets`).push();
    await ref.set(asset);
    revalidatePath(`/departments/${departmentId}`);
    return successState('Asset added.');
  } catch (e: any) {
    return errorState(e.message);
  }
}

/* ---------- special actions ---------- */
const IncidentSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  location: z.string().min(3),
  category: z.string().min(1),
  userId: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  departmentId: z.string().optional(),
});

export async function createIncident(_: any, formData: FormData) {
  try {
    const v = IncidentSchema.safeParse(Object.fromEntries(formData));
    if (!v.success) return { success: false, message: 'Validation failed' };
    const { title, description, location, category, userId, latitude, longitude, departmentId } = v.data;
    const ref = db.ref('incidents').push();
    const incident = {
      id: ref.key,
      title,
      description,
      location: latitude && longitude ? { address: location, latitude, longitude } : location,
      category,
      status: 'Reported',
      priority: 'Medium',
      dateReported: new Date().toISOString(),
      reporter: { userId: userId },
      departmentId: departmentId || null,
    };
    await ref.set(incident);
    revalidatePath('/incidents');
    return { success: true, message: 'Incident reported successfully!' };
  } catch (e: any) {
    return { success: false, message: `Database error: ${e.message}` };
  }
}

const UpdateIncidentSchema = z.object({
  incidentId: z.string(),
  status: z.enum(['Reported', 'Verified', 'Team Dispatched', 'In Progress', 'Resolved', 'Rejected']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
});

export async function updateIncident(formData: FormData) {
  try {
    const v = UpdateIncidentSchema.safeParse(Object.fromEntries(formData));
    if (!v.success) return errorState('Invalid data');
    const { incidentId, ...updates } = v.data;
    if (!Object.keys(updates).length) return errorState('No updates provided.');
    await db.ref(`incidents/${incidentId}`).update(updates);
    revalidatePath(`/incidents/${incidentId}`);
    return successState('Incident updated.');
  } catch (e: any) {
    return errorState(e.message);
  }
}

const NoteSchema = z.object({
  incidentId: z.string(),
  userId: z.string(),
  userName: z.string(),
  note: z.string().min(1),
});

export async function addInvestigationNote(_: any, formData: FormData) {
  try {
    const v = NoteSchema.safeParse(Object.fromEntries(formData));
    if (!v.success) return errorState('Invalid data');
    const { incidentId, userId, userName, note } = v.data;
    const ref = db.ref(`incidents/${incidentId}/investigationNotes`).push();
    await ref.set({ id: ref.key, note, authorId: userId, authorName: userName, timestamp: new Date().toISOString() });
    revalidatePath(`/incidents/${incidentId}`);
    return successState('Note added.');
  } catch (e: any) {
    return errorState(e.message);
  }
}

const AssignResponderSchema = z.object({
  incidentId: z.string(),
  responder: z.string().min(1),
});

export async function assignResponder(formData: FormData) {
  try {
    const v = AssignResponderSchema.safeParse(Object.fromEntries(formData));
    if (!v.success) return errorState('Invalid data');
    const { incidentId, responder } = v.data;
    await db.ref(`incidents/${incidentId}`).update({
      assignedTo: responder,
      status: 'Team Dispatched',
      dateDispatched: new Date().toISOString(),
    });
    revalidatePath(`/incidents/${incidentId}`);
    return successState(`Assigned to ${responder}.`);
  } catch (e: any) {
    return errorState(e.message);
  }
}

/* ---------- departments ---------- */
const DepartmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  category: z.string().min(2),
  otherCategory: z.string().optional(),
  province: z.string().min(1),
  district: z.string().min(1),
  officeAddress: z.string().optional(),
  landline: z.string().optional(),
  incidentTypesHandled: z.array(z.string()).optional(),
  operatingHours: z.string().optional(),
  escalationRules: z.string().optional(),
  priorityAssignmentRules: z.string().optional(),
  accessibleModules: z.array(z.string()).optional(),
});

export async function createDepartment(_: any, formData: FormData) {
  const raw = {
    ...Object.fromEntries(formData),
    incidentTypesHandled: formData.getAll('incidentTypesHandled'),
    accessibleModules: formData.getAll('accessibleModules'),
  };
  if (raw.category === 'Other' && raw.otherCategory) raw.category = raw.otherCategory;
  return handleCreateOrUpdate(DepartmentSchema, 'departments', raw, '/departments');
}

export async function updateDepartment(_: any, formData: FormData) {
  const raw = {
    ...Object.fromEntries(formData),
    incidentTypesHandled: formData.getAll('incidentTypesHandled'),
    accessibleModules: formData.getAll('accessibleModules'),
  };
  return handleCreateOrUpdate(DepartmentSchema, 'departments', raw, '/departments');
}

export async function deleteDepartment(formData: FormData) {
  return handleDelete('departments', formData, '/departments');
}

/* ---------- branches ---------- */
const BranchSchema = z.object({
  departmentId: z.string().min(1),
  name: z.string().min(2),
  province: z.string().min(1),
  district: z.string().min(1),
  address: z.string().optional(),
  accessibleModules: z.array(z.string()).optional(),
});

export async function addBranchToDepartment(_: any, formData: FormData) {
  try {
    const raw = { ...Object.fromEntries(formData), accessibleModules: formData.getAll('accessibleModules') };
    const v = BranchSchema.safeParse(raw);
    if (!v.success) return errorState('Invalid branch data.');
    const { departmentId, ...branch } = v.data;
    const ref = db.ref(`departments/${departmentId}/branches`).push();
    await ref.set({ ...branch, id: ref.key });
    revalidatePath(`/departments/${departmentId}`);
    return successState('Branch added successfully.');
  } catch (e: any) {
    return errorState(e.message);
  }
}

/* ---------- staff ---------- */
const AssignStaffSchema = z.object({
  userId: z.string().min(1),
  departmentId: z.string().min(1),
  branchId: z.string().min(1),
});

export async function assignStaffToDepartment(_: any, formData: FormData) {
  try {
    const v = AssignStaffSchema.safeParse(Object.fromEntries(formData));
    if (!v.success) return errorState('Invalid data');
    const { userId, departmentId, branchId } = v.data;
    await db.ref(`users/${userId}`).update({ departmentId, branchId });
    revalidatePath(`/departments/${departmentId}`);
    revalidatePath('/staff');
    return successState('Staff assigned successfully.');
  } catch (e: any) {
    return errorState(e.message);
  }
}

/* ---------- profile ---------- */
const ProfileSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phoneNumber: z.string().optional(),
  occupation: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
});

export async function updateProfile(_: any, formData: FormData) {
  try {
    const v = ProfileSchema.safeParse(Object.fromEntries(formData));
    if (!v.success) return errorState('Invalid data');
    const { userId, ...profile } = v.data;
    await db.ref(`users/${userId}`).update(profile);
    revalidatePath(`/profile/${userId}`);
    return successState('Profile updated successfully.');
  } catch (e: any) {
    return errorState(e.message);
  }
}

/* ---------- auth stubs ---------- */
const SignupSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  nrc: z.string(),
  phoneNumber: z.string(),
  dateOfBirth: z.string(),
  occupation: z.string(),
  province: z.string(),
  district: z.string(),
});

export async function signup(_: any, formData: FormData): Promise<ActionState & { id?: string | null }> {
  const v = SignupSchema.safeParse(Object.fromEntries(formData));
  if (!v.success) {
    return {
      success: false,
      message: 'Invalid form data. Please check all fields.',
      issues: Object.values(v.error.flatten().fieldErrors).flat() as string[],
    };
  }
  const { email, password, firstName, lastName, ...profileData } = v.data;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const userProfile = {
      id: userRecord.uid,
      firstName,
      lastName,
      email,
      ...profileData,
      userType: 'citizen' as UserRole,
    };

    await db.ref(`users/${userRecord.uid}`).set(userProfile);
    
    return successState('Signup successful!', userRecord.uid);
  } catch (error: any) {
    console.error("Signup error:", error);
    let message = 'An unexpected error occurred during signup.';
    if (error.code === 'auth/email-already-exists') {
      message = 'This email address is already in use by another account.';
    } else if (error.code === 'auth/invalid-password') {
      message = 'The password must be at least 6 characters long.';
    }
    return errorState(message);
  }
}
