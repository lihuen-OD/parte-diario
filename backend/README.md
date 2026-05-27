# Backend de Parte Diario Personal

## Instalación
1. `npm install`
2. Configurá el archivo `.env` usando `.env.example`
3. `npx prisma migrate dev --name init`
4. `npm run prisma:seed`
5. `npm run dev`

## Endpoints principales
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/partes`
- `POST /api/partes`
- `GET /api/export/partes.xlsx`
- `POST /api/google-sheets/sync`

## Google Sheets con Apps Script
Google Sheets funciona como copia/exportación automática. La base real sigue siendo PostgreSQL.

Variables necesarias:
```env
GOOGLE_SHEETS_ENABLED=true
GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/XXXX/exec"
```

Variables viejas que ya no usa el código:
```env
GOOGLE_SHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
```

### Crear el conector
1. Crear o abrir un Google Sheet.
2. Ir a `Extensiones` -> `Apps Script`.
3. Pegar el contenido de `backend/docs/google-apps-script.js`.
4. Cambiar `SHEET_NAME` si la hoja no se llama `"Hoja 1"`.
5. Ir a `Implementar` -> `Nueva implementación`.
6. Tipo: `Aplicación web`.
7. Ejecutar como: `Yo`.
8. Quién tiene acceso: `Cualquier usuario`.
9. Copiar la URL terminada en `/exec`.
10. Pegarla en `GOOGLE_APPS_SCRIPT_URL`.
11. Reiniciar el backend.

La sincronización se ejecuta desde `POST /api/google-sheets/sync` y solo puede usarla un ADMIN.
