import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { AuthResponse, LoginRequest, RegisterRequest, ThemePreference, UserProfile } from '../types/session';
import { getErrorMessage } from '../utils/apiError';
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  persistSession,
  persistStoredUser,
  SESSION_EXPIRED_EVENT,
} from '../utils/sessionStorage';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  syncThemePreference: (themePreference: ThemePreference) => Promise<void>;
  updateStoredUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function clearSession() {
  clearStoredSession();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()) && !getStoredUser());

  useEffect(() => {
    async function bootstrapSession() {
      if (!getStoredToken()) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get<AuthResponse>('/auth/me');
        persistSession(data);
        setToken(data.token);
        setUser(data.user);
      } catch {
        clearSession();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void bootstrapSession();
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    persistSession(data);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    persistSession(data);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await api.get<AuthResponse>('/auth/me');
      persistSession(data);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      logout();
      throw new Error(getErrorMessage(error, 'Sua sessão expirou. Entre novamente.'));
    }
  }, [logout]);

  const syncThemePreference = useCallback(async (themePreference: ThemePreference) => {
    if (!user) {
      return;
    }
    const { data } = await api.put<UserProfile>('/profile', {
      name: user.name,
      accountType: user.accountType,
      themePreference,
    });
    persistStoredUser(data);
    setUser(data);
  }, [user]);

  const updateStoredUser = useCallback((nextUser: UserProfile) => {
    persistStoredUser(nextUser);
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshSession,
      syncThemePreference,
      updateStoredUser,
    }),
    [loading, login, logout, refreshSession, register, syncThemePreference, token, updateStoredUser, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider');
  }
  return context;
}
