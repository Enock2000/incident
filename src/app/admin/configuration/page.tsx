
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Cat, Gauge, ShieldAlert, Siren, Map, Sliders, Waypoints, Bell, FileText, UserCheck, History, Plug, Vote } from "lucide-react";
import Link from "next/link";

const configItems = [
    { href: "/admin/configuration/incident-types", title: "Incident Types", description: "Manage types of incidents", icon: Siren },
    { href: "/admin/configuration/categories", title: "Categories", description: "Group incidents by category", icon: Cat },
    { href: "/admin/configuration/severities", title: "Severities", description: "Define incident severity levels", icon: ShieldAlert },
    { href: "/admin/configuration/department-rules", title: "Department Rules", description: "Assign incidents to departments", icon: Waypoints },
    { href: "/admin/configuration/escalations", title: "Escalations", description: "Configure escalation paths", icon: Sliders },
    { href: "/admin/configuration/statuses", title: "Statuses", description: "Define incident statuses", icon: Gauge },
    { href: "/admin/configuration/locations", title: "Locations", description: "Manage location hierarchy", icon: Map },
    { href: "/admin/configuration/slas", title: "SLAs", description: "Set response time agreements", icon: ArrowRight },
    { href: "/admin/configuration/notifications", title: "Notifications", description: "Manage notification rules", icon: Bell },
    { href: "/admin/configuration/custom-fields", title: "Custom Fields", description: "Add custom fields to incidents", icon: FileText },
    { href: "/admin/configuration/roles", title: "Roles", description: "Manage user roles and permissions", icon: UserCheck },
    { href: "/admin/configuration/audit-logs", title: "Audit Logs", description: "Track system changes", icon: History },
    { href: "/admin/configuration/integrations", title: "Integrations", description: "Connect to external services", icon: Plug },
    { href: "/admin/configuration/election-mode", title: "Election Mode", description: "Enable election-specific settings", icon: Vote },
];

export default function ConfigurationPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {configItems.map((item, i) => (
                    <Link href={item.href} key={i}>
                        <Card className="hover:bg-muted/50 cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Manage</div>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
