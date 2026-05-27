import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/Toast';

export default function LoginPage() {
  const { login, user, token } = useAuth();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      navigate(user.rol === 'ADMIN' ? '/admin' : '/parte-diario', { replace: true });
    }
  }, [navigate, token, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const current = await login(email, password);
      pushToast('Inicio de sesión correcto', 'success');
      navigate(current.rol === 'ADMIN' ? '/admin' : '/parte-diario', { replace: true });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'No se pudo iniciar sesión';
      setError(message);
      pushToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', padding: 16 }}>
      <div className="card" style={{ width: 'min(100%, 420px)', padding: 20 }}>
        <div style={{ display: 'grid', gap: 8, marginBottom: 18, textAlign: 'center' }}>
          <div className="brand" style={{ justifyContent: 'center' }}>
            <div className="brand-badge">P</div>
            <h1 style={{ margin: 0 }}>Parte Diario Personal</h1>
          </div>
          <p className="muted" style={{ margin: 0 }}>Accedé con tu usuario ADMIN o WORKER</p>
        </div>
        <form onSubmit={handleSubmit} className="grid">
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@partediario.com" />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          </div>
          {error ? <div className="error">{error}</div> : null}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        </form>
        <div className="muted" style={{ marginTop: 16, fontSize: 13 }}>
          Admin: admin@partediario.com / admin123<br />
          Worker: worker@partediario.com / worker123
        </div>
      </div>
    </div>
  );
}
