import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import {
  createDemoInvalidCredentialsError,
  DEMO_AUTH_RESPONSE,
  isDemoCredentials,
  isDemoEmail,
  normalizeDemoEmail,
} from '../data/demoSession';
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
  login: (payload: LoginRequest, options?: AuthRequestOptions) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  syncThemePreference: (themePreference: ThemePreference) => Promise<void>;
  updateStoredUser: (user: UserProfile) => void;
}

interface AuthRequestOptions {
  signal?: AbortSignal;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface SessionState {
  user: UserProfile | null;
  token: string | null;
}

function readInitialSession(): SessionState {
  const token = getStoredToken();
  const user = getStoredUser();

  if (token && !user) {
    clearStoredSession();
    return { token: null, user: null };
  }

  return { token, user };
}

export function clearSession() {
  clearStoredSession();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ token, user }, setSession] = useState<SessionState>(readInitialSession);
  const loading = false;

  useEffect(() => {
    function handleSessionExpired() {
      setSession({ token: null, user: null });
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  const login = useCallback(async (payload: LoginRequest, options?: AuthRequestOptions) => {
    const normalizedEmail = normalizeDemoEmail(payload.email);

    if (isDemoEmail(normalizedEmail)) {
      if (!isDemoCredentials(normalizedEmail, payload.password)) {
        throw createDemoInvalidCredentialsError();
      }

      console.info('[Auth] Login demo local concluído sem depender da API externa.', {
        email: normalizedEmail,
      });
      persistSession(DEMO_AUTH_RESPONSE);
      setSession({ token: DEMO_AUTH_RESPONSE.token, user: DEMO_AUTH_RESPONSE.user });
      return;
    }

    const { data } = await api.post<AuthResponse>('/auth/login', payload, { signal: options?.signal });
    persistSession(data);
    setSession({ token: data.token, user: data.user });
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    persistSession(data);
    setSession({ token: data.token, user: data.user });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession({ token: null, user: null });
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await api.get<AuthResponse>('/auth/me');
      persistSession(data);
      setSession({ token: data.token, user: data.user });
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
    setSession((current) => ({ ...current, user: data }));
  }, [user]);

  const updateStoredUser = useCallback((nextUser: UserProfile) => {
    persistStoredUser(nextUser);
    setSession((current) => ({ ...current, user: nextUser }));
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
