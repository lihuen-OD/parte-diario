import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Header({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" to={user?.rol === 'ADMIN' ? '/admin' : '/parte-diario'}>
          <div className="brand-badge">P</div>
          <div className="brand-title">
            <div>{title}</div>
            <small className="muted">Parte Diario Personal</small>
          </div>
        </Link>
        <div className="header-actions">
          <div className="muted header-user">
            <div>{user?.nombre ?? ''}</div>
            <small>{user?.rol}</small>
          </div>
          <button className="btn btn-ghost" onClick={logout}>Salir</button>
        </div>
      </div>
    </header>
  );
}
