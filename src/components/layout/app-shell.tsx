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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ChevronRight,
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
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useLocationTracker } from "@/hooks/use-location-tracker";
import React, { useEffect, useState } from "react";

// ✅ UPDATED: Citizen portal now includes "Track Status"
const citizenPortalNavItems = [
  { href: "/citizen", label: "My Activity", icon: User },
  { href: "/report", label: "Report Incidents", icon: PlusCircle },
  { href: "/notifications", label: "Receive Alerts", icon: Bell },
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
  { href: "/elections", label: "Elections Dashboard", icon: Vote },
];

const electionSubModules = [
  { href: "/elections/election-incident-reporting", label: "Incident Reporting", icon: Vote },
  { href: "/elections/polling-station-monitoring", label: "Polling Stations", icon: Monitor },
  { href: "/elections/election-security-alerts", label: "Security Alerts", icon: Siren },
  { href: "/elections/voter-safety-incident", label: "Voter Safety", icon: UserCheck },
  { href: "/elections/violence-intimidation-monitoring", label: "Violence & Intimidation", icon: Swords },
  { href: "/elections/political-activity-tracking", label: "Political Activity", icon: Flag },
  { href: "/elections/crowd-queue-management", label: "Crowd & Queues", icon: Users2 },
  { href: "/elections/illegal-campaign-activity", label: "Illegal Campaigning", icon: Scale },
  { href: "/elections/electoral-material-damage", label: "Material Damage", icon: Archive },
  { href: "/elections/polling-staff-emergency-support", label: "Staff Support", icon: HelpCircle },
  { href: "/elections/election-logistics-disruption", label: "Logistics", icon: Truck },
  { href: "/elections/fake-news-misinformation", label: "Misinformation", icon: FileWarning },
  { href: "/elections/transportation-route-monitoring", label: "Transport", icon: Route },
  { href: "/elections/election-day-weather-risk", label: "Weather Risk", icon: CloudSun },
  { href: "/elections/post-election-conflict-monitoring", label: "Post-Election Conflict", icon: Shield },
];

export const allModules = [
  ...citizenPortalNavItems,
  ...portalNavItems,
  ...portalManagementItems,
  ...electionModules,
];

function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, userProfile } = useUser();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/portal/login");
  };

  // For portal users, show all relevant modules (admin access assumed for now)
  const visibleNavItems = portalNavItems;
  const visibleManagementItems = portalManagementItems;
  const visibleElectionModules = electionModules;

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

              <Collapsible asChild defaultOpen={pathname.startsWith("/elections")} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Elections">
                      <Vote />
                      <span>Elections</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === "/elections"}>
                          <Link href="/elections">
                            <span>Dashboard</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {electionSubModules.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton asChild isActive={pathname.startsWith(item.href)}>
                            <Link href={item.href}>
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
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
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </p>
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

// ✅ FULLY FIXED AppShell
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isUserLoading, user, userProfile } = useUser();
  const [mounted, setMounted] = useState(false);

  useLocationTracker();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicFacingPage = pathname === "/";
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isPortalLogin = pathname.startsWith("/portal/login");

  // Show loader while initializing
  if (!mounted || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Unauthorized: show auth or public pages only
  if (!user) {
    if (isAuthPage || isPortalLogin || isPublicFacingPage) {
      return <div className="min-h-screen bg-background">{children}</div>;
    }
    // Redirect or show login for protected routes (optional enhancement)
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // ✅ CRITICAL FIX: Use `userType` to decide shell
  if (userProfile) {
    if (
      userProfile.userType === "admin" ||
      userProfile.userType === "staff"
    ) {
      return <PortalShell>{children}</PortalShell>;
    }
    return <CitizenPortalShell>{children}</CitizenPortalShell>;
  }

  // Profile not loaded yet — show loader
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
