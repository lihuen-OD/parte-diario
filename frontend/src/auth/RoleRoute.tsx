import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { Rol } from '../types';

export default function RoleRoute({ children, allow, redirectTo }: { children: ReactNode; allow: Rol[]; redirectTo: string }) {
  const { user } = useAuth();

  if (!user) return null;
  if (!allow.includes(user.rol)) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}
