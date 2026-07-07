// Thin controllers: parse the request, delegate to auth.service, shape the
// response. No business logic lives here.

import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { COOKIE_OPTIONS } from '../utils/constants.js';
import { env } from '../config/env.js';
import * as authService from '../services/auth.service.js';

const REFRESH_COOKIE_NAME = 'refreshToken';

const refreshCookieOptions = () => ({
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // matches default REFRESH_TOKEN_EXPIRY of 7d
  path: '/api/v1/auth', // scoped to auth routes only (refresh/logout)
});

export const signup = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;
  const user = await authService.registerUser({ username, email, password, fullName });

  new ApiResponse(
    201,
    { user: user.toSafeJSON() },
    'Account created. Check your email to verify your address.'
  ).send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(
    { identifier, password },
    req.headers['user-agent']
  );

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  new ApiResponse(200, { user: user.toSafeJSON(), accessToken }, 'Login successful').send(res);
});

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  await authService.logoutUser(rawRefreshToken);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const { user, accessToken, refreshToken } = await authService.refreshTokens(
    rawRefreshToken,
    req.headers['user-agent']
  );

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  new ApiResponse(200, { user: user.toSafeJSON(), accessToken }, 'Token refreshed').send(res);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  // Same response whether or not the email exists — prevents user enumeration.
  new ApiResponse(200, null, 'If that email exists, a reset link has been sent').send(res);
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  new ApiResponse(200, null, 'Password reset successfully. Please log in again.').send(res);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.params.token);
  new ApiResponse(200, { user: user.toSafeJSON() }, 'Email verified successfully').send(res);
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerificationEmail(req.user._id);
  new ApiResponse(200, null, 'Verification email sent').send(res);
});

export const getMe = asyncHandler(async (req, res) => {
  new ApiResponse(200, { user: req.user.toSafeJSON() }, 'Current user fetched').send(res);
});

// --- Google OAuth ---
// GET /auth/google is handled entirely by passport.authenticate('google', ...)
// in the route definition. This controller only handles the callback, once
// Passport has already populated req.user with the User document.
export const googleCallback = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Google authentication failed');

  const { accessToken, refreshToken } = await authService.issueTokensForUser(
    req.user,
    req.headers['user-agent']
  );

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  // Redirect back to the SPA with the short-lived access token in the URL;
  // the frontend reads it once, stores it in memory (Zustand), then strips
  // it from the address bar. The refresh token never leaves the httpOnly cookie.
  res.redirect(`${env.CLIENT_URL}/oauth-callback?accessToken=${accessToken}`);
});
