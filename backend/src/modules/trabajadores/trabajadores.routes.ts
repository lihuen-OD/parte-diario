import { Router } from 'express';
import { ROLES } from '../../types/roles';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { trabajadoresController } from './trabajadores.controller';

const router = Router();

router.get('/', authMiddleware, trabajadoresController.list);
router.get('/admin/all', authMiddleware, requireRole(ROLES.ADMIN), trabajadoresController.listAll);
router.post('/', authMiddleware, requireRole(ROLES.ADMIN), trabajadoresController.create);
router.put('/:id', authMiddleware, requireRole(ROLES.ADMIN), trabajadoresController.update);
router.patch('/:id/deactivate', authMiddleware, requireRole(ROLES.ADMIN), trabajadoresController.deactivate);
router.patch('/:id/activate', authMiddleware, requireRole(ROLES.ADMIN), trabajadoresController.activate);

export default router;
