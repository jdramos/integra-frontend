import React, { createContext, useContext, useMemo, useState } from 'react';
import { loginRequest } from '../api/auth';

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');

    if (!raw || raw === 'undefined' || raw === 'null') {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const isAuthenticated = Boolean(user);

  const login = async (payload) => {
    const response = await loginRequest(payload);


    const token =
      response?.data?.token ||
      response?.token;

    const userData =
      response?.data?.user ||
      response?.user;

    if (!token || !userData) {
      throw new Error('Respuesta de login inválida');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
const loginWithOAuth = ({ token, user }) => {
  console.log("LOGIN WITH OAUTH:", token, user);

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  setUser(user);
};


const value = useMemo(
  () => ({
    user,
    isAuthenticated,
    login,
    logout,
    loginWithOAuth,
  }),
  [user, isAuthenticated]
);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth() {
  return useContext(AuthContext);
}

const setOAuthUser = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
  setUser(userData);
};