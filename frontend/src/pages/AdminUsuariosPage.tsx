import { useEffect, useState } from 'react';
import { useToast } from '../components/Toast';
import { activateUser, createUser, deactivateUser, fetchUsers, updateUser } from '../api/admin.api';
import type { Rol } from '../types';

type UserItem = { id: number; nombre: string; email: string; rol: Rol; activo: boolean };

export default function AdminUsuariosPage() {
  const { pushToast } = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Rol>('WORKER');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setUsers(await fetchUsers());
  }

  useEffect(() => { void refresh(); }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    setLoading(true);
    try {
      if (editingId) {
        await updateUser(editingId, { nombre: nombre.trim(), email: email.trim(), password: password.trim() || undefined, rol });
        pushToast('Usuario actualizado', 'success');
      } else {
        await createUser({ nombre: nombre.trim(), email: email.trim(), password: password.trim(), rol });
        pushToast('Usuario creado', 'success');
      }

      setNombre('');
      setEmail('');
      setPassword('');
      setRol('WORKER');
      setEditingId(null);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(item: UserItem) {
    if (item.activo) {
      await deactivateUser(item.id);
      pushToast('Usuario desactivado', 'success');
    } else {
      await activateUser(item.id);
      pushToast('Usuario activado', 'success');
    }
    await refresh();
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <form className="card" style={{ padding: 16, display: 'grid', gap: 12 }} onSubmit={handleSubmit}>
        <h3 className="section-title">{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h3>
        <div className="responsive-grid">
          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={editingId ? 'Nueva contraseña opcional' : 'Contraseña'} type="password" />
          <select className="input" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
            <option value="WORKER">WORKER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}</button>
          {editingId && <button className="btn btn-secondary" type="button" onClick={() => { setEditingId(null); setNombre(''); setEmail(''); setPassword(''); setRol('WORKER'); }}>Cancelar</button>}
        </div>
      </form>

      <div className="mobile-cards">
        {users.map((user) => (
          <div key={user.id} className="mobile-card">
            <strong>{user.nombre}</strong>
            <div className="muted">{user.email}</div>
            <div className="muted">{user.rol} · {user.activo ? 'Activo' : 'Inactivo'}</div>
            <div className="form-actions" style={{ marginTop: 10 }}>
              <button className="btn btn-secondary" type="button" onClick={() => { setEditingId(user.id); setNombre(user.nombre); setEmail(user.email); setPassword(''); setRol(user.rol); }}>Editar</button>
              <button className="btn btn-secondary" type="button" onClick={() => void handleToggle(user)}>{user.activo ? 'Desactivar' : 'Activar'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
