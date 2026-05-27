import { Request, Response, NextFunction } from 'express';
import type { Rol } from '../types/roles';
import { AppError } from '../utils/AppError';

export function requireRole(...roles: Rol[]) {
  return function roleMiddleware(req: Request, _res: Response, next: NextFunction) {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(new AppError(403, 'No tenés permisos para realizar esta acción'));
    }

    return next();
  };
}
