import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import type { Rol } from '../types/roles';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

type JwtPayload = {
  userId: number;
  rol: Rol;
};

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'No tenés permisos para realizar esta acción'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.usuario.findUnique({
      where: { id: payload.userId },
      select: { id: true, rol: true, activo: true },
    });

    if (!user) {
      return next(new AppError(401, 'No tenés permisos para realizar esta acción'));
    }

    if (!user.activo) {
      return next(new AppError(403, 'El usuario está inactivo'));
    }

    req.user = { userId: user.id, rol: user.rol };
    return next();
  } catch {
    return next(new AppError(401, 'No tenés permisos para realizar esta acción'));
  }
}
