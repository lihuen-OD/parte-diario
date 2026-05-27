import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';
import { getZodErrorMessage } from '../../utils/zod';
import { createUserSchema, updateUserSchema, userIdParamSchema } from './users.schemas';
import { usersService } from './users.service';

export const usersController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const users = await usersService.list();
    res.json({ users });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(400, getZodErrorMessage(parsed.error));
    }

    const user = await usersService.create(parsed.data);
    res.status(201).json({ user });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const params = userIdParamSchema.safeParse(req.params);
    const body = updateUserSchema.safeParse(req.body);

    if (!params.success) {
      throw new AppError(400, getZodErrorMessage(params.error));
    }

    if (!body.success) {
      throw new AppError(400, getZodErrorMessage(body.error));
    }

    const user = await usersService.update(params.data.id, body.data);
    res.json({ user });
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const params = userIdParamSchema.safeParse(req.params);

    if (!params.success) {
      throw new AppError(400, getZodErrorMessage(params.error));
    }

    const user = await usersService.deactivate(params.data.id);
    res.json({ user });
  }),

  activate: asyncHandler(async (req: Request, res: Response) => {
    const params = userIdParamSchema.safeParse(req.params);

    if (!params.success) {
      throw new AppError(400, getZodErrorMessage(params.error));
    }

    const user = await usersService.activate(params.data.id);
    res.json({ user });
  }),
};
