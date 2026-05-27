import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';
import { getZodErrorMessage } from '../../utils/zod';
import { createPredioSchema, predioIdParamSchema, updatePredioSchema } from './predios.schemas';
import { prediosService } from './predios.service';

export const prediosController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const predios = await prediosService.listActive();
    res.json({ predios });
  }),

  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const predios = await prediosService.listAll();
    res.json({ predios });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createPredioSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, getZodErrorMessage(parsed.error));
    const predio = await prediosService.create(parsed.data.nombre);
    res.status(201).json({ predio });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const params = predioIdParamSchema.safeParse(req.params);
    const body = updatePredioSchema.safeParse(req.body);

    if (!params.success) throw new AppError(400, getZodErrorMessage(params.error));
    if (!body.success) throw new AppError(400, getZodErrorMessage(body.error));

    const predio = await prediosService.update(params.data.id, body.data.nombre);
    res.json({ predio });
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const params = predioIdParamSchema.safeParse(req.params);
    if (!params.success) throw new AppError(400, getZodErrorMessage(params.error));
    const predio = await prediosService.deactivate(params.data.id);
    res.json({ predio });
  }),

  activate: asyncHandler(async (req: Request, res: Response) => {
    const params = predioIdParamSchema.safeParse(req.params);
    if (!params.success) throw new AppError(400, getZodErrorMessage(params.error));
    const predio = await prediosService.activate(params.data.id);
    res.json({ predio });
  }),
};
