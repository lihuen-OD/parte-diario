import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import trabajadoresRoutes from './modules/trabajadores/trabajadores.routes';
import actividadesRoutes from './modules/actividades/actividades.routes';
import prediosRoutes from './modules/predios/predios.routes';
import partesRoutes from './modules/partes/partes.routes';
import exportRoutes from './modules/export/export.routes';
import googleSheetsRoutes from './modules/googleSheets/googleSheets.routes';
import { errorMiddleware } from './middlewares/error.middleware';

export const app = express();

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/$/, '');
}

const configuredOrigins = [env.FRONTEND_URL, ...env.FRONTEND_URLS.split(',')].filter(Boolean);

const allowedOrigins = new Set([
  ...configuredOrigins.map(normalizeOrigin),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
      callback(null, true);
      return;
    }

    callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/trabajadores', trabajadoresRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/predios', prediosRoutes);
app.use('/api/partes', partesRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/google-sheets', googleSheetsRoutes);

app.use(errorMiddleware);
