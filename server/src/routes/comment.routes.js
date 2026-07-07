import { Router } from 'express';
import * as commentController from '../controllers/comment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { commentContentValidation } from '../validations/comment.validation.js';

const router = Router();

router.get('/video/:videoId', commentController.getForVideo);
router.get('/:commentId/replies', commentController.getReplies);

router.post('/video/:videoId', verifyJWT, commentContentValidation, validate, commentController.addComment);
router.post('/:commentId/reply', verifyJWT, commentContentValidation, validate, commentController.reply);

router.patch('/:commentId', verifyJWT, commentContentValidation, validate, commentController.editComment);
router.delete('/:commentId', verifyJWT, commentController.deleteComment);
router.post('/:commentId/pin', verifyJWT, commentController.pinComment);

export default router;
