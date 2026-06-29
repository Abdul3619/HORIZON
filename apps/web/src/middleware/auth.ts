// apps/web/src/middleware/auth.ts
// Supabase Auth JWT extraction and secure server-side session verification.

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../packages/db/src/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: string;
  };
}

/**
 * Extracts and verifies the bearer JWT token using the Supabase authenticating authority.
 * This guarantees that only valid and active Supabase users can bypass this wall.
 */
export async function verifyAuth(req: NextRequest): Promise<{ id: string; email?: string; role: string } | null> {
  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }

    // Call Supabase authentication service to fetch user from token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Supabase token verification error:', error?.message);
      return null;
    }

    // Extract role from custom app_metadata claims mapped from the trigger, or default to 'customer'
    const role = user.app_metadata?.role || 'customer';

    return {
      id: user.id,
      email: user.email,
      role,
    };
  } catch (err) {
    console.error('Unexpected auth verification error:', err);
    return null;
  }
}

/**
 * Next.js Edge-compatible auth verification helper
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized. Clear credentials must be provided.' },
    { status: 401 }
  );
}
