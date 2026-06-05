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
    if (detalle.horas === null || detalle.horas === undefined || detalle.horas < 0) errors[`${prefix}.horas`] = 'Las horas deben ser 0 o mayores';
    if (detalle.total === null || detalle.total === undefined || detalle.total < 0) errors[`${prefix}.total`] = 'El total debe ser 0 o mayor';
  });

  return errors;
}

export function isParteValid(fecha: string, detalles: ParteDetalle[]) {
  return Object.keys(validateParteForm(fecha, detalles)).length === 0;
}
