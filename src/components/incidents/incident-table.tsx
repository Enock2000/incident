"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Incident } from "@/lib/types";
import { IncidentStatusBadge, PriorityBadge } from "./incident-status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export function IncidentTable({ incidents }: { incidents: Incident[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
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
            <TableCell>
              <IncidentStatusBadge status={incident.status} />
            </TableCell>
            <TableCell>
                <PriorityBadge priority={incident.priority} />
            </TableCell>
            <TableCell>{format(new Date(incident.dateReported), "PPP")}</TableCell>
            <TableCell className="text-right">
              <Link href={`/incidents/${incident.id}`} passHref>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
