import bcrypt from 'bcryptjs';
import type { Rol } from '../../types/roles';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

function sanitizeUser(user: {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    activo: user.activo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const usersService = {
  async list() {
    const users = await prisma.usuario.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map(sanitizeUser);
  },

  async create(data: { nombre: string; email: string; password: string; rol: Rol }) {
    const password = await bcrypt.hash(data.password, 10);

    const user = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password,
        rol: data.rol,
      },
    });

    return sanitizeUser(user);
  },

  async update(id: number, data: { nombre: string; email: string; password?: string; rol: Rol }) {
    const existing = await prisma.usuario.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    const password = data.password ? await bcrypt.hash(data.password, 10) : existing.password;

    const user = await prisma.usuario.update({
      where: { id },
      data: {
        nombre: data.nombre,
        email: data.email,
        password,
        rol: data.rol,
      },
    });

    return sanitizeUser(user);
  },

  async deactivate(id: number) {
    const user = await prisma.usuario.update({ where: { id }, data: { activo: false } });
    return sanitizeUser(user);
  },

  async activate(id: number) {
    const user = await prisma.usuario.update({ where: { id }, data: { activo: true } });
    return sanitizeUser(user);
  },
};
