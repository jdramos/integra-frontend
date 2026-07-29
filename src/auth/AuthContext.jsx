import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSession, loginRequest, logoutRequest } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const sessionUser = await getSession();
      setUser(sessionUser);
      return sessionUser;
    } catch {
      setUser(null);
      return null;
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refreshSession(); }, [refreshSession]);
  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener('auth:expired', expired);
    return () => window.removeEventListener('auth:expired', expired);
  }, []);

  const login = async (payload) => {
    const response = await loginRequest(payload);
    const userData = response?.user;
    if (!userData) throw new Error('Respuesta de login inválida');
    localStorage.removeItem('token'); localStorage.removeItem('user');
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try { await logoutRequest(); } finally {
      localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null);
    }
  };

  const value = useMemo(() => ({ user, loading, isAuthenticated: Boolean(user), login, logout, refreshSession }), [user, loading, refreshSession]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth() { return useContext(AuthContext); }
