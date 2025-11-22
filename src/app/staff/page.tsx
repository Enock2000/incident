
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function StaffPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">
        Staff & User Management
      </h1>
      <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The staff and user management module is currently under development.
            <br />
            This feature will allow admins to assign roles and manage users.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    