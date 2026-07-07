import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(verifyJWT, requireRole(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/ban', adminController.banUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/streams', adminController.listStreams);
router.delete('/streams/:id', adminController.removeStream);

export default router;
