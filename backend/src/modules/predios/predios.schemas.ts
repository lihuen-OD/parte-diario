import { z } from 'zod';

export const predioIdParamSchema = z.object({
  id: z.coerce.number().int().positive('El ID es obligatorio'),
});

export const createPredioSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
});

export const updatePredioSchema = createPredioSchema;
