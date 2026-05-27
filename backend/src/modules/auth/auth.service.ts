import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import type { Rol } from '../../types/roles';

function sanitizeUser(user: {
  id: number;
  nombre: string;
  email: string;
  rol: string;
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

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, 'Usuario o contraseña incorrectos');
    }

    if (!user.activo) {
      throw new AppError(403, 'El usuario está inactivo');
    }

    const signOptions: jwt.SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    };

    const token = jwt.sign({ userId: user.id, rol: user.rol }, env.JWT_SECRET, signOptions);

    return {
      token,
      user: sanitizeUser(user),
    };
  },

  async me(userId: number) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    return user;
  },
};
