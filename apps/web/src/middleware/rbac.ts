// apps/web/src/middleware/rbac.ts
// Role-Based Access Control Guards for administrative and staff gates.

import { NextResponse } from 'next/server';
import { UserRole } from '../../../../packages/db/src/supabase';

/**
 * Validates if the authenticated user has any of the acceptable administrative privileges.
 */
export function checkRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Convenience helper to block non-admin or unauthorized calls.
 */
export function forbiddenResponse() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Forbidden. You do not possess the required privilege layer to execute this command.' 
    },
    { status: 403 }
  );
}

/**
 * Standard Admin Roles subset mapping
 */
export const ADMIN_STAFF_ROLES: UserRole[] = ['admin', 'manager', 'receptionist'];
export const ROOT_ADMIN_ROLES: UserRole[] = ['admin', 'manager'];
