import { useEffect, useMemo, useState } from 'react';
import type { ParteDiario, Trabajador, Actividad, Predio, Usuario } from '../types';
import { fetchAdminPartes, exportPartesXlsx, syncGoogleSheets, deleteParte, updateParte } from '../api/admin.api';
import { fetchAdminActividades, fetchAdminPredios, fetchAdminTrabajadores, fetchUsers } from '../api/admin.api';
import { useToast } from '../components/Toast';
import { formatDateDisplay, formatDateTimeDisplay, toDateOnlyString } from '../utils/dateFormat';

type ParteDetalleForm = {
  trabajadorId: string;
  actividadId: string;
  predioId: string;
  horas: string;
  total: string;
  observaciones: string;
};

type ParteEditForm = {
  localId: string;
  fecha: string;
  detalles: ParteDetalleForm[];
};

type ParteFilters = {
  fechaDesde: string;
  fechaHasta: string;
  trabajadorId: string;
  actividadId: string;
  predioId: string;
  creadoPorId: string;
};

const emptyDetalle = (): ParteDetalleForm => ({
  trabajadorId: '',
  actividadId: '',
  predioId: '',
  horas: '',
  total: '',
  observaciones: '',
});

const emptyFilters: ParteFilters = {
  fechaDesde: '',
  fechaHasta: '',
  trabajadorId: '',
  actividadId: '',
  predioId: '',
  creadoPorId: '',
};

function buildFormFromParte(parte: ParteDiario): ParteEditForm {
  return {
    localId: parte.localId ?? '',
    fecha: toDateOnlyString(parte.fecha),
    detalles: parte.detalles.length > 0
      ? parte.detalles.map((detalle) => ({
          trabajadorId: String(detalle.trabajadorId),
          actividadId: String(detalle.actividadId),
          predioId: String(detalle.predioId),
          horas: String(detalle.horas),
          total: String(detalle.total),
          observaciones: detalle.observaciones ?? '',
        }))
      : [emptyDetalle()],
  };
}

