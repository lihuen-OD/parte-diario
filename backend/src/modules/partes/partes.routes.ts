import { Router } from 'express';
import { ROLES } from '../../types/roles';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { partesController } from './partes.controller';

const router = Router();

router.post('/', authMiddleware, requireRole(ROLES.ADMIN, ROLES.WORKER), partesController.create);
router.get('/mis', authMiddleware, requireRole(ROLES.ADMIN, ROLES.WORKER), partesController.mine);
router.get('/', authMiddleware, requireRole(ROLES.ADMIN), partesController.listAll);
router.get('/:id', authMiddleware, requireRole(ROLES.ADMIN, ROLES.WORKER), partesController.getById);
router.put('/:id', authMiddleware, requireRole(ROLES.ADMIN, ROLES.WORKER), partesController.update);
router.delete('/:id', authMiddleware, requireRole(ROLES.ADMIN), partesController.remove);

export default router;
