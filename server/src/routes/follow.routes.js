import { Router } from 'express';
import * as followController from '../controllers/follow.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/me/following', verifyJWT, followController.getFollowing);
router.get('/:channelId/status', verifyJWT, followController.followStatus);
router.get('/:channelId/followers', followController.getFollowers);
router.post('/:channelId', verifyJWT, followController.follow);
router.delete('/:channelId', verifyJWT, followController.unfollow);

export default router;
