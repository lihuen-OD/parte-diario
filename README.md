# Parte Diario Personal

Aplicación full stack para carga y administración de partes diarios.

## Arquitectura

- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT
- Frontend: React, TypeScript, Vite, React Router, Axios
- Offline: IndexedDB nativo en el frontend
- Exportación: Excel desde el backend
- Google Sheets: copia automática mediante Google Apps Script

## Estructura

- `backend/`
- `frontend/`

## Variables de entorno

### Backend `.env`

Usar las mismas claves que en `.env.example`:

```env
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="cambiar_esto"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
GOOGLE_SHEETS_ENABLED=false
GOOGLE_APPS_SCRIPT_URL=""
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:4000/api
```

## Correr en local

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Backend disponible en:

- http://localhost:4000
- API base: http://localhost:4000/api

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en:

- http://localhost:5173
- Login: http://localhost:5173/login

## Credenciales de prueba

### ADMIN

- Email: admin@partediario.com
- Password: admin123

### WORKER

- Email: worker@partediario.com
- Password: worker123

## Endpoints principales

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Catálogos

- `GET /api/trabajadores`
- `GET /api/actividades`
- `GET /api/predios`

### Admin catálogos

- `GET /api/trabajadores/admin/all`
- `GET /api/actividades/admin/all`
- `GET /api/predios/admin/all`
- `GET /api/users`

### Partes

- `POST /api/partes`
- `GET /api/partes/mis`
- `GET /api/partes`
- `GET /api/partes/:id`
- `PUT /api/partes/:id`
- `DELETE /api/partes/:id`

### Exportación

- `GET /api/export/partes.xlsx`

### Google Sheets

- `POST /api/google-sheets/sync`

La integración usa Google Apps Script, no Google Cloud ni Service Account. La base real es PostgreSQL y Sheets recibe solo una copia de los partes pendientes.

Para configurarlo:
1. Crear un Google Sheet.
2. Ir a `Extensiones` -> `Apps Script`.
3. Pegar el código de `backend/docs/google-apps-script.js`.
4. Cambiar `SHEET_NAME` si la hoja no se llama `"Hoja 1"`.
5. Ir a `Implementar` -> `Nueva implementación`.
6. Tipo: `Aplicación web`.
7. Ejecutar como: `Yo`.
8. Quién tiene acceso: `Cualquier usuario`.
9. Copiar la URL `/exec`.
10. Configurar:

```env
GOOGLE_SHEETS_ENABLED=true
GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/XXXX/exec"
```

Las variables `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL` y `GOOGLE_PRIVATE_KEY` ya no se usan.

## Lógica funcional

- ADMIN administra todo.
- WORKER carga partes diarios.
- Los trabajadores no tienen login; son solo catálogo.
- Un parte puede tener varias filas.
- Cada detalle incluye trabajador, actividad, predio, horas, total y observaciones.
- El backend genera el día automáticamente a partir de la fecha.
- `localId` evita duplicados cuando el frontend guarda partes offline.

## Pruebas manuales

1. Correr backend.
2. Correr frontend.
3. Iniciar sesión como ADMIN.
4. Iniciar sesión como WORKER.
5. Crear un parte como WORKER con 2 filas.
6. Ver el parte en Mis partes.
7. Iniciar sesión como ADMIN.
8. Ver el parte en Admin Partes.
9. Exportar Excel.
10. Crear un trabajador nuevo.
11. Crear una actividad nueva.
12. Crear un predio nuevo.
13. Desactivar y reactivar registros.
14. Verificar que WORKER no entre a `/admin`.
15. Verificar que ADMIN no entre a `/parte-diario`.
16. Probar offline: apagar backend o cortar conexión, cargar parte, verificar pendiente, volver a conectar, sincronizar y confirmar que no se duplica por `localId`.

## Verificación rápida

- `backend npm run build`
- `frontend npm run build`
