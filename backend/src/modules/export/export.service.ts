import ExcelJS from 'exceljs';
import { prisma } from '../../config/prisma';
import { toDateOnlyString } from '../../utils/dateOnly';

function decimalToNumber(value: unknown) {
  return Number(value);
}

function formatDateDisplay(dateValue: Date) {
  const [year, month, day] = toDateOnlyString(dateValue).split('-').map(Number);

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function formatDateTimeDisplay(dateValue: Date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateValue);
}

export const exportService = {
  async buildPartesWorkbook() {
    const partes = await prisma.parteDiario.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        creadoPor: {
          select: { nombre: true },
        },
        detalles: {
          include: {
            trabajador: true,
            actividad: true,
            predio: true,
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Partes');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Día', key: 'dia', width: 14 },
      { header: 'Trabajador', key: 'trabajador', width: 28 },
      { header: 'Actividad', key: 'actividad', width: 30 },
      { header: 'Predio', key: 'predio', width: 28 },
      { header: 'Horas', key: 'horas', width: 12 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Observaciones', key: 'observaciones', width: 35 },
      { header: 'Cargado por', key: 'cargadoPor', width: 24 },
      { header: 'Estado Sync', key: 'estadoSync', width: 16 },
      { header: 'Sincronizado Google Sheets', key: 'syncedToGoogleSheet', width: 22 },
      { header: 'Fecha de carga', key: 'fechaCarga', width: 22 },
    ];

    for (const parte of partes) {
      for (const detalle of parte.detalles) {
        worksheet.addRow({
          fecha: formatDateDisplay(parte.fecha),
          dia: parte.dia,
          trabajador: detalle.trabajador.nombre,
          actividad: detalle.actividad.nombre,
          predio: detalle.predio.nombre,
          horas: decimalToNumber(detalle.horas),
          total: decimalToNumber(detalle.total),
          observaciones: detalle.observaciones ?? '',
          cargadoPor: parte.creadoPor.nombre,
          estadoSync: parte.estadoSync,
          syncedToGoogleSheet: parte.syncedToGoogleSheet ? 'Sí' : 'No',
          fechaCarga: formatDateTimeDisplay(parte.createdAt),
        });
      }
    }

    worksheet.getRow(1).font = { bold: true };

    return workbook;
  },
};
