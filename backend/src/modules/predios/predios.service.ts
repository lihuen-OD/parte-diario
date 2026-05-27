import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const prediosService = {
  async listActive() {
    return prisma.predio.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
  },

  async listAll() {
    return prisma.predio.findMany({ orderBy: { nombre: 'asc' } });
  },

  async create(nombre: string) {
    return prisma.predio.create({ data: { nombre, activo: true } });
  },

  async update(id: number, nombre: string) {
    const existing = await prisma.predio.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError(404, 'Predio no encontrado');
    }

    return prisma.predio.update({ where: { id }, data: { nombre } });
  },

  async deactivate(id: number) {
    return prisma.predio.update({ where: { id }, data: { activo: false } });
  },

  async activate(id: number) {
    return prisma.predio.update({ where: { id }, data: { activo: true } });
  },
};
