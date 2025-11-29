import React from 'react';
import { useAuthUser } from '@/hooks/use-auth-user';
import { hasPermission, type Permission } from '@/lib/permissions';

interface PermissionGateProps {
    permission: Permission;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * <PermissionGate permission="incidents.delete">
 *   <DeleteButton />
 * </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }: Permission GateProps) {
    const { user } = useAuthUser();

    if (!user || !hasPermission(user.userType, permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

interface MultiPermissionGateProps {
    permissions: Permission[];
    requireAll?: boolean; // If true, user must have ALL permissions. If false, user must have ANY permission
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on multiple permissions
 * 
 * @example
 * <MultiPermissionGate permissions={['incidents.update', 'incidents.assign']} requireAll={false}>
 *   <ActionButtons />
 * </MultiPermissionGate>
 */
export function MultiPermissionGate({
    permissions,
    requireAll = true,
    children,
    fallback = null
}: MultiPermissionGateProps) {
    const { user } = useAuthUser();

    if (!user) return <>{fallback}</>;

    const hasAccess = requireAll
        ? permissions.every(p => hasPermission(user.userType, p))
        : permissions.some(p => hasPermission(user.userType, p));

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
