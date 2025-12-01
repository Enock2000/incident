
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Gauge, ShieldAlert, Siren, Map, Sliders, Waypoints, Bell, FileText, UserCheck, History, Plug, Vote } from "lucide-react";
import Link from "next/link";

const configItems = [
    { href: "/admin/configuration/incident-types", title: "Incident Categories", description: "Manage incident categories and types", icon: Siren, color: "from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/10 border-red-200/20", iconBg: "bg-red-100", iconColor: "text-red-600" },
    { href: "/admin/configuration/severities", title: "Severities", description: "Define incident severity levels", icon: ShieldAlert, color: "from-amber-500/10 to-amber-500/5 hover:from-amber-500/20 hover:to-amber-500/10 border-amber-200/20", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    { href: "/admin/configuration/department-rules", title: "Department Rules", description: "Assign incidents to departments", icon: Waypoints, color: "from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 border-blue-200/20", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { href: "/admin/configuration/escalations", title: "Escalations", description: "Configure escalation paths", icon: Sliders, color: "from-violet-500/10 to-violet-500/5 hover:from-violet-500/20 hover:to-violet-500/10 border-violet-200/20", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
    { href: "/admin/configuration/statuses", title: "Statuses", description: "Define incident statuses", icon: Gauge, color: "from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-emerald-500/10 border-emerald-200/20", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { href: "/admin/configuration/locations", title: "Locations", description: "Manage location hierarchy", icon: Map, color: "from-cyan-500/10 to-cyan-500/5 hover:from-cyan-500/20 hover:to-cyan-500/10 border-cyan-200/20", iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
    { href: "/admin/configuration/slas", title: "SLAs", description: "Set response time agreements", icon: ArrowRight, color: "from-pink-500/10 to-pink-500/5 hover:from-pink-500/20 hover:to-pink-500/10 border-pink-200/20", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
    { href: "/admin/configuration/notifications", title: "Notifications", description: "Manage notification rules", icon: Bell, color: "from-orange-500/10 to-orange-500/5 hover:from-orange-500/20 hover:to-orange-500/10 border-orange-200/20", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
    { href: "/admin/configuration/custom-fields", title: "Custom Fields", description: "Add custom fields to incidents", icon: FileText, color: "from-indigo-500/10 to-indigo-500/5 hover:from-indigo-500/20 hover:to-indigo-500/10 border-indigo-200/20", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
    { href: "/admin/configuration/roles", title: "Roles", description: "Manage user roles and permissions", icon: UserCheck, color: "from-teal-500/10 to-teal-500/5 hover:from-teal-500/20 hover:to-teal-500/10 border-teal-200/20", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
    { href: "/admin/configuration/audit-logs", title: "Audit Logs", description: "Track system changes", icon: History, color: "from-slate-500/10 to-slate-500/5 hover:from-slate-500/20 hover:to-slate-500/10 border-slate-200/20", iconBg: "bg-slate-100", iconColor: "text-slate-600" },
    { href: "/admin/configuration/integrations", title: "Integrations", description: "Connect to external services", icon: Plug, color: "from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 border-purple-200/20", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
    { href: "/admin/configuration/election-mode", title: "Election Mode", description: "Enable election-specific settings", icon: Vote, color: "from-rose-500/10 to-rose-500/5 hover:from-rose-500/20 hover:to-rose-500/10 border-rose-200/20", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
];

export default function ConfigurationPage() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent font-headline">
                        System Configuration
                    </h2>
                    <p className="text-muted-foreground mt-1">Manage system settings and preferences</p>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {configItems.map((item, i) => (
                    <Link href={item.href} key={i} className="group">
                        <Card className={cn(
                            "overflow-hidden border bg-gradient-to-br shadow-sm transition-all duration-300 cursor-pointer",
                            "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1",
                            item.color
                        )}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                                    <CardDescription className="text-xs">{item.description}</CardDescription>
                                </div>
                                <div className={cn("p-3 rounded-xl transition-transform duration-300 group-hover:scale-110", item.iconBg)}>
                                    <item.icon className={cn("h-5 w-5", item.iconColor)} />
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform duration-300">
                                    <span>Manage</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
