// Browser-side Supabase client for the admin dashboard. This uses only the public anon key -- safe to ship
// in the bundle -- because real access is gated by the horizon_admin_* SECURITY DEFINER functions (see the
// "horizon_admin_rpc_functions" migration), not by this key. Each admin RPC call takes a session token that
// was itself minted by redeeming a one-time magic link, and the functions check that token themselves.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const adminSupabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

const SESSION_KEY = 'horizon_admin_session';

export interface AdminSession {
  token: string;
  expiresAt: string;
}

export function loadStoredSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed.token || !parsed.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function storeSession(session: AdminSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function redeemMagicLink(token: string): Promise<{ ok: boolean; error?: string; session?: AdminSession }> {
  if (!adminSupabase) return { ok: false, error: 'not_configured' };
  const { data, error } = await adminSupabase.rpc('horizon_admin_redeem_magic_link', { p_token: token });
  if (error) return { ok: false, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.ok) return { ok: false, error: row?.error || 'unknown' };
  const session = { token: row.session_token as string, expiresAt: row.expires_at as string };
  storeSession(session);
  return { ok: true, session };
}
