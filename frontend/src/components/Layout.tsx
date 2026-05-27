import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Header } from './Header';

const items = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/partes', label: 'Partes' },
  { to: '/admin/trabajadores', label: 'Trabajadores' },
  { to: '/admin/actividades', label: 'Actividades' },
  { to: '/admin/predios', label: 'Predios' },
  { to: '/admin/usuarios', label: 'Usuarios' },
];

export function Layout({ children, title }: { children: ReactNode; title: string }) {
  const location = useLocation();

  return (
    <div className="page">
      <Header title={title} />
      <div className="container" style={{ display: 'grid', gap: 16 }}>
        <nav className="card admin-nav">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="btn btn-secondary"
              style={{ background: location.pathname === item.to ? 'var(--rojo)' : 'var(--crema)', color: location.pathname === item.to ? 'white' : 'var(--texto)' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
