
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const alerts = [
    { id: 1, title: "High Tension in Matero", description: "Reports of rival cadres clashing near Matero polling stations. High risk of violence.", level: "Critical", time: "5 mins ago" },
    { id: 2, title: "Suspicious Vehicle in Kitwe", description: "An unmarked vehicle has been seen loitering near Chimwemwe polling station.", level: "High", time: "30 mins ago" },
    { id: 3, title: "Crowd Gathering in Livingstone", description: "A large, unauthorized crowd is forming near the town center.", level: "Medium", time: "1 hour ago" },
];

export default function ElectionSecurityAlertsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Election Security Alerts
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Live Security Feed</CardTitle>
          <CardDescription>Real-time security alerts from across the country.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="border-l-4 p-4 rounded-r-lg bg-card" style={{ borderColor: alert.level === 'Critical' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{alert.title}</h3>
                <Badge variant={alert.level === 'Critical' ? 'destructive' : 'secondary'}>{alert.level}</Badge>
              </div>
              <p className="text-muted-foreground mt-1">{alert.description}</p>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <Clock className="h-3 w-3 mr-1" />
                <span>{alert.time}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
