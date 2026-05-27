import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';
import { getZodErrorMessage } from '../../utils/zod';
import { actividadIdParamSchema, createActividadSchema, updateActividadSchema } from './actividades.schemas';
import { actividadesService } from './actividades.service';

export const actividadesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const actividades = await actividadesService.listActive();
    res.json({ actividades });
  }),

  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const actividades = await actividadesService.listAll();
    res.json({ actividades });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createActividadSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, getZodErrorMessage(parsed.error));
    const actividad = await actividadesService.create(parsed.data.nombre);
    res.status(201).json({ actividad });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const params = actividadIdParamSchema.safeParse(req.params);
    const body = updateActividadSchema.safeParse(req.body);

    if (!params.success) throw new AppError(400, getZodErrorMessage(params.error));
    if (!body.success) throw new AppError(400, getZodErrorMessage(body.error));

    const actividad = await actividadesService.update(params.data.id, body.data.nombre);
    res.json({ actividad });
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const params = actividadIdParamSchema.safeParse(req.params);
    if (!params.success) throw new AppError(400, getZodErrorMessage(params.error));
    const actividad = await actividadesService.deactivate(params.data.id);
    res.json({ actividad });
  }),

  activate: asyncHandler(async (req: Request, res: Response) => {
    const params = actividadIdParamSchema.safeParse(req.params);
    if (!params.success) throw new AppError(400, getZodErrorMessage(params.error));
    const actividad = await actividadesService.activate(params.data.id);
    res.json({ actividad });
  }),
};
