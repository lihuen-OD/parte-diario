import type { Actividad, ParteDetalle, Predio, Trabajador } from '../types';
import { FieldError } from './FieldError';

type Props = {
  index: number;
  value: ParteDetalle;
  trabajador: Trabajador;
  touched: boolean;
  errors: Record<string, string>;
  actividades: Actividad[];
  predios: Predio[];
  onChange: (index: number, next: ParteDetalle) => void;
};

export function ParteRow({ index, value, trabajador, touched, errors, actividades, predios, onChange }: Props) {
  const set = (patch: Partial<ParteDetalle>) => onChange(index, { ...value, ...patch });

  return (
    <div className="mobile-card" style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gap: 10 }}>
        <div className="field">
          <label>Trabajador</label>
          <input className="input" value={trabajador.nombre} readOnly />
          {touched && <FieldError message={errors[`detalles.${index}.trabajadorId`]} />}
        </div>
        <div className="field">
          <label>Actividad</label>
          <select className="select" value={value.actividadId || ''} onChange={(e) => set({ actividadId: Number(e.target.value) || 0 })}>
            <option value="">Seleccionar</option>
            {actividades.map((actividad) => <option key={actividad.id} value={actividad.id}>{actividad.nombre}</option>)}
          </select>
          {touched && <FieldError message={errors[`detalles.${index}.actividadId`]} />}
        </div>
        <div className="field">
          <label>Predio</label>
          <select className="select" value={value.predioId || ''} onChange={(e) => set({ predioId: Number(e.target.value) || 0 })}>
            <option value="">Seleccionar</option>
            {predios.map((predio) => <option key={predio.id} value={predio.id}>{predio.nombre}</option>)}
          </select>
          {touched && <FieldError message={errors[`detalles.${index}.predioId`]} />}
        </div>
        <div className="two-col">
          <div className="field">
            <label>Horas</label>
            <input className="input" type="number" min="0" step="0.5" value={value.horas ?? ''} onChange={(e) => set({ horas: Number(e.target.value) })} />
            {touched && <FieldError message={errors[`detalles.${index}.horas`]} />}
          </div>
          <div className="field">
            <label>Total</label>
            <input className="input" type="number" min="0" step="0.5" value={value.total ?? ''} onChange={(e) => set({ total: Number(e.target.value) })} />
            {touched && <FieldError message={errors[`detalles.${index}.total`]} />}
          </div>
        </div>
        <div className="field">
          <label>Observaciones</label>
          <input className="input" type="text" value={value.observaciones ?? ''} onChange={(e) => set({ observaciones: e.target.value })} placeholder="Opcional" />
        </div>
      </div>
    </div>
  );
}
