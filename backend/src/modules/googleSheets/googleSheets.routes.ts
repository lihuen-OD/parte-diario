import { Router } from 'express';
import { ROLES } from '../../types/roles';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { googleSheetsController } from './googleSheets.controller';

const router = Router();

router.post('/sync', authMiddleware, requireRole(ROLES.ADMIN), googleSheetsController.sync);

export default router;
