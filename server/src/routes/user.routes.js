import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { updateProfileValidation, changePasswordValidation } from '../validations/user.validation.js';

const router = Router();

// Public
router.get('/:username', userController.getPublicProfile);

// Authenticated — self-service
router.patch('/me', verifyJWT, updateProfileValidation, validate, userController.updateProfile);
router.patch('/me/avatar', verifyJWT, uploadImage.single('avatar'), userController.updateAvatar);
router.patch('/me/banner', verifyJWT, uploadImage.single('banner'), userController.updateBanner);
router.patch('/me/password', verifyJWT, changePasswordValidation, validate, userController.changePassword);

router.get('/me/watch-history', verifyJWT, userController.getWatchHistory);
router.delete('/me/watch-history/:videoId', verifyJWT, userController.removeFromWatchHistory);

router.get('/me/bookmarks', verifyJWT, userController.getBookmarks);
router.post('/me/bookmarks/:videoId', verifyJWT, userController.addBookmark);
router.delete('/me/bookmarks/:videoId', verifyJWT, userController.removeBookmark);

router.get('/me/watch-later', verifyJWT, userController.getWatchLater);
router.post('/me/watch-later/:videoId', verifyJWT, userController.addToWatchLater);
router.delete('/me/watch-later/:videoId', verifyJWT, userController.removeFromWatchLater);

router.get('/me/liked-videos', verifyJWT, userController.getLikedVideos);

export default router;
