import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const actividadesService = {
  async listActive() {
    return prisma.actividad.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
  },

  async listAll() {
    return prisma.actividad.findMany({ orderBy: { nombre: 'asc' } });
  },

  async create(nombre: string) {
    return prisma.actividad.create({ data: { nombre, activo: true } });
  },

  async update(id: number, nombre: string) {
    const existing = await prisma.actividad.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError(404, 'Actividad no encontrada');
    }

    return prisma.actividad.update({ where: { id }, data: { nombre } });
  },

  async deactivate(id: number) {
    return prisma.actividad.update({ where: { id }, data: { activo: false } });
  },

  async activate(id: number) {
    return prisma.actividad.update({ where: { id }, data: { activo: true } });
  },
};
