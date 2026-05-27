import type { Rol } from '../../types/roles';
import { ESTADO_SYNC } from '../../types/roles';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { getDayFromDate } from '../../utils/day';
import { dateOnlyToUtcDate, toDateOnlyString } from '../../utils/dateOnly';

const parteInclude = {
  creadoPor: {
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  detalles: {
    include: {
      trabajador: true,
      actividad: true,
      predio: true,
    },
  },
} as const;

function toNumber(value: unknown) {
  return Number(value);
}

function serializeParte(parte: any) {
  return {
    id: parte.id,
    localId: parte.localId,
    fecha: toDateOnlyString(parte.fecha),
    dia: parte.dia,
    creadoPorId: parte.creadoPorId,
    estadoSync: parte.estadoSync,
    syncedToGoogleSheet: parte.syncedToGoogleSheet,
    googleSheetRowId: parte.googleSheetRowId,
    createdAt: parte.createdAt,
    updatedAt: parte.updatedAt,
    creadoPor: parte.creadoPor,
    detalles: parte.detalles.map((detalle: any) => ({
      id: detalle.id,
      parteDiarioId: detalle.parteDiarioId,
      trabajadorId: detalle.trabajadorId,
      actividadId: detalle.actividadId,
      predioId: detalle.predioId,
      horas: toNumber(detalle.horas),
      total: toNumber(detalle.total),
      observaciones: detalle.observaciones,
      createdAt: detalle.createdAt,
      updatedAt: detalle.updatedAt,
      trabajador: detalle.trabajador,
      actividad: detalle.actividad,
      predio: detalle.predio,
    })),
  };
}

async function validateDetalleCatalogs(detalles: Array<{ trabajadorId: number; actividadId: number; predioId: number }>) {
  for (const detalle of detalles) {
    const [trabajador, actividad, predio] = await Promise.all([
      prisma.trabajador.findFirst({ where: { id: detalle.trabajadorId, activo: true } }),
      prisma.actividad.findFirst({ where: { id: detalle.actividadId, activo: true } }),
      prisma.predio.findFirst({ where: { id: detalle.predioId, activo: true } }),
    ]);

    if (!trabajador) {
      throw new AppError(400, 'El trabajador seleccionado no existe o está inactivo');
    }

    if (!actividad) {
      throw new AppError(400, 'La actividad seleccionada no existe o está inactiva');
    }

    if (!predio) {
      throw new AppError(400, 'El predio seleccionado no existe o está inactivo');
    }
  }
}

function getDateRange(fechaDesde?: string, fechaHasta?: string) {
  const range: { gte?: Date; lte?: Date } = {};

  if (fechaDesde) {
    range.gte = dateOnlyToUtcDate(fechaDesde);
  }

  if (fechaHasta) {
    range.lte = dateOnlyToUtcDate(fechaHasta, true);
  }

  return range;
}

export const partesService = {
  async create(userId: number, payload: { localId?: string; fecha: string; detalles: Array<{ trabajadorId: number; actividadId: number; predioId: number; horas: number; total: number; observaciones?: string }> }) {
    const existingByLocalId = payload.localId
      ? await prisma.parteDiario.findUnique({ where: { localId: payload.localId }, include: parteInclude })
      : null;

    if (existingByLocalId) {
      return serializeParte(existingByLocalId);
    }

    await validateDetalleCatalogs(payload.detalles);

    const fecha = dateOnlyToUtcDate(payload.fecha);
    const dia = getDayFromDate(payload.fecha);

    const parte = await prisma.parteDiario.create({
      data: {
        localId: payload.localId,
        fecha,
        dia,
        creadoPorId: userId,
        estadoSync: ESTADO_SYNC.PENDIENTE,
        detalles: {
          create: payload.detalles.map((detalle) => ({
            trabajadorId: detalle.trabajadorId,
            actividadId: detalle.actividadId,
            predioId: detalle.predioId,
            horas: detalle.horas,
            total: detalle.total,
            observaciones: detalle.observaciones || null,
          })),
        },
      },
      include: parteInclude,
    });

    return serializeParte(parte);
  },

  async listMine(userId: number) {
    const partes = await prisma.parteDiario.findMany({
      where: { creadoPorId: userId },
      orderBy: { fecha: 'desc' },
      include: parteInclude,
    });

    return partes.map(serializeParte);
  },

  async listAll(filters: { fechaDesde?: string; fechaHasta?: string; trabajadorId?: number; actividadId?: number; predioId?: number; creadoPorId?: number }) {
    const partes = await prisma.parteDiario.findMany({
      where: {
        fecha: getDateRange(filters.fechaDesde, filters.fechaHasta),
        ...(filters.creadoPorId ? { creadoPorId: filters.creadoPorId } : {}),
        ...(filters.trabajadorId || filters.actividadId || filters.predioId
          ? {
              detalles: {
                some: {
                  ...(filters.trabajadorId ? { trabajadorId: filters.trabajadorId } : {}),
                  ...(filters.actividadId ? { actividadId: filters.actividadId } : {}),
                  ...(filters.predioId ? { predioId: filters.predioId } : {}),
                },
              },
            }
          : {}),
      },
      orderBy: { fecha: 'desc' },
      include: parteInclude,
    });

    return partes.map(serializeParte);
  },

  async getById(id: number) {
    const parte = await prisma.parteDiario.findUnique({ where: { id }, include: parteInclude });

    if (!parte) {
      throw new AppError(404, 'Parte no encontrado');
    }

    return serializeParte(parte);
  },

  async getVisibleById(userId: number, rol: Rol, id: number) {
    const parte = await prisma.parteDiario.findUnique({ where: { id }, include: parteInclude });

    if (!parte) {
      throw new AppError(404, 'Parte no encontrado');
    }

    if (rol !== 'ADMIN' && parte.creadoPorId !== userId) {
      throw new AppError(403, 'No tenés permisos para realizar esta acción');
    }

    return serializeParte(parte);
  },

  async canUserSeePart(userId: number, rol: Rol, parteId: number) {
    if (rol === 'ADMIN') {
      return true;
    }

    const parte = await prisma.parteDiario.findFirst({ where: { id: parteId, creadoPorId: userId } });
    return Boolean(parte);
  },

  async update(userId: number, rol: Rol, id: number, payload: { localId?: string; fecha: string; detalles: Array<{ trabajadorId: number; actividadId: number; predioId: number; horas: number; total: number; observaciones?: string }> }) {
    const existing = await prisma.parteDiario.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError(404, 'Parte no encontrado');
    }

    if (rol !== 'ADMIN') {
      if (existing.creadoPorId !== userId) {
        throw new AppError(403, 'No tenés permisos para realizar esta acción');
      }

      if (existing.syncedToGoogleSheet) {
        throw new AppError(400, 'El parte ya fue sincronizado a Google Sheets');
      }
    }

    if (payload.localId) {
      const other = await prisma.parteDiario.findFirst({
        where: {
          localId: payload.localId,
          NOT: { id },
        },
      });

      if (other) {
        throw new AppError(400, 'Ya existe un parte con ese localId');
      }
    }

    await validateDetalleCatalogs(payload.detalles);

    const parte = await prisma.parteDiario.update({
      where: { id },
      data: {
        localId: payload.localId ?? existing.localId,
        fecha: dateOnlyToUtcDate(payload.fecha),
        dia: getDayFromDate(payload.fecha),
        detalles: {
          deleteMany: {},
          create: payload.detalles.map((detalle) => ({
            trabajadorId: detalle.trabajadorId,
            actividadId: detalle.actividadId,
            predioId: detalle.predioId,
            horas: detalle.horas,
            total: detalle.total,
            observaciones: detalle.observaciones || null,
          })),
        },
      },
      include: parteInclude,
    });

    return serializeParte(parte);
  },

  async remove(id: number) {
    await prisma.parteDiario.delete({ where: { id } });
    return { message: 'Parte eliminado correctamente' };
  },
};
