import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import type { UserProfile, Incident } from '@/lib/types';
import { hasPermission, canAccessIncident, type Permission } from '@/lib/permissions';

/**
 * Get the authenticated user from the session
 * @throws Error if user is not authenticated
 */
export async function getAuthenticatedUser(): Promise<UserProfile> {
    try {
        // Get auth token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            throw new Error('Unauthorized: No authentication token found');
        }

        // Verify the token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get user profile from database
        const userSnapshot = await db.ref(`users/${userId}`).once('value');
        const userProfile = userSnapshot.val();

        if (!userProfile) {
            throw new Error('User profile not found');
        }

        return { ...userProfile, id: userId };
    } catch (error: any) {
        console.error('Authentication error:', error);
        throw new Error(`Authentication failed: ${error.message}`);
    }
}

/**
 * Check if the authenticated user has a specific permission
 * @throws Error if user doesn't have permission
 */
export async function requirePermission(permission: Permission): Promise<UserProfile> {
    const user = await getAuthenticatedUser();

    if (!hasPermission(user.userType, permission)) {
        throw new Error(`Permission denied: User does not have '${permission}' permission`);
    }

    return user;
}

/**
 * Check if the authenticated user can access a specific incident
 * @throws Error if user cannot access the incident
 */
export async function requireIncidentAccess(incidentId: string): Promise<{ user: UserProfile; incident: Incident }> {
    const user = await getAuthenticatedUser();

    // Get the incident
    const incidentSnapshot = await db.ref(`incidents/${incidentId}`).once('value');
    const incident = incidentSnapshot.val();

    if (!incident) {
        throw new Error('Incident not found');
    }

    // Check access
    if (!canAccessIncident(user, incident)) {
        throw new Error('Access denied: You cannot access this incident');
    }

    return { user, incident };
}

/**
 * Check if the authenticated user can access a specific department
 * @throws Error if user cannot access the department
 */
export async function requireDepartmentAccess(departmentId: string): Promise<UserProfile> {
    const user = await getAuthenticatedUser();

    // Admins can access any department
    if (hasPermission(user.userType, 'departments.manage')) {
        return user;
    }

    // Check if user belongs to this department
    if (user.departmentId !== departmentId) {
        throw new Error('Access denied: You can only access your own department');
    }

    return user;
}

/**
 * Wrapper for try-catch error handling in server actions
 */
export async function withAuth<T>(
    action: (user: UserProfile) => Promise<T>
): Promise<T> {
    try {
        const user = await getAuthenticatedUser();
        return await action(user);
    } catch (error: any) {
        throw error;
    }
}
