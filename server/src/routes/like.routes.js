import { Router } from 'express';
import * as likeController from '../controllers/like.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/video/:videoId', likeController.reactToVideo);
router.delete('/video/:videoId', likeController.removeVideoReaction);

router.post('/comment/:commentId', likeController.reactToComment);
router.delete('/comment/:commentId', likeController.removeCommentReaction);

export default router;
