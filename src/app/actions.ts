'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';

const db = getDatabase(initializeAdminApp());

// Helper for returning a consistent error state
function errorState(message: string, issues?: string[]) {
    return { success: false, message, issues: issues || [] };
}

// Helper for returning a consistent success state
function successState(message: string) {
    return { success: true, message };
}

// --- Incident Types ---
const IncidentTypeSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    enabled: z.preprocess(val => val === 'on' || val === true, z.boolean()),
});

export async function createOrUpdateIncidentType(prevState: any, formData: FormData) {
    const validatedFields = IncidentTypeSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return errorState("Invalid form data.", validatedFields.error.flatten().fieldErrors.name);
    }

    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('incidentTypes').push().key;

    try {
        await db.ref(`incidentTypes/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/incident-types');
        return successState(id ? "Incident type updated." : "Incident type created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteIncidentType(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID for deletion.");
    try {
        await db.ref(`incidentTypes/${id}`).remove();
        revalidatePath('/admin/configuration/incident-types');
        return successState("Incident type deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- Categories ---
const CategorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters."),
    parentId: z.string().optional(),
});

export async function createOrUpdateCategory(prevState: any, formData: FormData) {
    const validatedFields = CategorySchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", validatedFields.error.flatten().fieldErrors.name);

    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('categories').push().key;

    try {
        await db.ref(`categories/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/categories');
        return successState(id ? "Category updated." : "Category created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteCategory(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID.");
    try {
        await db.ref(`categories/${id}`).remove();
        revalidatePath('/admin/configuration/categories');
        return successState("Category deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}


// --- Severities ---
const SeveritySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters."),
    level: z.coerce.number().min(1, "Level must be at least 1."),
    color: z.string().min(3, "Color is required."),
});

export async function createOrUpdateSeverity(prevState: any, formData: FormData) {
    const validatedFields = SeveritySchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());

    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('severities').push().key;

    try {
        await db.ref(`severities/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/severities');
        return successState(id ? "Severity updated." : "Severity created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteSeverity(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID.");
    try {
        await db.ref(`severities/${id}`).remove();
        revalidatePath('/admin/configuration/severities');
        return successState("Severity deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- Department Rules ---
const DepartmentRuleSchema = z.object({
    id: z.string().optional(),
    incidentTypeId: z.string().min(1, "Incident Type is required."),
    departmentId: z.string().min(1, "Department is required."),
    priority: z.coerce.number().min(1, "Priority is required.")
});

export async function createOrUpdateDepartmentRule(prevState: any, formData: FormData) {
    const validatedFields = DepartmentRuleSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());
    
    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('departmentRules').push().key;

    try {
        await db.ref(`departmentRules/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/department-rules');
        return successState(id ? "Rule updated." : "Rule created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteDepartmentRule(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID.");
    try {
        await db.ref(`departmentRules/${id}`).remove();
        revalidatePath('/admin/configuration/department-rules');
        return successState("Rule deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- Escalations ---
const EscalationSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required."),
    waitMinutes: z.coerce.number().min(0, "Wait minutes cannot be negative.")
});

export async function createOrUpdateEscalation(prevState: any, formData: FormData) {
    const validatedFields = EscalationSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());
    
    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('escalations').push().key;

    try {
        await db.ref(`escalations/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/escalations');
        return successState(id ? "Escalation step updated." : "Escalation step created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteEscalation(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID.");
    try {
        await db.ref(`escalations/${id}`).remove();
        revalidatePath('/admin/configuration/escalations');
        return successState("Escalation step deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- Statuses ---
const StatusSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required."),
    order: z.coerce.number().min(0, "Order cannot be negative.")
});

export async function createOrUpdateStatus(prevState: any, formData: FormData) {
    const validatedFields = StatusSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());
    
    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('statuses').push().key;

    try {
        await db.ref(`statuses/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/statuses');
        return successState(id ? "Status updated." : "Status created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteStatus(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID.");
    try {
        await db.ref(`statuses/${id}`).remove();
        revalidatePath('/admin/configuration/statuses');
        return successState("Status deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- Locations ---
const LocationSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required."),
    type: z.enum(['province', 'district', 'ward', 'village']),
    parentId: z.string().optional().nullable(),
});

export async function createOrUpdateLocation(prevState: any, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    if (rawData.parentId === 'null' || rawData.parentId === '') rawData.parentId = null;

    const validatedFields = LocationSchema.safeParse(rawData);
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());
    
    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('locations').push().key;

    try {
        await db.ref(`locations/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/locations');
        return successState(id ? "Location updated." : "Location created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteLocation(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID.");
    try {
        await db.ref(`locations/${id}`).remove();
        revalidatePath('/admin/configuration/locations');
        return successState("Location deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- SLAs ---
const SlaSchema = z.object({
    id: z.string().optional(),
    incidentTypeId: z.string().min(1, "Incident Type is required."),
    severityId: z.string().min(1, "Severity is required."),
    responseMinutes: z.coerce.number().min(0, "Response minutes cannot be negative.")
});

export async function createOrUpdateSla(prevState: any, formData: FormData) {
    const validatedFields = SlaSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());
    
    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('slas').push().key;

    try {
        await db.ref(`slas/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/slas');
        return successState(id ? "SLA updated." : "SLA created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteSla(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID.");
    try {
        await db.ref(`slas/${id}`).remove();
        revalidatePath('/admin/configuration/slas');
        return successState("SLA deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- Notification Rules ---
const NotificationRuleSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required."),
    channels: z.string().min(1, "Channels are required.").transform(val => val.split(',').map(s => s.trim())),
    incidentTypes: z.preprocess(val => formData.getAll('incidentTypes'), z.array(z.string())),
});

export async function createOrUpdateNotificationRule(prevState: any, formData: FormData) {
    const validatedFields = NotificationRuleSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());
    
    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('notificationRules').push().key;

    try {
        await db.ref(`notificationRules/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/notifications');
        return successState(id ? "Rule updated." : "Rule created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteNotificationRule(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID.");
    try {
        await db.ref(`notificationRules/${id}`).remove();
        revalidatePath('/admin/configuration/notifications');
        return successState("Rule deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- Custom Fields ---
const CustomFieldSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required."),
    type: z.enum(['text', 'number', 'select', 'checkbox', 'date', 'file']),
    options: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()) : []),
});

export async function createOrUpdateCustomField(prevState: any, formData: FormData) {
    const validatedFields = CustomFieldSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());
    
    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('customFields').push().key;

    try {
        await db.ref(`customFields/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/custom-fields');
        return successState(id ? "Field updated." : "Field created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteCustomField(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID.");
    try {
        await db.ref(`customFields/${id}`).remove();
        revalidatePath('/admin/configuration/custom-fields');
        return successState("Field deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- Roles ---
const RoleSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required."),
    permissions: z.string().transform(val => val.split(',').map(s => s.trim())),
});

export async function createOrUpdateRole(prevState: any, formData: FormData) {
    const validatedFields = RoleSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());
    
    const { id, ...data } = validatedFields.data;
    const recordId = id || db.ref('roles').push().key;

    try {
        await db.ref(`roles/${recordId}`).set({ ...data, id: recordId });
        revalidatePath('/admin/configuration/roles');
        return successState(id ? "Role updated." : "Role created.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

export async function deleteRole(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return errorState("Missing ID.");
    try {
        await db.ref(`roles/${id}`).remove();
        revalidatePath('/admin/configuration/roles');
        return successState("Role deleted.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- Integration Settings ---
const IntegrationSettingsSchema = z.object({
    smsGateway: z.string().optional(),
    emailServer: z.string().optional(),
    mapProvider: z.string().optional(),
});

export async function updateIntegrationSettings(prevState: any, formData: FormData) {
    const validatedFields = IntegrationSettingsSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());

    try {
        await db.ref('integrationSettings').set(validatedFields.data);
        revalidatePath('/admin/configuration/integrations');
        return successState("Integration settings updated.");
    } catch (e: any) {
        return errorState(e.message);
    }
}

// --- Election Mode ---
const ElectionModeSchema = z.object({
    enabled: z.preprocess(val => val === 'on' || val === true, z.boolean()),
});

export async function updateElectionMode(prevState: any, formData: FormData) {
    const validatedFields = ElectionModeSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return errorState("Invalid data", Object.values(validatedFields.error.flatten().fieldErrors).flat());

    try {
        await db.ref('electionMode').set(validatedFields.data);
        revalidatePath('/admin/configuration/election-mode');
        return successState("Election mode settings updated.");
    } catch (e: any) {
        return errorState(e.message);
    }
}
