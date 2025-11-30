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
    Activity,
    Loader2
} from 'lucide-react';
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident, PollingStation } from "@/lib/types";
import { useMemo } from 'react';

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
    const database = useDatabase();

    // Fetch Incidents
    const incidentsQuery = useMemoFirebase(() =>
        database ? query(ref(database, 'incidents')) : null,
        [database]
    );
    const { data: incidents, isLoading: isLoadingIncidents } = useCollection<Incident>(incidentsQuery);

    // Fetch Polling Stations
    const stationsQuery = useMemoFirebase(() =>
        database ? query(ref(database, 'polling-stations')) : null,
        [database]
    );
    const { data: stations, isLoading: isLoadingStations } = useCollection<PollingStation>(stationsQuery);

    const stats = useMemo(() => {
        if (!incidents || !stations) return {
            activeIncidents: 0,
            openStations: 0,
            totalStations: 0,
            securityAlerts: 0,
            voterTurnout: 0
        };

        const activeIncidents = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Rejected').length;
        const securityAlerts = incidents.filter(i => (i.priority === 'High' || i.priority === 'Critical') && i.status !== 'Resolved').length;

        const openStations = stations.filter(s => s.status === 'Open').length;
        const totalStations = stations.length;

        // Calculate estimated turnout based on registered voters and check-ins (mock logic for now if check-ins missing)
        // Assuming 'queueLength' might correlate or we just use a placeholder calculation if real data is missing
        // For this example, let's sum up a hypothetical 'votesCast' if it existed, or just use a random calculation for demo if fields missing
        // But let's try to be as real as possible. We have 'registeredVoters'. Let's assume we don't have 'votesCast' yet in type.
        // We will use a placeholder 0% if no data, or maybe derive from queue activity?
        // Let's stick to 0 for now to be accurate to data, or maybe mock it if user wants "demo" feel? 
        // User asked to "remove mock data", so we should show 0 or N/A if no data.
        const totalRegistered = stations.reduce((acc, curr) => acc + (curr.registeredVoters || 0), 0);
        const totalVotes = stations.reduce((acc, curr) => acc + (curr.votesCast || 0), 0);
        const voterTurnout = totalRegistered > 0 ? ((totalVotes / totalRegistered) * 100).toFixed(1) : 0;

        return {
            activeIncidents,
            openStations,
            totalStations,
            securityAlerts,
            voterTurnout
        };
    }, [incidents, stations]);

    const isLoading = isLoadingIncidents || isLoadingStations;

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
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <>
                                <div className="text-2xl font-bold">{stats.activeIncidents}</div>
                                <p className="text-xs text-muted-foreground">
                                    Reported incidents
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="hover:shadow-soft transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Polling Stations Open</CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <>
                                <div className="text-2xl font-bold">
                                    {stats.totalStations > 0 ? ((stats.openStations / stats.totalStations) * 100).toFixed(1) : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.openStations} / {stats.totalStations} stations
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="hover:shadow-soft transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                        <Siren className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <>
                                <div className="text-2xl font-bold text-destructive">{stats.securityAlerts}</div>
                                <p className="text-xs text-muted-foreground">
                                    High/Critical priority
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="hover:shadow-soft transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Voter Turnout</CardTitle>
                        <Users2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <>
                                <div className="text-2xl font-bold">{stats.voterTurnout}%</div>
                                <p className="text-xs text-muted-foreground">
                                    Real-time estimate
                                </p>
                            </>
                        )}
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
