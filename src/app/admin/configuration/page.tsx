
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    ListTree, 
    LayoutList, 
    ShieldAlert, 
    GitBranch, 
    ArrowUpCircle, 
    RadioTower, 
    Map, 
    Clock, 
    Bell, 
    ListPlus, 
    Users, 
    History, 
    Plug, 
    Vote, 
    Bot 
} from "lucide-react";
import React from "react";
import Link from "next/link";

const configModules = [
  { title: "Incident Types Manager", description: "Define and manage the types of incidents that can be reported (e.g., Crime, Fire).", icon: <ListTree />, href: "/admin/configuration/incident-types", enabled: true },
  { title: "Incident Category Manager", description: "Group incident types into broader categories for easier filtering and reporting.", icon: <LayoutList />, href: "#", enabled: false },
  { title: "Severity Level Configuration", description: "Configure severity levels (e.g., Low, High, Critical) and their criteria.", icon: <ShieldAlert />, href: "#", enabled: false },
  { title: "Department Assignment Rules", description: "Set up rules to automatically assign incidents to the correct departments.", icon: <GitBranch />, href: "#", enabled: false },
  { title: "Escalation Workflow Builder", description: "Design workflows for escalating incidents based on time or severity.", icon: <ArrowUpCircle />, href: "#", enabled: false },
  { title: "Incident Status Configuration", description: "Customize the lifecycle statuses of incidents (e.g., Reported, In Progress, Resolved).", icon: <RadioTower />, href: "#", enabled: false },
  { title: "Location Hierarchy Manager", description: "Manage geographical data like provinces, districts, and wards for accurate location tagging.", icon: <Map />, href: "#", enabled: false },
  { title: "SLA & Response Time Settings", description: "Define Service Level Agreements for different incident types and priorities.", icon: <Clock />, href: "#", enabled: false },
  { title: "Automated Notification Rules", description: "Configure when and to whom automated notifications should be sent.", icon: <Bell />, href: "#", enabled: false },
  { title: "Custom Fields Builder", description: "Add custom data fields to incident reports to capture specific information.", icon: <ListPlus />, href: "#", enabled: false },
  { title: "User Roles & Permissions", description: "Manage user access levels and permissions for different system modules.", icon: <Users />, href: "#", enabled: false },
  { title: "Audit Logs & Change Tracking", description: "Review a complete history of all changes made within the system.", icon: <History />, href: "#", enabled: false },
  { title: "Integration Settings", description: "Configure integrations with external systems like SMS gateways, email, and GIS.", icon: <Plug />, href: "#", enabled: false },
  { title: "Election-Mode Settings", description: "Enable or disable special settings and modules for election periods.", icon: <Vote />, href: "#", enabled: false },
  { title: "AI-Assisted Classification Rules", description: "Fine-tune the AI model for suggesting categories and detecting duplicates.", icon: <Bot />, href: "#", enabled: false },
];

export default function AdminConfigurationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Admin Configuration
      </h1>
      <p className="text-muted-foreground">
        Use these tools to customize and manage the core settings of the incident management system.
      </p>
      <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {configModules.map((mod, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="bg-primary/10 text-primary p-2 rounded-md">
                {React.cloneElement(mod.icon, { className: "h-6 w-6" })}
              </div>
              <div>
                <CardTitle className="font-headline">{mod.title}</CardTitle>
                <CardDescription>{mod.description}</CardDescription>
              </div>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild disabled={!mod.enabled} className="w-full">
                <Link href={mod.href}>Configure</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
