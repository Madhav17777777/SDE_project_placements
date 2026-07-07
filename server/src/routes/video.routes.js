import { Router } from 'express';
import * as videoController from '../controllers/video.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadImage, uploadVideo } from '../middlewares/upload.middleware.js';
import { uploadVideoValidation, editVideoValidation } from '../validations/video.validation.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// Any authenticated user can upload -- see stream.routes.js for the same
// reasoning (no separate "become a streamer" role upgrade in this project).
const requireStreamer = requireRole(ROLES.USER, ROLES.STREAMER, ROLES.ADMIN);

// Static paths before the `/:id` catch-all.
router.get('/', videoController.listVideos);
router.get('/trending', videoController.getTrending);
router.get('/:id', videoController.getVideoById);
router.post('/:id/share', videoController.shareVideo);

router.post(
  '/',
  verifyJWT,
  requireStreamer,
  uploadVideo.single('video'),
  uploadVideoValidation,
  validate,
  videoController.uploadVideo
);
router.patch('/:id', verifyJWT, requireStreamer, editVideoValidation, validate, videoController.editVideo);
router.patch(
  '/:id/thumbnail',
  verifyJWT,
  requireStreamer,
  uploadImage.single('thumbnail'),
  videoController.updateThumbnail
);
router.delete('/:id', verifyJWT, requireStreamer, videoController.deleteVideo);

export default router;
