import type { ParteDetalle } from '../types';

export function validateParteForm(fecha: string, detalles: ParteDetalle[]) {
  const errors: Record<string, string> = {};

  if (!fecha) errors.fecha = 'La fecha es obligatoria';
  if (!detalles.length) errors.detalles = 'Debe cargar al menos una fila';

  detalles.forEach((detalle, index) => {
    const prefix = `detalles.${index}`;
    if (!detalle.trabajadorId) errors[`${prefix}.trabajadorId`] = 'El trabajador es obligatorio';
    if (!detalle.actividadId) errors[`${prefix}.actividadId`] = 'La actividad es obligatoria';
    if (!detalle.predioId) errors[`${prefix}.predioId`] = 'El predio es obligatorio';
    if (!detalle.horas || detalle.horas <= 0) errors[`${prefix}.horas`] = 'Las horas deben ser mayores a 0';
    if (!detalle.total || detalle.total <= 0) errors[`${prefix}.total`] = 'El total debe ser mayor a 0';
  });

  return errors;
}

export function isParteValid(fecha: string, detalles: ParteDetalle[]) {
  return Object.keys(validateParteForm(fecha, detalles)).length === 0;
}
