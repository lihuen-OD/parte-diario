import { useEffect, useState } from 'react';
import { useToast } from '../components/Toast';
import { activateTrabajador, createTrabajador, deactivateTrabajador, fetchAdminTrabajadores, updateTrabajador } from '../api/admin.api';

type TrabajadorItem = { id: number; nombre: string; activo: boolean };

export default function AdminTrabajadoresPage() {
  const { pushToast } = useToast();
  const [items, setItems] = useState<TrabajadorItem[]>([]);
  const [nombre, setNombre] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setItems(await fetchAdminTrabajadores());
  }

  useEffect(() => { void refresh(); }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);
    try {
      if (editingId) {
        await updateTrabajador(editingId, nombre.trim());
        pushToast('Trabajador actualizado', 'success');
      } else {
        await createTrabajador(nombre.trim());
        pushToast('Trabajador creado', 'success');
      }

      setNombre('');
      setEditingId(null);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(item: TrabajadorItem) {
    if (item.activo) {
      await deactivateTrabajador(item.id);
      pushToast('Trabajador desactivado', 'success');
    } else {
      await activateTrabajador(item.id);
      pushToast('Trabajador activado', 'success');
    }
    await refresh();
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <form className="card" style={{ padding: 16, display: 'grid', gap: 12 }} onSubmit={handleSubmit}>
        <h3 className="section-title">{editingId ? 'Editar trabajador' : 'Nuevo trabajador'}</h3>
        <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del trabajador" />
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}</button>
          {editingId && <button className="btn btn-secondary" type="button" onClick={() => { setEditingId(null); setNombre(''); }}>Cancelar</button>}
        </div>
      </form>

      <div className="mobile-cards">
        {items.map((item) => (
          <div key={item.id} className="mobile-card">
            <strong>{item.nombre}</strong>
            <div className="muted">{item.activo ? 'Activo' : 'Inactivo'}</div>
            <div className="form-actions" style={{ marginTop: 10 }}>
              <button className="btn btn-secondary" type="button" onClick={() => { setEditingId(item.id); setNombre(item.nombre); }}>Editar</button>
              <button className="btn btn-secondary" type="button" onClick={() => void handleToggle(item)}>{item.activo ? 'Desactivar' : 'Activar'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

