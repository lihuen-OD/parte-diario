import { Router } from 'express';
import { ROLES } from '../../types/roles';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { usersController } from './users.controller';

const router = Router();

router.use(authMiddleware, requireRole(ROLES.ADMIN));

router.get('/', usersController.list);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.patch('/:id/deactivate', usersController.deactivate);
router.patch('/:id/activate', usersController.activate);

export default router;