export default function AdminPartesPage() {
  const { pushToast } = useToast();
  const [partes, setPartes] = useState<ParteDiario[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [predios, setPredios] = useState<Predio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filters, setFilters] = useState<ParteFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<ParteFilters>(emptyFilters);
  const [selected, setSelected] = useState<ParteDiario | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<ParteEditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const creadorOptions = useMemo(
    () => usuarios.map((usuario) => ({ id: usuario.id, nombre: usuario.nombre })),
    [usuarios],
  );

  async function loadAll(nextFilters: ParteFilters = appliedFilters) {
    const [allPartes, tr, act, pre, users] = await Promise.all([
      fetchAdminPartes(Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value !== '')) as Record<string, string>),
      fetchAdminTrabajadores(),
      fetchAdminActividades(),
      fetchAdminPredios(),
      fetchUsers(),
    ]);
    setPartes(allPartes);
    setTrabajadores(tr);
    setActividades(act);
    setPredios(pre);
    setUsuarios(users);
  }

  useEffect(() => { void loadAll(); }, []);

  const rows = useMemo(() => partes.flatMap((parte) => parte.detalles
    .filter((detalle) => {
      if (appliedFilters.trabajadorId && detalle.trabajadorId !== Number(appliedFilters.trabajadorId)) return false;
      if (appliedFilters.actividadId && detalle.actividadId !== Number(appliedFilters.actividadId)) return false;
      if (appliedFilters.predioId && detalle.predioId !== Number(appliedFilters.predioId)) return false;
      return true;
    })
    .map((detalle, index) => ({ parte, detalle, key: `${parte.id}-${detalle.id ?? index}` }))),
  [appliedFilters.actividadId, appliedFilters.predioId, appliedFilters.trabajadorId, partes]);

  async function handleExport() {
    const blob = await exportPartesXlsx();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'partes.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSync() {
    try {
      const result = await syncGoogleSheets();
      pushToast(result.message ?? 'Sincronización completada', result.ok ? 'success' : 'info');
      await loadAll();
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo sincronizar con Google Sheets';
      pushToast(message, 'error');
    }
  }

  async function handleDelete(id: number) {
    await deleteParte(id);
    pushToast('Parte eliminado', 'success');
    await loadAll();
  }

  function applyFilters() {
    setAppliedFilters(filters);
    void loadAll(filters);
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    void loadAll(emptyFilters);
  }

  function startEdit(parte: ParteDiario) {
    setSelected(parte);
    setEditMode(true);
    setEditForm(buildFormFromParte(parte));
  }

  function updateDetalle(index: number, field: keyof ParteDetalleForm, value: string) {
    setEditForm((current) => {
      if (!current) return current;
      return {
        ...current,
        detalles: current.detalles.map((detalle, detalleIndex) => (detalleIndex === index ? { ...detalle, [field]: value } : detalle)),
      };
    });
  }

  function addDetalle() {
    setEditForm((current) => current ? { ...current, detalles: [...current.detalles, emptyDetalle()] } : current);
  }

  function removeDetalle(index: number) {
    setEditForm((current) => {
      if (!current) return current;
      const next = current.detalles.filter((_, detalleIndex) => detalleIndex !== index);
      return { ...current, detalles: next.length > 0 ? next : [emptyDetalle()] };
    });
  }

  function closeEditor() {
    setSelected(null);
    setEditMode(false);
    setEditForm(null);
  }

  async function handleSaveEdit() {
    if (!selected || !editForm) return;

    if (!editForm.fecha) {
      pushToast('La fecha es obligatoria', 'error');
      return;
    }

    if (editForm.detalles.length === 0) {
      pushToast('Debés cargar al menos una fila', 'error');
      return;
    }

    for (const detalle of editForm.detalles) {
      if (!detalle.trabajadorId || !detalle.actividadId || !detalle.predioId) {
        pushToast('Cada fila debe tener trabajador, actividad y predio', 'error');
        return;
      }

      if (Number(detalle.horas) < 0 || Number(detalle.total) < 0) {
        pushToast('Las horas y el total deben ser 0 o mayores', 'error');
        return;
      }
    }

    setSavingEdit(true);
    try {
      await updateParte(selected.id, {
        localId: editForm.localId.trim() || undefined,
        fecha: editForm.fecha,
        detalles: editForm.detalles.map((detalle) => ({
          trabajadorId: Number(detalle.trabajadorId),
          actividadId: Number(detalle.actividadId),
          predioId: Number(detalle.predioId),
          horas: Number(detalle.horas),
          total: Number(detalle.total),
          observaciones: detalle.observaciones,
        })),
      });
      pushToast('Parte actualizado', 'success');
      closeEditor();
      await loadAll();
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
        <div className="responsive-grid">
          <div className="field">
            <label>Fecha desde</label>
            <input className="input" type="date" value={filters.fechaDesde} onChange={(e) => setFilters((current) => ({ ...current, fechaDesde: e.target.value }))} />
          </div>
          <div className="field">
            <label>Fecha hasta</label>
            <input className="input" type="date" value={filters.fechaHasta} onChange={(e) => setFilters((current) => ({ ...current, fechaHasta: e.target.value }))} />
          </div>
          <div className="field">
            <label>Trabajador</label>
            <select className="input" value={filters.trabajadorId} onChange={(e) => setFilters((current) => ({ ...current, trabajadorId: e.target.value }))}>
              <option value="">Todos</option>
              {trabajadores.map((trabajador) => <option key={trabajador.id} value={trabajador.id}>{trabajador.nombre}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Actividad</label>
            <select className="input" value={filters.actividadId} onChange={(e) => setFilters((current) => ({ ...current, actividadId: e.target.value }))}>
              <option value="">Todos</option>
              {actividades.map((actividad) => <option key={actividad.id} value={actividad.id}>{actividad.nombre}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Predio</label>
            <select className="input" value={filters.predioId} onChange={(e) => setFilters((current) => ({ ...current, predioId: e.target.value }))}>
              <option value="">Todos</option>
              {predios.map((predio) => <option key={predio.id} value={predio.id}>{predio.nombre}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Cargado por</label>
            <select className="input" value={filters.creadoPorId} onChange={(e) => setFilters((current) => ({ ...current, creadoPorId: e.target.value }))}>
              <option value="">Todos</option>
              {creadorOptions.map((creador) => <option key={creador.id} value={creador.id}>{creador.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={applyFilters}>Aplicar filtros</button>
          <button className="btn btn-secondary" onClick={resetFilters}>Limpiar filtros</button>
          <button className="btn btn-secondary" onClick={() => void handleExport()}>Exportar Excel</button>
          <button className="btn btn-secondary" onClick={() => void handleSync()}>Sincronizar Google Sheets</button>
        </div>
      </div>

      <div className="mobile-cards admin-partes-cards mobile-only">
        {rows.map(({ parte, detalle, key }) => (
          <div key={key} className="mobile-card" style={{ display: 'grid', gap: 10 }}>
            <div>
              <strong>{formatDateDisplay(parte.fecha)} · {parte.dia}</strong>
              <div className="muted">{parte.creadoPor?.nombre ?? parte.creadoPorId}</div>
            </div>
            <div className="responsive-grid">
              <div>
                <div className="muted">Trabajador</div>
                <strong>{detalle.trabajador?.nombre ?? detalle.trabajadorId}</strong>
              </div>
              <div>
                <div className="muted">Actividad</div>
                <strong>{detalle.actividad?.nombre ?? detalle.actividadId}</strong>
              </div>
              <div>
                <div className="muted">Predio</div>
                <strong>{detalle.predio?.nombre ?? detalle.predioId}</strong>
              </div>
              <div>
                <div className="muted">Horas / Total</div>
                <strong>{detalle.horas} / {detalle.total}</strong>
              </div>
            </div>
            {detalle.observaciones ? <div className="muted">{detalle.observaciones}</div> : null}
            <div className="muted">Carga: {formatDateTimeDisplay(parte.createdAt)}</div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => startEdit(parte)}>Editar</button>
              <button className="btn btn-danger" onClick={() => void handleDelete(parte.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="table-wrap desktop-table">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th><th>Día</th><th>Trabajador</th><th>Actividad</th><th>Predio</th><th>Horas</th><th>Total</th><th>Obs</th><th>Cargado por</th><th>Carga</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ parte, detalle, key }) => (
              <tr key={key}>
                <td>{formatDateDisplay(parte.fecha)}</td>
                <td>{parte.dia}</td>
                <td>{detalle.trabajador?.nombre ?? detalle.trabajadorId}</td>
                <td>{detalle.actividad?.nombre ?? detalle.actividadId}</td>
                <td>{detalle.predio?.nombre ?? detalle.predioId}</td>
                <td>{detalle.horas}</td>
                <td>{detalle.total}</td>
                <td>{detalle.observaciones}</td>
                <td>{parte.creadoPor?.nombre ?? parte.creadoPorId}</td>
                <td>{formatDateTimeDisplay(parte.createdAt)}</td>
                <td>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => startEdit(parte)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => void handleDelete(parte.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && editMode && (
        <div className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
          <h3 className="section-title">Editar parte #{selected.id}</h3>
          <div className="responsive-grid">
            <div className="field">
              <label>Fecha</label>
              <input className="input" type="date" value={editForm?.fecha ?? ''} onChange={(e) => setEditForm((current) => current ? { ...current, fecha: e.target.value } : current)} />
            </div>
            <div className="field">
              <label>Local ID</label>
              <input className="input" value={editForm?.localId ?? ''} onChange={(e) => setEditForm((current) => current ? { ...current, localId: e.target.value } : current)} placeholder="Opcional" />
            </div>
          </div>

          <div className="grid" style={{ gap: 12 }}>
            {editForm?.detalles.map((detalle, index) => (
              <div key={index} className="card" style={{ padding: 12, background: 'rgba(255,255,255,0.7)' }}>
                <div className="responsive-grid">
                  <div className="field">
                    <label>Trabajador</label>
                    <select className="input" value={detalle.trabajadorId} onChange={(e) => updateDetalle(index, 'trabajadorId', e.target.value)}>
                      <option value="">Seleccionar</option>
                      {trabajadores.map((trabajador) => <option key={trabajador.id} value={trabajador.id}>{trabajador.nombre}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Actividad</label>
                    <select className="input" value={detalle.actividadId} onChange={(e) => updateDetalle(index, 'actividadId', e.target.value)}>
                      <option value="">Seleccionar</option>
                      {actividades.map((actividad) => <option key={actividad.id} value={actividad.id}>{actividad.nombre}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Predio</label>
                    <select className="input" value={detalle.predioId} onChange={(e) => updateDetalle(index, 'predioId', e.target.value)}>
                      <option value="">Seleccionar</option>
                      {predios.map((predio) => <option key={predio.id} value={predio.id}>{predio.nombre}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Horas</label>
                    <input className="input" type="number" step="0.5" min="0" value={detalle.horas} onChange={(e) => updateDetalle(index, 'horas', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Total</label>
                    <input className="input" type="number" step="0.5" min="0" value={detalle.total} onChange={(e) => updateDetalle(index, 'total', e.target.value)} />
                  </div>
                </div>
                <div className="field" style={{ marginTop: 10 }}>
                  <label>Observaciones</label>
                  <input className="input" value={detalle.observaciones} onChange={(e) => updateDetalle(index, 'observaciones', e.target.value)} placeholder="Opcional" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button className="btn btn-secondary" type="button" onClick={() => removeDetalle(index)}>Quitar fila</button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" type="button" onClick={addDetalle}>+ Agregar fila</button>
            <button className="btn btn-primary" onClick={() => void handleSaveEdit()} disabled={savingEdit}>{savingEdit ? 'Guardando...' : 'Guardar cambios'}</button>
            <button className="btn btn-ghost" type="button" onClick={closeEditor}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
