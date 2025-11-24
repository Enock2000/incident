
'use server';

import { revalidatePath } from 'next/cache';
import { ref, update, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { z } from 'zod';
import { initializeServerFirebase } from '@/firebase/server';
import type { IncidentStatus, Priority, Responder } from '@/lib/types';

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
