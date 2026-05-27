import { ZodError } from 'zod';

export function getZodErrorMessage(error: ZodError) {
  return error.issues[0]?.message ?? 'Datos inválidos';
}
