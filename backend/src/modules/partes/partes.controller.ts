import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';
import { getZodErrorMessage } from '../../utils/zod';
import { createParteSchema, parteIdParamSchema, partesQuerySchema, updateParteSchema } from './partes.schemas';
import { partesService } from './partes.service';

export const partesController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createParteSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(400, getZodErrorMessage(parsed.error));
    }

    const parte = await partesService.create(req.user!.userId, parsed.data);
    res.status(201).json({ parte });
  }),

  mine: asyncHandler(async (req: Request, res: Response) => {
    const partes = await partesService.listMine(req.user!.userId);
    res.json({ partes });
  }),

  listAll: asyncHandler(async (req: Request, res: Response) => {
    const parsed = partesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(400, getZodErrorMessage(parsed.error));
    }

    if (parsed.data.limit) {
      const result = await partesService.listRows(parsed.data);
      res.json(result);
      return;
    }

    const partes = await partesService.listAll(parsed.data);
    res.json({ partes });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const params = parteIdParamSchema.safeParse(req.params);

    if (!params.success) {
      throw new AppError(400, getZodErrorMessage(params.error));
    }

    const parte = await partesService.getVisibleById(req.user!.userId, req.user!.rol, params.data.id);

    res.json({ parte });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const params = parteIdParamSchema.safeParse(req.params);
    const body = updateParteSchema.safeParse(req.body);

    if (!params.success) {
      throw new AppError(400, getZodErrorMessage(params.error));
    }

    if (!body.success) {
      throw new AppError(400, getZodErrorMessage(body.error));
    }

    const parte = await partesService.update(req.user!.userId, req.user!.rol, params.data.id, body.data);
    res.json({ parte });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const params = parteIdParamSchema.safeParse(req.params);

    if (!params.success) {
      throw new AppError(400, getZodErrorMessage(params.error));
    }

    const result = await partesService.remove(params.data.id);
    res.json(result);
  }),
};
