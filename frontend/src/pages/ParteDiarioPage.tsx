import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { BottomBar } from '../components/BottomBar';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { ParteRow } from '../components/ParteRow';
import { FieldError } from '../components/FieldError';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/Toast';
import type { Actividad, ParteDetalle, ParteDiario, Predio, Trabajador } from '../types';
import { createLocalId } from '../utils/localId';
import { getDayFromDate } from '../utils/day';
import { formatDateDisplay, formatDateTimeDisplay, getTodayDateOnly, toDateOnlyString } from '../utils/dateFormat';
import { isParteValid, validateParteForm } from '../utils/validators';
import { createParte, fetchMisPartes } from '../api/partes.api';
import { loadCatalogos } from '../offline/catalogCache';

export default function ParteDiarioPage() {
  const { user, logout } = useAuth();
  const { pushToast } = useToast();
  const [online, setOnline] = useState(navigator.onLine);
  const [fecha, setFecha] = useState(getTodayDateOnly());
  const [fechaBusqueda, setFechaBusqueda] = useState('');
  const [detalles, setDetalles] = useState<ParteDetalle[]>([]);
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [predios, setPredios] = useState<Predio[]>([]);
  const [misPartes, setMisPartes] = useState<ParteDiario[]>([]);
  const [loading, setLoading] = useState(false);

  const dia = useMemo(() => getDayFromDate(fecha), [fecha]);
  const formularioValido = isParteValid(fecha, detalles);
  const misPartesOrdenadas = useMemo(
    () => [...misPartes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [misPartes],
  );
  const misPartesVisibles = useMemo(() => {
    if (fechaBusqueda) {
      return misPartesOrdenadas.filter((parte) => toDateOnlyString(parte.fecha) === fechaBusqueda);
    }

    return misPartesOrdenadas.slice(0, 1);
  }, [fechaBusqueda, misPartesOrdenadas]);

  function createDetalle(trabajadorId: number): ParteDetalle {
    return {
      trabajadorId,
      actividadId: 0,
      predioId: 0,
      horas: 0,
      total: 0,
      observaciones: '',
    };
  }

  function syncDetallesWithWorkers(nextWorkers: Trabajador[]) {
    setDetalles((current) => {
      const currentByWorker = new Map(current.map((detalle) => [detalle.trabajadorId, detalle]));
      return nextWorkers.map((worker) => currentByWorker.get(worker.id) ?? createDetalle(worker.id));
    });
  }

  async function refreshLists() {
    const catalogos = await loadCatalogos(true);
    setTrabajadores(catalogos.trabajadores);
    setActividades(catalogos.actividades);
    setPredios(catalogos.predios);
    syncDetallesWithWorkers(catalogos.trabajadores);
  }

  async function refreshMisPartes() {
    try {
      const partes = await fetchMisPartes();
      setMisPartes(partes);
    } catch {
      setMisPartes([]);
    }
  }

  useEffect(() => {
    void refreshLists();
    void refreshMisPartes();

    const handleOnline = () => {
      setOnline(true);
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setErrors(validateParteForm(fecha, detalles));
  }, [fecha, detalles]);

  function updateRow(index: number, next: ParteDetalle) {
    setDetalles((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)));
  }

  function clearForm() {
    setFecha(getTodayDateOnly());
    setDetalles(trabajadores.map((trabajador) => createDetalle(trabajador.id)));
    setTouched(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);

    const currentErrors = validateParteForm(fecha, detalles);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    const payload = {
      localId: createLocalId(),
      fecha,
      detalles: detalles.map((item) => ({
        trabajadorId: item.trabajadorId,
        actividadId: item.actividadId,
        predioId: item.predioId,
        horas: item.horas,
        total: item.total,
        observaciones: item.observaciones ?? '',
      })),
    };

    setLoading(true);
    try {
      await createParte(payload);
      pushToast('Parte enviado correctamente', 'success');
      await refreshMisPartes();
    } catch {
      pushToast('No se pudo guardar el parte. Revisá la conexión e intentá nuevamente.', 'error');
    } finally {
      clearForm();
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <Header title="Parte Diario Personal" />
      <div className="container container-narrow" style={{ display: 'grid', gap: 16 }}>
        <div className="card" style={{ padding: 14, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div className="muted">Cargador de partes</div>
              <h2 style={{ margin: '4px 0 0' }}>{user?.nombre ?? 'Cargador de Partes'}</h2>
            </div>
            <ConnectionStatus online={online} pendingCount={0} />
          </div>
          <div className="two-col">
            <div className="field">
              <label>Fecha</label>
              <input className="input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              {touched && <FieldError message={errors.fecha} />}
            </div>
            <div className="field">
              <label>Día</label>
              <input className="input" value={dia} readOnly />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
          {trabajadores.length === 0 ? (
            <div className="card" style={{ padding: 14 }}>
              <p className="muted">Necesitás conectarte al menos una vez para cargar los trabajadores activos.</p>
            </div>
          ) : detalles.map((detalle, index) => (
            <ParteRow
              key={index}
              index={index}
              value={detalle}
              trabajador={trabajadores[index]}
              touched={touched}
              errors={errors}
              actividades={actividades}
              predios={predios}
              onChange={updateRow}
            />
          ))}
          {touched && <FieldError message={errors.detalles} />}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={loading || !formularioValido}>{loading ? 'Guardando...' : 'Guardar parte'}</button>
            <button className="btn btn-ghost" type="button" onClick={clearForm}>Limpiar</button>
          </div>
        </form>

        <section className="card" style={{ padding: 14 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>Mis partes</h3>
            <div className="search-row">
              <div className="field">
                <label>Buscar por fecha</label>
                <input className="input" type="date" value={fechaBusqueda} onChange={(e) => setFechaBusqueda(e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'end' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setFechaBusqueda('')}>Ver última</button>
              </div>
            </div>
            <p className="muted" style={{ margin: 0 }}>
              {fechaBusqueda ? `Mostrando partes del ${formatDateDisplay(fechaBusqueda)}` : 'Mostrando la última carga'}
            </p>
          </div>
          <div className="mobile-cards">
            {misPartesVisibles.map((parte) => (
              <div key={parte.id} className="mobile-card">
                <strong>{formatDateDisplay(parte.fecha)} · {parte.dia}</strong>
                <div className="muted">{parte.detalles.length} fila(s)</div>
                <div className="muted">Carga: {formatDateTimeDisplay(parte.createdAt)}</div>
              </div>
            ))}
            {!fechaBusqueda && misPartesOrdenadas.length > 1 && (
              <div className="mobile-card">
                <strong>Hay más partes cargados</strong>
                <div className="muted">Usá el buscador por fecha para ver los anteriores.</div>
              </div>
            )}
            {fechaBusqueda && misPartesVisibles.length === 0 && (
              <div className="mobile-card">
                <strong>No hay partes para esa fecha</strong>
                <div className="muted">Probá con otra fecha de búsqueda.</div>
              </div>
            )}
          </div>
        </section>

        <section className="card" style={{ padding: 14 }}>
          <h3 className="section-title">Catálogos</h3>
          {trabajadores.length === 0 || actividades.length === 0 || predios.length === 0 ? (
            <p className="muted">Necesitás conectarte al menos una vez para cargar las listas.</p>
          ) : (
            <p className="muted">Listas cargadas desde la base de datos.</p>
          )}
        </section>
      </div>

      <BottomBar>
        <button className="btn btn-ghost" onClick={logout}>Salir</button>
      </BottomBar>
    </div>
  );
}
