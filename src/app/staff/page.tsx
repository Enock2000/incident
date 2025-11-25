
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Staff & Roles
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will be used to manage staff members and their roles across different departments. (Coming Soon)</p>
        </CardContent>
      </Card>
    </div>
  );
}
