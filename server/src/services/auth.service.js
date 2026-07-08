// Business logic for authentication. Controllers stay thin — they parse the
// request, call one of these functions, and format the response. Everything
// here is unit/integration-testable without ever touching Express req/res.

import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import ApiError from '../utils/ApiError.js';
import { hashToken } from '../utils/hashToken.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/generateTokens.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service.js';
import { logger } from '../config/logger.js';

const msFromJwtExpiry = (expiry) => {
  // Supports formats like '15m', '7d', '1h'. Falls back to 7 days.
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]];
  return value * unit;
};

/**
 * Issues a fresh access+refresh token pair for a user, persists a hashed
 * record of the refresh token, and returns both raw tokens to the caller.
 */
const issueTokenPair = async (user, userAgent = '') => {
  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({
    id: user._id.toString(),
    tokenVersion: user.refreshTokenVersion,
  });

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + msFromJwtExpiry(process.env.REFRESH_TOKEN_EXPIRY || '7d')),
    userAgent,
  });

  return { accessToken, refreshToken };
};

export const registerUser = async ({ username, email, password, fullName }) => {
  const existing = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
  if (existing) {
    throw ApiError.conflict(
      existing.email === email.toLowerCase() ? 'Email already in use' : 'Username already taken'
    );
  }

  const user = new User({ username, email, password, fullName });
  const rawVerificationToken = user.createEmailVerificationToken();
  await user.save();

  // Deliberately NOT awaited: the account already exists in the database at
  // this point, so the HTTP response should return right away regardless of
  // how slow (or stuck) the SMTP connection is. Previously this was
  // `await`ed, which meant a slow/hanging Gmail connection left the signup
  // request stuck "pending" in the browser forever, even though the account
  // had already been created — very confusing, since the user would then
  // see no response at all despite the signup having actually succeeded.
  // Errors are still caught and logged so they're visible in Render logs.
  sendVerificationEmail(user, rawVerificationToken).catch((error) => {
    logger.warn(`Failed to send verification email to ${user.email}: ${error.message}`);
  });

  return user;
};

export const loginUser = async ({ identifier, password }, userAgent) => {
  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
  }).select('+password');

  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (user.isBanned) throw ApiError.forbidden('This account has been banned');

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

  const tokens = await issueTokenPair(user, userAgent);
  return { user, ...tokens };
};

/**
 * Verifies the refresh token cookie, checks it against the stored hash (and
 * the user's current refreshTokenVersion), revokes it, and issues a brand
 * new pair. Rotation on every use means a stolen-but-unused refresh token
 * becomes worthless the moment the legitimate owner refreshes again.
 */
export const refreshTokens = async (rawRefreshToken, userAgent) => {
  if (!rawRefreshToken) throw ApiError.unauthorized('Refresh token missing');

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw ApiError.unauthorized('Refresh token invalid or expired');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token invalid or expired');
  }

  const user = await User.findById(payload.id);
  if (!user || user.isBanned) throw ApiError.unauthorized('Refresh token invalid or expired');
  if (payload.tokenVersion !== user.refreshTokenVersion) {
    throw ApiError.unauthorized('Session has been invalidated, please log in again');
  }

  stored.revokedAt = new Date();
  await stored.save();

  const tokens = await issueTokenPair(user, userAgent);
  return { user, ...tokens };
};

export const logoutUser = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await RefreshToken.updateOne({ tokenHash }, { revokedAt: new Date() });
};

export const verifyEmail = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) throw ApiError.badRequest('Verification link is invalid or has expired');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user;
};

export const resendVerificationEmail = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.isEmailVerified) throw ApiError.badRequest('Email is already verified');

  const rawToken = user.createEmailVerificationToken();
  await user.save();

  // This one IS awaited (unlike registerUser) since the user explicitly
  // asked "send me a new email" and the UI should tell them if it failed --
  // it's now bounded by email.service.js's connection/socket timeouts, so a
  // stuck SMTP connection fails within ~10-15s instead of hanging forever.
  try {
    await sendVerificationEmail(user, rawToken);
  } catch (error) {
    logger.warn(`Failed to resend verification email to ${user.email}: ${error.message}`);
    throw ApiError.internal('Could not send verification email right now — please try again shortly');
  }
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  // Always resolve without leaking whether the email exists in the system.
  if (!user) return;

  const rawToken = user.createPasswordResetToken();
  await user.save();

  // Not awaited, same reasoning as registerUser -- the controller always
  // returns the same generic response regardless, so there's no reason to
  // block the response on SMTP speed here either.
  sendPasswordResetEmail(user, rawToken).catch((error) => {
    logger.warn(`Failed to send password reset email to ${user.email}: ${error.message}`);
  });
};

export const resetPassword = async (rawToken, newPassword) => {
  const tokenHash = hashToken(rawToken);
  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenVersion += 1; // invalidate every existing session
  await user.save();

  return user;
};

export const issueTokensForUser = issueTokenPair;
