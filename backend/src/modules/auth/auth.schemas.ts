import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'El email es obligatorio').email('El email es inválido'),
  password: z.string().trim().min(1, 'La contraseña es obligatoria'),
});
