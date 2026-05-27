import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminActividades, fetchAdminPartes, fetchAdminPredios, fetchAdminTrabajadores } from '../api/admin.api';
import { getPendingPartes } from '../offline/db';
import type { Actividad, ParteDiario, Predio, Trabajador } from '../types';
import { getTodayDateOnly, toDateOnlyString } from '../utils/dateFormat';

type Card = { label: string; value: number | string; link?: string };

export default function AdminDashboardPage() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    Promise.all([
      fetchAdminPartes(),
      fetchAdminTrabajadores(),
      fetchAdminActividades(),
      fetchAdminPredios(),
      getPendingPartes(),
    ]).then(([partes, trabajadores, actividades, predios]: [ParteDiario[], Trabajador[], Actividad[], Predio[], unknown[]]) => {
      const hoy = getTodayDateOnly();
      setCards([
        { label: 'Total partes', value: partes.length, link: '/admin/partes' },
        { label: 'Partes hoy', value: partes.filter((parte) => toDateOnlyString(parte.fecha) === hoy).length, link: '/admin/partes' },
        { label: 'Trabajadores activos', value: trabajadores.filter((item) => item.activo).length, link: '/admin/trabajadores' },
        { label: 'Actividades activas', value: actividades.filter((item) => item.activo).length, link: '/admin/actividades' },
        { label: 'Predios activos', value: predios.filter((item) => item.activo).length, link: '/admin/predios' },
        { label: 'Pendientes Google Sheets', value: partes.filter((parte) => !parte.syncedToGoogleSheet).length, link: '/admin/partes' },
      ]);
    });
  }, []);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="responsive-grid">
        {cards.map((card) => (
          <Link key={card.label} to={card.link ?? '#'} className="card" style={{ padding: 16, display: 'grid', gap: 6 }}>
            <span className="muted">{card.label}</span>
            <strong style={{ fontSize: 26 }}>{card.value}</strong>
          </Link>
        ))}
      </div>
      <div className="card" style={{ padding: 16 }}>
        <h3 className="section-title">Acciones rápidas</h3>
        <div className="form-actions">
          <Link className="btn btn-secondary" to="/admin/partes">Partes</Link>
          <Link className="btn btn-secondary" to="/admin/trabajadores">Trabajadores</Link>
          <Link className="btn btn-secondary" to="/admin/actividades">Actividades</Link>
          <Link className="btn btn-secondary" to="/admin/predios">Predios</Link>
          <Link className="btn btn-secondary" to="/admin/usuarios">Usuarios</Link>
        </div>
      </div>
    </div>
  );
}
