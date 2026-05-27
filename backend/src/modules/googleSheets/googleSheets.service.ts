import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { ESTADO_SYNC } from '../../types/roles';
import { toDateOnlyString } from '../../utils/dateOnly';

type AppsScriptResponse = {
  ok?: boolean;
  inserted?: number;
  message?: string;
  error?: string;
};

function buildRegistros(partes: Array<any>) {
  return partes.flatMap((parte) =>
    parte.detalles.map((detalle: any) => ({
      parteId: parte.id,
      detalleId: detalle.id,
      localId: parte.localId ?? '',
      fecha: toDateOnlyString(parte.fecha),
      dia: parte.dia,
      trabajador: detalle.trabajador.nombre,
      actividad: detalle.actividad.nombre,
      predio: detalle.predio.nombre,
      horas: Number(detalle.horas),
      total: Number(detalle.total),
      observaciones: detalle.observaciones ?? '',
      cargadoPor: parte.creadoPor.nombre,
      fechaCarga: parte.createdAt.toISOString(),
    })),
  );
}

function parseAppsScriptResponse(rawText: string): AppsScriptResponse {
  try {
    return JSON.parse(rawText) as AppsScriptResponse;
  } catch {
    throw new Error(getAppsScriptErrorMessage(rawText));
  }
}

function getAppsScriptErrorMessage(rawText: string) {
  if (!rawText) {
    return 'Apps Script no devolvió una respuesta JSON válida';
  }

  const plainText = rawText
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plainText.includes('No se pudo abrir el archivo') || plainText.includes('No se encontró la página')) {
    return 'La URL de Google Apps Script no es accesible. Revisá que sea la URL de implementación Web App terminada en /exec y que el acceso sea "Cualquier usuario".';
  }

  return plainText || 'Apps Script no devolvió una respuesta JSON válida';
}

async function markPartesAsError(ids: number[]) {
  if (ids.length === 0) return;

  await prisma.parteDiario.updateMany({
    where: { id: { in: ids } },
    data: {
      estadoSync: ESTADO_SYNC.ERROR,
      syncedToGoogleSheet: false,
    },
  });
}

export const googleSheetsService = {
  async sync() {
    if (!env.GOOGLE_SHEETS_ENABLED) {
      return {
        status: 200,
        body: {
          ok: false,
          message: 'Google Sheets no configurado',
        },
      };
    }

    if (!env.GOOGLE_APPS_SCRIPT_URL) {
      return {
        status: 400,
        body: {
          ok: false,
          message: 'Falta configurar GOOGLE_APPS_SCRIPT_URL',
        },
      };
    }

    const partesPendientes = await prisma.parteDiario.findMany({
      where: {
        syncedToGoogleSheet: false,
        estadoSync: { in: [ESTADO_SYNC.PENDIENTE, ESTADO_SYNC.ERROR] },
      },
      orderBy: [{ fecha: 'asc' }, { createdAt: 'asc' }],
      include: {
        creadoPor: {
          select: { nombre: true },
        },
        detalles: {
          orderBy: { id: 'asc' },
          include: {
            trabajador: { select: { nombre: true } },
            actividad: { select: { nombre: true } },
            predio: { select: { nombre: true } },
          },
        },
      },
    });

    const registros = buildRegistros(partesPendientes);

    if (registros.length === 0) {
      return {
        status: 200,
        body: {
          ok: true,
          message: 'No hay registros pendientes para sincronizar',
          inserted: 0,
        },
      };
    }

    const parteIds = partesPendientes.map((parte) => parte.id);

    try {
      const response = await fetch(env.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ registros }),
      });

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(rawText ? getAppsScriptErrorMessage(rawText) : `Apps Script respondió con estado ${response.status}`);
      }

      const appsScriptResult = parseAppsScriptResponse(rawText);

      if (!appsScriptResult.ok) {
        throw new Error(appsScriptResult.error || appsScriptResult.message || 'Apps Script rechazó la sincronización');
      }

      await prisma.parteDiario.updateMany({
        where: { id: { in: parteIds } },
        data: {
          estadoSync: ESTADO_SYNC.SINCRONIZADO,
          syncedToGoogleSheet: true,
        },
      });

      return {
        status: 200,
        body: {
          ok: true,
          message: 'Sincronización completada',
          inserted: appsScriptResult.inserted ?? registros.length,
          partesSincronizados: partesPendientes.length,
        },
      };
    } catch (error) {
      await markPartesAsError(parteIds);

      return {
        status: 502,
        body: {
          ok: false,
          message: 'No se pudo sincronizar con Google Sheets',
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
};
