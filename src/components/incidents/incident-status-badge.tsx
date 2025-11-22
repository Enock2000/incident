import { Badge } from "@/components/ui/badge";
import type { IncidentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type IncidentStatusBadgeProps = {
  status: IncidentStatus;
  className?: string;
};

export function IncidentStatusBadge({ status, className }: IncidentStatusBadgeProps) {
  const statusStyles: Record<IncidentStatus, string> = {
    Reported: "bg-gray-200 text-gray-800",
    Verified: "bg-blue-200 text-blue-800",
    "Team Dispatched": "bg-yellow-200 text-yellow-800",
    "In Progress": "bg-orange-200 text-orange-800",
    Resolved: "bg-green-200 text-green-800",
  };

  return (
    <Badge className={cn("border-transparent hover:bg-opacity-80", statusStyles[status], className)}>
      {status}
    </Badge>
  );
}

export function PriorityBadge({ priority, className }: { priority: 'Low' | 'Medium' | 'High', className?: string }) {
  const priorityStyles = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  }
  return (
    <Badge className={cn("border-transparent font-normal", priorityStyles[priority], className)}>{priority}</Badge>
  )
}
