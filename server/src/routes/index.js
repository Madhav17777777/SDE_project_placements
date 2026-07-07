// Mounts every feature router under /api/v1. Feature routers are added
// phase-by-phase (auth in Phase 3, users in Phase 4, etc.) -- each import is
// uncommented as that phase lands so this file doubles as a build progress
// checklist.

import { Router } from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import followRoutes from './follow.routes.js';
import notificationRoutes from './notification.routes.js';
import channelRoutes from './channel.routes.js';
import streamRoutes from './stream.routes.js';
import categoryRoutes from './category.routes.js';
import videoRoutes from './video.routes.js';
import commentRoutes from './comment.routes.js';
import likeRoutes from './like.routes.js';
import searchRoutes from './search.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/follow', followRoutes);
router.use('/notifications', notificationRoutes);
router.use('/channels', channelRoutes);
router.use('/streams', streamRoutes);
router.use('/categories', categoryRoutes);
router.use('/videos', videoRoutes);
router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StreamVerse API v1 -- see /health for status, docs/04-api-design.md for the full route list',
    data: null,
    errors: [],
  });
});

export default router;
