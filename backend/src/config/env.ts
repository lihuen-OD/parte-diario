import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatorio'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET es obligatorio'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  GOOGLE_SHEETS_ENABLED: z
    .union([z.string(), z.boolean()])
    .optional()
    .default('false')
    .transform((value) => value === true || value === 'true'),
  GOOGLE_APPS_SCRIPT_URL: z.string().optional().default(''),
});

export const env = envSchema.parse(process.env);
