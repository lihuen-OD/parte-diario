import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { googleSheetsService } from './googleSheets.service';
import { ROLES } from '../../types/roles';

export const googleSheetsController = {
  sync: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || req.user.rol !== ROLES.ADMIN) {
      res.status(403).json({
        ok: false,
        message: 'No tenés permisos para realizar esta acción',
      });
      return;
    }

    const result = await googleSheetsService.sync();
    res.status(result.status).json(result.body);
  }),
};
