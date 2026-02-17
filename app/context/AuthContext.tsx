'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth, GoogleAuthProvider, hasFirebaseConfig } from '@/app/lib/firebase';
import { removePresence, stopHeartbeat } from '@/app/lib/presence';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = getFirebaseAuth();
  const isConfigured = hasFirebaseConfig;

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const login = async () => {
    if (!auth) {
      alert('Firebase not configured. Add API keys to .env.local');
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    if (auth) {
      stopHeartbeat();
      await removePresence();
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isConfigured, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
