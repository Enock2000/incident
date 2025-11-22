'use server';

import { revalidatePath } from 'next/cache';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import type { IncidentStatus, Priority } from '@/lib/types';

const { firestore } = initializeFirebase();

const updateIncidentSchema = z.object({
  incidentId: z.string(),
  status: z.string().optional(),
  priority: z.string().optional(),
});

export async function updateIncident(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const parsed = updateIncidentSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error('Invalid data for updating incident:', parsed.error);
    return { success: false, message: 'Invalid data provided.' };
  }

  const { incidentId, status, priority } = parsed.data;

  try {
    const incidentRef = doc(firestore, 'incidents', incidentId);
    const updateData: { status?: IncidentStatus, priority?: Priority } = {};
    if (status) updateData.status = status as IncidentStatus;
    if (priority) updateData.priority = priority as Priority;

    await updateDoc(incidentRef, updateData);
    
    revalidatePath(`/incidents/${incidentId}`);
    revalidatePath('/');
    return { success: true, message: 'Incident updated successfully.' };

  } catch (error) {
    console.error('Error updating incident:', error);
    // In a real app, you would use the non-blocking update with error emitter
    return { success: false, message: 'Failed to update incident.' };
  }
}


const addNoteSchema = z.object({
  incidentId: z.string(),
  note: z.string().min(1, "Note cannot be empty."),
  userId: z.string(), // Assuming the user ID is passed from the form
  userName: z.string(), // Assuming user name is passed
});

export async function addInvestigationNote(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const parsed = addNoteSchema.safeParse(rawData);
  
  if (!parsed.success) {
    console.error('Invalid data for adding note:', parsed.error);
    return { success: false, message: 'Invalid data provided.' };
  }

  const { incidentId, note, userId, userName } = parsed.data;

  try {
    const incidentRef = doc(firestore, 'incidents', incidentId);
    await updateDoc(incidentRef, {
      investigationNotes: arrayUnion({
        note: note,
        authorId: userId,
        authorName: userName,
        timestamp: serverTimestamp(),
      }),
    });

    revalidatePath(`/incidents/${incidentId}`);
    return { success: true, message: 'Note added successfully.' };

  } catch (error) {
    console.error('Error adding note:', error);
    return { success: false, message: 'Failed to add note.' };
  }
}
