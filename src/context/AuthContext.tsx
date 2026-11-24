import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { apiFetch } from '../lib/api.ts';
import type {
  DbUser,
  NotificationPreferences,
  ProfileCompletion,
  StudentProfile,
} from '../types/index.ts';

interface SessionResponse {
  user: DbUser;
  profile: StudentProfile | null;
  notificationPreferences: NotificationPreferences | null;
  adminBootstrapped: boolean;
  profileCompletion: ProfileCompletion;
}

interface AuthContextValue {
  firebaseUser: User | null;
  dbUser: DbUser | null;
  profile: StudentProfile | null;
  profileCompletion: ProfileCompletion;
  notificationPreferences: NotificationPreferences | null;
  adminBootstrapped: boolean;
  loading: boolean;
  authError: string | null;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  bootstrapAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>({
    percentage: 0,
    missingFields: [],
  });
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences | null>(null);
  const [adminBootstrapped, setAdminBootstrapped] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const syncBackendSession = useCallback(async (fbUser: User) => {
    const token = await fbUser.getIdToken();
    const data = await apiFetch<SessionResponse>('/api/auth/session', { method: 'POST' }, token);
    setDbUser(data.user);
    setProfile(data.profile);
    setProfileCompletion(data.profileCompletion);
    setNotificationPreferences(data.notificationPreferences);
    setAdminBootstrapped(data.adminBootstrapped);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthError(null);
      if (!user) {
        setDbUser(null);
        setProfile(null);
        setProfileCompletion({ percentage: 0, missingFields: [] });
        setNotificationPreferences(null);
        setLoading(false);
        return;
      }

      try {
        await syncBackendSession(user);
      } catch (error) {
        setAuthError(
          error instanceof Error ? error.message : 'Unable to verify your session.'
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncBackendSession]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      await syncBackendSession(result.user);
      setAuthModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google Sign-In did not complete.';
      setAuthError(message);
    }
  }, [syncBackendSession]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setDbUser(null);
    setProfile(null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!auth.currentUser) return;
    await syncBackendSession(auth.currentUser);
  }, [syncBackendSession]);

  const bootstrapAdmin = useCallback(async () => {
    if (!auth.currentUser) return;
    const token = await auth.currentUser.getIdToken();
    const data = await apiFetch<SessionResponse>(
      '/api/admin/bootstrap',
      { method: 'POST' },
      token
    );
    setDbUser(data.user);
    setProfile(data.profile);
    setProfileCompletion(data.profileCompletion);
    setNotificationPreferences(data.notificationPreferences);
    setAdminBootstrapped(data.adminBootstrapped);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        dbUser,
        profile,
        profileCompletion,
        notificationPreferences,
        adminBootstrapped,
        loading,
        authError,
        authModalOpen,
        openAuthModal: () => {
          setAuthError(null);
          setAuthModalOpen(true);
        },
        closeAuthModal: () => setAuthModalOpen(false),
        signInWithGoogle,
        logout,
        refreshSession,
        bootstrapAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
