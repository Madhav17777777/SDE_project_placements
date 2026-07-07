import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { categoryValidation } from '../validations/category.validation.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.get('/', categoryController.list);
router.get('/:slug', categoryController.getBySlug);

router.post(
  '/',
  verifyJWT,
  requireRole(ROLES.ADMIN),
  uploadImage.single('thumbnail'),
  categoryValidation,
  validate,
  categoryController.create
);
router.patch('/:id', verifyJWT, requireRole(ROLES.ADMIN), uploadImage.single('thumbnail'), categoryController.update);
router.delete('/:id', verifyJWT, requireRole(ROLES.ADMIN), categoryController.remove);

export default router;
