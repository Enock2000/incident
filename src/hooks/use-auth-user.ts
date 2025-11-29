import { useUser } from '@/firebase';
import { useMemo } from 'react';
import type { UserProfile } from '@/lib/types';
import { hasPermission } from '@/lib/permissions';

export interface AuthUserContext extends UserProfile {
    isAdmin: boolean;
    canAccessAllIncidents: boolean;
    canManageDepartments: boolean;
    canViewAnalytics: boolean;
    hasDepartmentAccess: boolean;
    canAccessElections: boolean;
}

/**
 * Enhanced authentication hook that provides user context with computed permissions
 * Use this instead of useUser() when you need to check permissions
 */
export function useAuthUser() {
    const { userProfile, isUserLoading, isProfileLoading } = useUser();

    const userContext = useMemo(() => {
        if (!userProfile) return null;

        const context: AuthUserContext = {
            ...userProfile,
            isAdmin: userProfile.userType === 'admin',
            canAccessAllIncidents: hasPermission(userProfile.userType, 'incidents.view.all'),
            canManageDepartments: hasPermission(userProfile.userType, 'departments.manage'),
            canViewAnalytics: hasPermission(userProfile.userType, 'analytics.view'),
            hasDepartmentAccess: !!userProfile.departmentId,
            canAccessElections: hasPermission(userProfile.userType, 'elections.access'),
        };

        return context;
    }, [userProfile]);

    return { user: userContext, isLoading: isUserLoading || isProfileLoading };
}

/**
 * Hook to check a specific permission for the current user
 */
export function usePermission(permission: Parameters<typeof hasPermission>[1]): boolean {
    const { user } = useAuthUser();
    return hasPermission(user?.userType, permission);
}
