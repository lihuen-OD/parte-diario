import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Rol, Usuario } from '../types';
import { meRequest, loginRequest } from '../api/auth.api';
import { setAuthToken, setUnauthorizedHandler } from '../api/axios';
import { useNavigate } from 'react-router-dom';

type AuthState = {
  token: string | null;
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => void;
  refreshMe: () => Promise<Usuario | null>;
};

const STORAGE_KEY = 'pdp_auth';

const AuthContext = createContext<AuthState | null>(null);

function readStoredAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, user: null };
  try {
    return JSON.parse(raw) as { token: string | null; user: Usuario | null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const stored = readStoredAuth();
  const [token, setToken] = useState<string | null>(stored.token);
  const [user, setUser] = useState<Usuario | null>(stored.user);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((nextToken: string | null, nextUser: Usuario | null) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  }, []);

  const logout = useCallback(() => {
    persist(null, null);
    navigate('/login', { replace: true });
  }, [navigate, persist]);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      setAuthToken(token);
      const response = await meRequest();
      const currentUser = response.user as Usuario;
      persist(token, currentUser);
      return currentUser;
    } catch {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  }, [logout, persist, token]);

  useEffect(() => {
    setAuthToken(token);
    setUnauthorizedHandler(() => logout);
    void refreshMe();
    return () => setUnauthorizedHandler(null);
  }, [logout, refreshMe, token]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await loginRequest(email, password);
      persist(response.token, response.user as Usuario);
      return response.user as Usuario;
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo iniciar sesión';
      throw new Error(message);
    }
  }, [persist]);

  const value = useMemo(() => ({ token, user, loading, login, logout, refreshMe }), [token, user, loading, login, logout, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
