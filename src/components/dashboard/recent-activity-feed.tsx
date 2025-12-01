'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Incident } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle, Clock, MapPin } from "lucide-react";

interface RecentActivityFeedProps {
    incidents: Incident[];
}

export function RecentActivityFeed({ incidents }: RecentActivityFeedProps) {
    return (
        <Card className="col-span-3 lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {incidents.slice(0, 5).map((incident) => (
                        <div key={incident.id} className="flex items-start">
                            <div className="relative mr-4">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full border bg-background">
                                    {incident.status === 'Resolved' ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                                    ) : incident.status === 'Critical' ? (
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </span>
                                <span className="absolute left-4 top-9 h-full w-px bg-border -z-10 last:hidden" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {incident.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">{incident.category}</Badge>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {typeof incident.location === 'string' ? incident.location : `${incident.location.district}, ${incident.location.province}`}
                                    </span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(incident.dateReported, { addSuffix: true })}</span>
                                </div>
                            </div>
                            <div className="ml-auto font-medium">
                                <Badge
                                    variant={
                                        incident.priority === 'Critical' ? 'destructive' :
                                            incident.priority === 'High' ? 'default' :
                                                'secondary'
                                    }
                                >
                                    {incident.priority}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
