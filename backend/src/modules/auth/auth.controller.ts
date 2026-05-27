import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { loginSchema } from './auth.schemas';
import { getZodErrorMessage } from '../../utils/zod';
import { AppError } from '../../utils/AppError';
import { authService } from './auth.service';

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(400, getZodErrorMessage(parsed.error));
    }

    const result = await authService.login(parsed.data.email, parsed.data.password);
    res.json(result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.userId);
    res.json({ user });
  }),
};
