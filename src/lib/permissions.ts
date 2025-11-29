import type { UserRole, Incident, UserProfile } from './types';

export type Permission =
    | 'incidents.view.all'
    | 'incidents.view.department'
    | 'incidents.view.own'
    | 'incidents.create'
    | 'incidents.update'
    | 'incidents.delete'
    | 'incidents.assign'
    | 'departments.manage'
    | 'users.manage'
    | 'analytics.view'
    | 'config.manage'
    | 'elections.access';

/**
 * Role-based permission mappings
 * Defines what each user role can do in the system
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
    citizen: [
        'incidents.create',
        'incidents.view.own',
    ],
    responseUnit: [
        'incidents.view.department',
        'incidents.update',
    ],
    regionalAuthority: [
        'incidents.view.all',
        'incidents.create',
        'incidents.update',
        'incidents.assign',
        'analytics.view',
        'elections.access',
    ],
    dataAnalyst: [
        'incidents.view.all',
        'analytics.view',
        'elections.access',
    ],
    admin: [
        'incidents.view.all',
        'incidents.create',
        'incidents.update',
        'incidents.delete',
        'incidents.assign',
        'departments.manage',
        'users.manage',
        'analytics.view',
        'config.manage',
        'elections.access',
    ],
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(
    userType: UserRole | undefined,
    permission: Permission
): boolean {
    if (!userType) return false;
    return rolePermissions[userType]?.includes(permission) ?? false;
}

/**
 * Check if a user can access a specific incident
 * Takes into account the user's role and department
 */
export function canAccessIncident(
    user: UserProfile | null | undefined,
    incident: Incident
): boolean {
    if (!user) return false;

    // Admins, regional authorities, and data analysts can access all incidents
    if (hasPermission(user.userType, 'incidents.view.all')) {
        return true;
    }

    // Department users (response units) can access their department's incidents
    if (hasPermission(user.userType, 'incidents.view.department')) {
        return incident.departmentId === user.departmentId;
    }

    // Citizens can only access incidents they reported
    if (hasPermission(user.userType, 'incidents.view.own')) {
        return incident.reporter?.userId === user.id;
    }

    return false;
}

/**
 * Get a list of all permissions for a user
 */
export function getUserPermissions(userType: UserRole | undefined): Permission[] {
    if (!userType) return [];
    return rolePermissions[userType] || [];
}

/**
 * Check if a user has multiple permissions (AND logic)
 */
export function hasAllPermissions(
    userType: UserRole | undefined,
    permissions: Permission[]
): boolean {
    return permissions.every(permission => hasPermission(userType, permission));
}

/**
 * Check if a user has any of the permissions (OR logic)
 */
export function hasAnyPermission(
    userType: UserRole | undefined,
    permissions: Permission[]
): boolean {
    return permissions.some(permission => hasPermission(userType, permission));
}
