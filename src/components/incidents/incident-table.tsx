
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Incident, IncidentType } from "@/lib/types";
import { IncidentStatusBadge, PriorityBadge } from "./incident-status-badge";
import { Button } from "@/components/ui/button";
import { Eye, FileImage, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { IncidentImagesDialog } from "./incident-images-dialog";
import { useMemo } from "react";

export function IncidentTable({ incidents, incidentTypes = [] }: { incidents: Incident[], incidentTypes: IncidentType[] }) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return format(date, "PPP");
  };

  const categoryMap = useMemo(() => {
    if (!incidentTypes) return new Map();
    return new Map(incidentTypes.map(type => [type.id, type.name]));
  }, [incidentTypes]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Date Reported</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidents.map((incident) => (
          <TableRow key={incident.id}>
            <TableCell className="font-medium">{incident.title}</TableCell>
            <TableCell>{categoryMap.get(incident.category) || incident.category}</TableCell>
            <TableCell>
              <IncidentStatusBadge status={incident.status} />
            </TableCell>
            <TableCell>
                <PriorityBadge priority={incident.priority} />
            </TableCell>
            <TableCell>{formatDate(incident.dateReported)}</TableCell>
            <TableCell className="text-right space-x-2">
              <IncidentImagesDialog incident={incident}>
                <Button variant="ghost" size="icon" disabled={!incident.media || incident.media.length === 0}>
                  <FileImage className="h-4 w-4" />
                   <span className="sr-only">View Images</span>
                </Button>
              </IncidentImagesDialog>
              <Link href={`/incidents/${incident.id}`} passHref>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
