import { Router } from 'express';
import passport from '../config/passport.js';
import * as authController from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validations/auth.validation.js';

const router = Router();

router.post('/signup', authLimiter, signupValidation, validate, authController.signup);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/logout', verifyJWT, authController.logout);
router.post('/refresh-token', authController.refreshAccessToken);

router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);
router.post(
  '/reset-password/:token',
  authLimiter,
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', verifyJWT, authController.resendVerification);

router.get('/me', verifyJWT, authController.getMe);

// Google OAuth — no session, no CSRF state persistence needed since the
// flow is stateless JWT-based on the way back in.
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback
);

export default router;
