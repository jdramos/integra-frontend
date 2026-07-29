import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../auth/AuthContext';

export default function ProtectedRoute({ children, roles = [], requiredModule = "" }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  if (requiredModule && !Boolean(user?.[requiredModule])) {
    return <Navigate to="/company" replace />;
  }

  return children;
}
