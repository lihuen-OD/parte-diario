import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';
import { getZodErrorMessage } from '../../utils/zod';
import { createTrabajadorSchema, trabajadorIdParamSchema, updateTrabajadorSchema } from './trabajadores.schemas';
import { trabajadoresService } from './trabajadores.service';

export const trabajadoresController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const trabajadores = await trabajadoresService.listActive();
    res.json({ trabajadores });
  }),

  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const trabajadores = await trabajadoresService.listAll();
    res.json({ trabajadores });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createTrabajadorSchema.safeParse(req.body);

    if (!parsed.success) throw new AppError(400, getZodErrorMessage(parsed.error));

    const trabajador = await trabajadoresService.create(parsed.data.nombre);
    res.status(201).json({ trabajador });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const params = trabajadorIdParamSchema.safeParse(req.params);
    const body = updateTrabajadorSchema.safeParse(req.body);

    if (!params.success) throw new AppError(400, getZodErrorMessage(params.error));
    if (!body.success) throw new AppError(400, getZodErrorMessage(body.error));

    const trabajador = await trabajadoresService.update(params.data.id, body.data.nombre);
    res.json({ trabajador });
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const params = trabajadorIdParamSchema.safeParse(req.params);
    if (!params.success) throw new AppError(400, getZodErrorMessage(params.error));
    const trabajador = await trabajadoresService.deactivate(params.data.id);
    res.json({ trabajador });
  }),

  activate: asyncHandler(async (req: Request, res: Response) => {
    const params = trabajadorIdParamSchema.safeParse(req.params);
    if (!params.success) throw new AppError(400, getZodErrorMessage(params.error));
    const trabajador = await trabajadoresService.activate(params.data.id);
    res.json({ trabajador });
  }),
};
