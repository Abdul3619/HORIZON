import React, { useEffect, useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useHotel } from '../HotelContext';
import AdminDashboard from './AdminDashboard';
import { loadStoredSession, redeemMagicLink, clearSession, type AdminSession } from '../lib/adminClient';

// Gates the real admin dashboard behind a one-time magic link, the same pattern Shin Orne and Agbada Luxe
// use: there is no password form here at all. A visitor reaches /admin either with a valid session already
// stored (sessionStorage, cleared when the tab closes) or they don't get in -- there's nothing to guess.
export default function AdminGate() {
  const { setView } = useHotel();
  const [status, setStatus] = useState<'checking' | 'authed' | 'denied'>('checking');
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const pendingToken = sessionStorage.getItem('horizon_pending_magic_token');
    if (pendingToken) {
      sessionStorage.removeItem('horizon_pending_magic_token');
      redeemMagicLink(pendingToken).then((result) => {
        if (result.ok && result.session) {
          setSession(result.session);
          setStatus('authed');
        } else {
          setStatus('denied');
        }
      });
      return;
    }
    const existing = loadStoredSession();
    if (existing) {
      setSession(existing);
      setStatus('authed');
    } else {
      setStatus('denied');
    }
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-stone-300">
        <Loader2 className="animate-spin mr-3" size={20} />
        Checking access…
      </div>
    );
  }

  if (status === 'denied' || !session) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto mb-4 text-amber-400" size={40} />
          <h1 className="text-xl font-semibold text-stone-100 mb-2">Admin access is locked</h1>
          <p className="text-stone-400 text-sm mb-6">
            This dashboard only opens from a one-time link. Ask Abdulwahab to generate one, or reuse the link
            you were sent -- it works once and expires after 10 minutes.
          </p>
          <button
            onClick={() => {
              clearSession();
              setView('home');
            }}
            className="text-sm text-amber-400 hover:text-amber-300 underline"
          >
            Back to the hotel site
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard sessionToken={session.token} />;
}
