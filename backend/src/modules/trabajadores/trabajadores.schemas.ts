import { z } from 'zod';

export const trabajadorIdParamSchema = z.object({
  id: z.coerce.number().int().positive('El ID es obligatorio'),
});

export const createTrabajadorSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
});

export const updateTrabajadorSchema = createTrabajadorSchema;
