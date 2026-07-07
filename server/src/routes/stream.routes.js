import { Router } from 'express';
import * as streamController from '../controllers/stream.controller.js';
import * as chatController from '../controllers/chat.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { createStreamValidation, editStreamValidation } from '../validations/stream.validation.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

const requireStreamer = requireRole(ROLES.STREAMER, ROLES.ADMIN);

// Public feeds — order matters: static paths before the `/:id` catch-all.
router.get('/live', streamController.getLiveFeed);
router.get('/featured', streamController.getFeatured);
router.get('/scheduled', streamController.getScheduled);
router.get('/:id', streamController.getStreamById);
router.get('/:id/viewers', streamController.getViewerCount);

// Streamer-managed
router.post('/', verifyJWT, requireStreamer, createStreamValidation, validate, streamController.createStream);
router.patch('/:id', verifyJWT, requireStreamer, editStreamValidation, validate, streamController.editStream);
router.patch(
  '/:id/thumbnail',
  verifyJWT,
  requireStreamer,
  uploadImage.single('thumbnail'),
  streamController.updateThumbnail
);
router.post('/:id/go-live', verifyJWT, requireStreamer, streamController.goLive);
router.post('/:id/end', verifyJWT, requireStreamer, streamController.endStream);

// Chat moderation (Phase 7) -- the chat itself is Socket.io-only, but slow
// mode / bans are the kind of setting a streamer wants a normal form for.
router.patch('/:id/chat/slow-mode', verifyJWT, requireStreamer, chatController.setSlowMode);
router.post('/:id/chat/ban/:userId', verifyJWT, requireStreamer, chatController.banUser);

export default router;
