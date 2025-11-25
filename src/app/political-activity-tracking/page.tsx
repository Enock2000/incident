
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const activities = [
    { party: "Patriotic Front", type: "Rally", location: "Kabwe", date: "2024-08-10", size: "Large" },
    { party: "United Party for National Development", type: "Roadshow", location: "Ndola", date: "2024-08-11", size: "Medium" },
    { party: "Socialist Party", type: "Community Meeting", location: "Lusaka", date: "2024-08-11", size: "Small" },
];

export default function PoliticalActivityTrackingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Political Activity Tracking
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Political Events</CardTitle>
          <CardDescription>A schedule of known political rallies, meetings, and other activities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {activities.map((activity, index) => (
                <div key={index} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">{activity.party} - <span className="text-primary">{activity.type}</span></h3>
                        <Badge variant={activity.size === 'Large' ? 'destructive' : 'secondary'}>{activity.size} Event</Badge>
                    </div>
                    <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{activity.location}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{activity.date}</span>
                        </div>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
