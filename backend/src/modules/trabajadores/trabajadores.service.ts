import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const trabajadoresService = {
  async listActive() {
    return prisma.trabajador.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
  },

  async listAll() {
    return prisma.trabajador.findMany({ orderBy: { nombre: 'asc' } });
  },

  async create(nombre: string) {
    return prisma.trabajador.create({ data: { nombre, activo: true } });
  },

  async update(id: number, nombre: string) {
    const existing = await prisma.trabajador.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError(404, 'Trabajador no encontrado');
    }

    return prisma.trabajador.update({ where: { id }, data: { nombre } });
  },

  async deactivate(id: number) {
    return prisma.trabajador.update({ where: { id }, data: { activo: false } });
  },

  async activate(id: number) {
    return prisma.trabajador.update({ where: { id }, data: { activo: true } });
  },
};
