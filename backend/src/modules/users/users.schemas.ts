import { ROLES } from '../../types/roles';
import { z } from 'zod';

const rolSchema = z.nativeEnum(ROLES);

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive('El ID es obligatorio'),
});

export const createUserSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z.string().trim().min(1, 'El email es obligatorio').email('El email es inválido'),
  password: z.string().trim().min(1, 'La contraseña es obligatoria').min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: rolSchema,
});

export const updateUserSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z.string().trim().min(1, 'El email es obligatorio').email('El email es inválido'),
  password: z.string().trim().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  rol: rolSchema,
});
