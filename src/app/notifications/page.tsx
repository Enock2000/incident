
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: string;
  type: 'alert' | 'update' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};

const notifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'New High-Priority Incident Reported',
    description: 'A "Riot" has been reported in Lusaka Central. Immediate attention required.',
    timestamp: '15 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'update',
    title: 'Incident ZT-1245 Status Updated',
    description: 'Status for "Power Outage in Kaunda Square" changed to "In Progress".',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'New User Assigned to Your Department',
    description: 'Jane Doe has been assigned to the Zambia Police Service department.',
    timestamp: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'success',
    title: 'Incident ZT-1240 Resolved',
    description: 'The "Road Accident on Great East Road" has been successfully resolved.',
    timestamp: '1 day ago',
    read: true,
  },
];

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'alert':
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case 'update':
      return <Bell className="h-5 w-5 text-blue-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-gray-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};


export default function NotificationsPage() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Notifications
          {unreadCount > 0 && <Badge className="ml-4">{unreadCount} New</Badge>}
        </h1>
        <Button variant="outline">Mark all as read</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Notifications</CardTitle>
          <CardDescription>All alerts and updates from the system will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`flex items-start gap-4 p-4 rounded-lg border ${!notification.read ? 'bg-card' : 'bg-muted/50'}`}>
                <div className="mt-1">
                    {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${!notification.read ? 'text-card-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                   <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                </div>
                 {!notification.read && (
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary" aria-label="Unread"></div>
                )}
              </div>
            ))}

            {notifications.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Bell className="mx-auto h-12 w-12" />
                    <p className="mt-4">You have no new notifications.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
