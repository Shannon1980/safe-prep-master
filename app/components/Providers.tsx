'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import Header from '@/app/components/Header';
import FloatingCoach from '@/app/components/FloatingCoach';
import {
  updatePresence,
  removePresence,
  startHeartbeat,
  updateHeartbeatPath,
  stopHeartbeat,
} from '@/app/lib/presence';

const HIDE_COACH_ROUTES = ['/exam', '/quiz', '/flashcards'];

function PresenceTracker() {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    updatePresence(pathname);
    startHeartbeat(pathname);

    return () => {
      stopHeartbeat();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    updatePresence(pathname);
    updateHeartbeatPath(pathname);
  }, [pathname, user]);

  useEffect(() => {
    if (!user) return;
    const handleUnload = () => {
      removePresence();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showCoach = !HIDE_COACH_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <AuthProvider>
      <PresenceTracker />
      <Header />
      {children}
      {showCoach && <FloatingCoach />}
    </AuthProvider>
  );
}
