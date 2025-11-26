
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
  SlidersHorizontal,
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

const citizenPortalNavItems = [
    { href: "/citizen", label: "My Activity", icon: User },
    { href: "/report", label: "Report Incident", icon: PlusCircle },
    { href: "/notifications", label: "Notifications", icon: Bell },
];

const portalNavItems = [
    { href: "/department-dashboard", label: "Dashboard", icon: Home },
    { href: "/incidents", label: "All Incidents", icon: ListOrdered },
    { href: "/map", label: "Map View", icon: Map },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

const portalManagementItems = [
    { href: "/departments", label: "Departments", icon: Building },
    { href: "/staff", label: "Staff & Roles", icon: Users },
    { href: "/assets", label: "Assets", icon: Package },
    { href: "/admin/configuration", label: "Configuration", icon: SlidersHorizontal },
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

export const allModules = [...citizenPortalNavItems, ...portalNavItems, ...portalManagementItems, ...electionModules];

function PortalShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();
    const { user, userProfile } = useUser();

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/portal/login");
    };

    const userHasAccessToModule = (href: string) => {
        if (userProfile?.userType === 'admin') return true;
        // In a real app, you'd check against branchData.accessibleModules here
        // For now, we'll keep it simple
        return true; 
    };

    const visibleNavItems = portalNavItems.filter(item => userHasAccessToModule(item.href));
    const visibleManagementItems = portalManagementItems.filter(item => userHasAccessToModule(item.href));
    const visibleElectionModules = electionModules.filter(item => userHasAccessToModule(item.href));

    return (
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <ZtisLogo className="w-8 h-8" />
                <span className="text-xl font-semibold font-headline">Resolution Portal</span>
              </div>
            </SidebarHeader>
    
            <SidebarContent>
              {visibleNavItems.length > 0 && (
                <SidebarMenu>
                  {visibleNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href}>
                        <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
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
                    <span className="text-xs text-muted-foreground px-2 font-semibold">Management</span>
                  </SidebarMenuItem>
                  {visibleManagementItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href}>
                        <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
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
                    <span className="text-xs text-muted-foreground px-2 font-semibold">Election Modules</span>
                  </SidebarMenuItem>
                  {visibleElectionModules.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href}>
                        <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
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
              </div>
    
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {user?.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
                      <AvatarFallback>
                        {user?.displayName ? user.displayName.charAt(0) : <User />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
    
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile?.firstName} {userProfile?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
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

function CitizenPortalShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();
    const { user, userProfile } = useUser();

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/");
    };

     return (
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <ZtisLogo className="w-8 h-8" />
                <span className="text-xl font-semibold font-headline">Citizen Portal</span>
              </div>
            </SidebarHeader>
    
            <SidebarContent>
                <SidebarMenu>
                {citizenPortalNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                        <item.icon />
                        <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
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
              </div>
    
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                       {user?.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
                       <AvatarFallback>
                        {userProfile?.firstName ? userProfile.firstName.charAt(0) : <User />}
                       </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
    
                <DropdownMenuContent align="end" className="w-56">
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isUserLoading, user, userProfile } = useUser();
  const [mounted, setMounted] = useState(false);

  useLocationTracker();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicFacingPage = pathname === '/';
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isPortalLogin = pathname.startsWith('/portal/login');
  
  if (!mounted || isUserLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
  }

  // Render public landing page or auth pages if user is not logged in
  if (!user) {
    if (isAuthPage || isPortalLogin || isPublicFacingPage) {
        return <div className="min-h-screen bg-background">{children}</div>;
    }
    // For any other page, it should probably redirect, but for now we'll just render the content
    // which might lead to a redirect loop if the page itself requires auth.
    // In a real app, this might redirect to a login page.
    return <div className="min-h-screen bg-background">{children}</div>;
  }
  
  // If we have a user profile, we can decide which shell to render
  if (userProfile) {
    // If the user has a department ID, they are a portal user.
    if (userProfile.departmentId) {
        return <PortalShell>{children}</PortalShell>
    }
    
    // Otherwise, render the citizen portal shell.
    return <CitizenPortalShell>{children}</CitizenPortalShell>;
  }

  // Fallback for when user is loaded but profile is not yet.
  // This can happen briefly. A loading screen is appropriate.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
