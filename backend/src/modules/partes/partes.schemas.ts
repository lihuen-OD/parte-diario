import { z } from 'zod';

const decimalNonNegative = (message: string) =>
  z.coerce.number().refine((value) => value >= 0, { message });

const decimalPositive = (message: string) =>
  z.coerce.number().refine((value) => value > 0, { message });

export const parteIdParamSchema = z.object({
  id: z.coerce.number().int().positive('El ID es obligatorio'),
});

export const detalleSchema = z.object({
  trabajadorId: z.coerce.number().int().positive('El trabajador es obligatorio'),
  actividadId: z.coerce.number().int().positive('La actividad es obligatoria'),
  predioId: z.coerce.number().int().positive('El predio es obligatorio'),
  horas: decimalNonNegative('Las horas deben ser 0 o mayores'),
  total: decimalNonNegative('El total debe ser 0 o mayor'),
  observaciones: z.string().optional().default(''),
});

export const createParteSchema = z.object({
  localId: z.string().trim().min(1).optional(),
  fecha: z.string().trim().min(1, 'La fecha es obligatoria'),
  detalles: z.array(detalleSchema).min(1, 'Debe cargar al menos una fila'),
});

export const updateParteSchema = z.object({
  localId: z.string().trim().min(1).optional(),
  fecha: z.string().trim().min(1, 'La fecha es obligatoria'),
  detalles: z.array(detalleSchema).min(1, 'Debe cargar al menos una fila'),
});

export const partesQuerySchema = z.object({
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  trabajadorId: z.coerce.number().int().positive().optional(),
  actividadId: z.coerce.number().int().positive().optional(),
  predioId: z.coerce.number().int().positive().optional(),
  creadoPorId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
