'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild } from "firebase/database";
import type { UserProfile } from "@/lib/types";
import { PlusCircle, UserCog, Loader2 } from "lucide-react";
import { CreateStaffDialog } from "@/components/staff/create-staff-dialog";
import { StaffTable } from "@/components/staff/staff-table";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StaffManagementPage() {
  const { user, isLoading: isAuthLoading } = useAuthUser();
  const database = useDatabase();
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthLoading && user && !user.isAdmin) {
      router.push('/');
    }
  }, [user, isAuthLoading, router]);

  const usersQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'users'), orderByChild('userType')) : null,
    [database]
  );

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  // Filter to staff users (responseUnit, regionalAuthority)
  const staffUsers = users?.filter(u =>
    u.userType === 'responseUnit' || u.userType === 'regionalAuthority'
  ) || [];

  if (isAuthLoading || isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user?.isAdmin) return null;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage department staff accounts and credentials
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Staff Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Staff Accounts ({staffUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StaffTable users={staffUsers} isLoading={isLoading} />
        </CardContent>
      </Card>

      <CreateStaffDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
