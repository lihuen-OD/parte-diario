import { Router } from 'express';
import { ROLES } from '../../types/roles';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { exportController } from './export.controller';

const router = Router();

router.get('/partes.xlsx', authMiddleware, requireRole(ROLES.ADMIN), exportController.partesXlsx);

export default router;
