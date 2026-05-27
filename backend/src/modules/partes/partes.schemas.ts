import { z } from 'zod';

const decimalPositive = (message: string) =>
  z.coerce.number().refine((value) => value > 0, { message });

export const parteIdParamSchema = z.object({
  id: z.coerce.number().int().positive('El ID es obligatorio'),
});

export const detalleSchema = z.object({
  trabajadorId: z.coerce.number().int().positive('El trabajador es obligatorio'),
  actividadId: z.coerce.number().int().positive('La actividad es obligatoria'),
  predioId: z.coerce.number().int().positive('El predio es obligatorio'),
  horas: decimalPositive('Las horas deben ser mayores a 0'),
  total: decimalPositive('El total debe ser mayor a 0'),
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
});
