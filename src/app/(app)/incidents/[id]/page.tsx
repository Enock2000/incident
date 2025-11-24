"use server";

import { notFound } from "next/navigation";
import { initializeServerFirebase } from "@/firebase/server";
import { ref, get } from "firebase/database";
import { Incident } from "@/lib/types";
import { IncidentDetailClientPage } from "./incident-detail-client-page";

export const dynamic = "force-dynamic";

async function getIncident(id: string): Promise<Incident | null> {
  try {
    const { database } = initializeServerFirebase();
    const incidentRef = ref(database, `incidents/${id}`);
    const snapshot = await get(incidentRef);

    if (!snapshot.exists()) {
      return null;
    }

    const incidentData = snapshot.val() as Omit<Incident, 'id'>;
    return {
      ...incidentData,
      id: id,
    };
  } catch (error) {
    console.error("Error fetching incident:", error);
    return null;
  }
}

export default async function IncidentDetailsPage({ params }: { params: { id: string } }) {
  const incident = await getIncident(params.id);

  if (!incident) {
    notFound();
  }

  return <IncidentDetailClientPage initialIncident={incident} />;
}
