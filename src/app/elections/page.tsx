'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Vote,
    Monitor,
    Siren,
    UserCheck,
    Swords,
    Flag,
    Users2,
    Scale,
    Archive,
    HelpCircle,
    Truck,
    FileWarning,
    Route,
    CloudSun,
    Shield,
    ArrowRight,
    Activity
} from 'lucide-react';

const electionModules = [
    { href: "/elections/election-incident-reporting", label: "Election Incident Reporting", icon: Vote, description: "Report and track election-related incidents" },
    { href: "/elections/polling-station-monitoring", label: "Polling Station Monitoring", icon: Monitor, description: "Monitor status and activities at polling stations" },
    { href: "/elections/election-security-alerts", label: "Election Security Alerts", icon: Siren, description: "Real-time security alerts and notifications" },
    { href: "/elections/voter-safety-incident", label: "Voter Safety Incident", icon: UserCheck, description: "Track incidents affecting voter safety" },
    { href: "/elections/violence-intimidation-monitoring", label: "Violence & Intimidation", icon: Swords, description: "Monitor reports of violence and intimidation" },
    { href: "/elections/political-activity-tracking", label: "Political Activity Tracking", icon: Flag, description: "Track campaigns and political events" },
    { href: "/elections/crowd-queue-management", label: "Crowd & Queue Management", icon: Users2, description: "Manage crowd density and queue times" },
    { href: "/elections/illegal-campaign-activity", label: "Illegal Campaign Activity", icon: Scale, description: "Report violations of campaign regulations" },
    { href: "/elections/electoral-material-damage", label: "Electoral Material Damage", icon: Archive, description: "Track damage to voting materials" },
    { href: "/elections/polling-staff-emergency-support", label: "Polling Staff Support", icon: HelpCircle, description: "Emergency support for election staff" },
    { href: "/elections/election-logistics-disruption", label: "Logistics Disruption", icon: Truck, description: "Monitor supply chain and logistics issues" },
    { href: "/elections/fake-news-misinformation", label: "Fake News & Misinformation", icon: FileWarning, description: "Track and verify misinformation reports" },
    { href: "/elections/transportation-route-monitoring", label: "Transport Monitoring", icon: Route, description: "Monitor transport routes for election materials" },
    { href: "/elections/election-day-weather-risk", label: "Weather & Risk", icon: CloudSun, description: "Weather updates and risk assessment" },
    { href: "/elections/post-election-conflict-monitoring", label: "Post-Election Conflict", icon: Shield, description: "Monitor post-election stability" },
];

export default function ElectionsDashboard() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Elections Command Center</h1>
                <p className="text-muted-foreground">
                    Centralized monitoring and management for all election-related activities.
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-soft transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">128</div>
                        <p className="text-xs text-muted-foreground">
                            +12% from last hour
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-soft transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Polling Stations Open</CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98.5%</div>
                        <p className="text-xs text-muted-foreground">
                            12,450 / 12,640 stations
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-soft transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                        <Siren className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">5</div>
                        <p className="text-xs text-muted-foreground">
                            Requires immediate attention
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-soft transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Voter Turnout</CardTitle>
                        <Users2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42.3%</div>
                        <p className="text-xs text-muted-foreground">
                            Estimated based on reports
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Modules Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {electionModules.map((module) => (
                    <Link key={module.href} href={module.href}>
                        <Card className="h-full hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300 group">
                            <CardHeader>
                                <div className="mb-2 w-fit rounded-lg bg-primary/10 p-2 group-hover:bg-gradient-primary group-hover:text-white transition-colors duration-300">
                                    <module.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="font-headline text-lg">{module.label}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {module.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="ghost" className="w-full justify-between group-hover:text-primary">
                                    Access Module <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
