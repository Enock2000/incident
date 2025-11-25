
// Fixed AppShell component with proper authentication state handling
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ZtisLogo } from "@/components/icons";
import {
  Home,
  Bell,
  Settings,
  PlusCircle,
  User,
  LogOut,
  BarChart2,
  Map,
  Building,
  Users,
  Package,
  Shield,
  Vote,
  Monitor,
  Siren,
  UserCheck,
  Flag,
  Users2,
  Scale,
  Archive,
  HelpCircle,
  Truck,
  FileWarning,
  Route,
  CloudSun,
  Swords,
  ListOrdered,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuth, useUser, useDatabase, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useLocationTracker } from "@/hooks/use-location-tracker";
import React, { useEffect, useState } from "react";
import type { Branch, Department } from "@/lib/types";
import { ref } from "firebase/database";


const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/incidents", label: "Incident Management", icon: ListOrdered },
    { href: "/citizen", label: "My Activity", icon: User },
    { href: "/report", label: "Report Incident", icon: PlusCircle },
    { href: "/map", label: "Map View", icon: Map },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
  ];

const managementItems = [
    { href: "/departments", label: "Departments", icon: Building },
    { href: "/staff", label: "Staff & Roles", icon: Users },
    { href: "/assets", label: "Assets", icon: Package },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

const electionModules = [
    { href: "/election-incident-reporting", label: "Election Incident Reporting", icon: Vote },
    { href: "/polling-station-monitoring", label: "Polling Station Monitoring", icon: Monitor },
    { href: "/election-security-alerts", label: "Election Security Alerts", icon: Siren },
    { href: "/voter-safety-incident", label: "Voter Safety Incident", icon: UserCheck },
    { href: "/violence-intimidation-monitoring", label: "Violence & Intimidation", icon: Swords },
    { href: "/political-activity-tracking", label: "Political Activity Tracking", icon: Flag },
    { href: "/crowd-queue-management", label: "Crowd & Queue Management", icon: Users2 },
    { href: "/illegal-campaign-activity", label: "Illegal Campaign Activity", icon: Scale },
    { href: "/electoral-material-damage", label: "Electoral Material Damage", icon: Archive },
    { href: "/polling-staff-emergency-support", label: "Polling Staff Support", icon: HelpCircle },
    { href: "/election-logistics-disruption", label: "Logistics Disruption", icon: Truck },
    { href: "/fake-news-misinformation", label: "Fake News & Misinformation", icon: FileWarning },
    { href: "/transportation-route-monitoring", label: "Transport Monitoring", icon: Route },
    { href: "/election-day-weather-risk", label: "Weather & Risk", icon: CloudSun },
    { href: "/post-election-conflict-monitoring", label: "Post-Election Conflict", icon: Shield },
];

export const allModules = [...navItems, ...managementItems, ...electionModules];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const database = useDatabase();
  const { user, isUserLoading, userProfile } = useUser();
  const [mounted, setMounted] = useState(false);

  const branchRef = useMemoFirebase(() => 
    (database && userProfile?.departmentId && userProfile?.branchId) 
    ? ref(database, `departments/${userProfile.departmentId}/branches/${userProfile.branchId}`) 
    : null, 
  [database, userProfile]);

  const { data: branchData } = useDoc<Branch>(branchRef);

  useLocationTracker();

  // Ensure component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to landing page on sign out
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const userHasAccessToModule = (href: string) => {
    // Admins see everything
    if (userProfile?.userType === 'admin') return true;
    
    // If user is not in a branch or branch has no specific permissions, show all
    if (!branchData || !branchData.accessibleModules || branchData.accessibleModules.length === 0) {
      return true;
    }
    
    // Check if the module href is in the branch's accessible modules
    return branchData.accessibleModules.includes(href);
  };
  
  const visibleNavItems = navItems.filter(item => userHasAccessToModule(item.href));
  const visibleManagementItems = managementItems.filter(item => userHasAccessToModule(item.href));
  const visibleElectionModules = electionModules.filter(item => userHasAccessToModule(item.href));


  // Don't render anything until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }
  
  // For auth pages or landing page (if user not logged in), render without app shell
  if (isAuthPage || !user) {
     return (
      <div className="min-h-screen bg-background">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // User is logged in, render with sidebar
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <ZtisLogo className="w-8 h-8" />
            <span className="text-xl font-semibold font-headline">ZTIS</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {visibleNavItems.length > 0 && (
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}

          {visibleManagementItems.length > 0 && <SidebarSeparator />}

          {visibleManagementItems.length > 0 && (
            <SidebarMenu>
              <SidebarMenuItem>
                <span className="text-xs text-muted-foreground px-2 font-semibold">
                  Management
                </span>
              </SidebarMenuItem>
              {visibleManagementItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}

          {visibleElectionModules.length > 0 && <SidebarSeparator />}

          {visibleElectionModules.length > 0 && (
            <SidebarMenu>
              <SidebarMenuItem>
                <span className="text-xs text-muted-foreground px-2 font-semibold">
                  Election Modules
                </span>
              </SidebarMenuItem>
              {visibleElectionModules.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut}>
                <LogOut />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center justify-between h-14 px-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <p className="font-semibold text-lg hidden sm:block">
              Zambia Tracking Incident System
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {user.photoURL && (
                    <AvatarImage src={user.photoURL} alt="User Avatar" />
                  )}
                  <AvatarFallback>
                    {user.displayName ? user.displayName.charAt(0) : <User />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.displayName || user.email}
                  </p>
                  {user.email && user.displayName && (
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
