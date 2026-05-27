import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) return <div className="container">Cargando...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
