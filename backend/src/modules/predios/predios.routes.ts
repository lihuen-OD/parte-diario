import { Router } from 'express';
import { ROLES } from '../../types/roles';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { prediosController } from './predios.controller';

const router = Router();

router.get('/', authMiddleware, prediosController.list);
router.get('/admin/all', authMiddleware, requireRole(ROLES.ADMIN), prediosController.listAll);
router.post('/', authMiddleware, requireRole(ROLES.ADMIN), prediosController.create);
router.put('/:id', authMiddleware, requireRole(ROLES.ADMIN), prediosController.update);
router.patch('/:id/deactivate', authMiddleware, requireRole(ROLES.ADMIN), prediosController.deactivate);
router.patch('/:id/activate', authMiddleware, requireRole(ROLES.ADMIN), prediosController.activate);

export default router;
