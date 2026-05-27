import { Router } from 'express';
import { ROLES } from '../../types/roles';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { actividadesController } from './actividades.controller';

const router = Router();

router.get('/', authMiddleware, actividadesController.list);
router.get('/admin/all', authMiddleware, requireRole(ROLES.ADMIN), actividadesController.listAll);
router.post('/', authMiddleware, requireRole(ROLES.ADMIN), actividadesController.create);
router.put('/:id', authMiddleware, requireRole(ROLES.ADMIN), actividadesController.update);
router.patch('/:id/deactivate', authMiddleware, requireRole(ROLES.ADMIN), actividadesController.deactivate);
router.patch('/:id/activate', authMiddleware, requireRole(ROLES.ADMIN), actividadesController.activate);

export default router;
