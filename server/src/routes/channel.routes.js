import { Router } from 'express';
import * as channelController from '../controllers/channel.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createChannelValidation, editChannelValidation } from '../validations/channel.validation.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.post('/', verifyJWT, createChannelValidation, validate, channelController.createChannel);
router.patch(
  '/me',
  verifyJWT,
  // Any authenticated user can manage a channel -- there's no separate
  // "become a streamer" upgrade step in this project, so USER is allowed
  // alongside STREAMER/ADMIN rather than gating this behind a role change.
  requireRole(ROLES.USER, ROLES.STREAMER, ROLES.ADMIN),
  editChannelValidation,
  validate,
  channelController.editChannel
);

router.get('/:slug', channelController.getChannelBySlug);
router.get('/:slug/streams', channelController.getChannelStreams);
router.get('/:slug/videos', channelController.getChannelVideos);

export default router;
