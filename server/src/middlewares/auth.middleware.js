// Verifies the short-lived access token (sent as `Authorization: Bearer
// <token>`) and attaches the corresponding user to `req.user`. This is the
// gate every "User"/"Streamer"/"Admin" route in docs/04-api-design.md sits
// behind.

import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/generateTokens.js';
import User from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) throw ApiError.unauthorized('Access token missing');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Access token invalid or expired');
  }

  const user = await User.findById(payload.id);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.isBanned) throw ApiError.forbidden('This account has been banned');

  req.user = user;
  next();
});

// Attaches req.user if a valid token is present, but never rejects the
// request otherwise. Useful for routes that are public but personalize
// their response for logged-in users (e.g. "is this channel followed?").
export const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.id);
    if (user && !user.isBanned) req.user = user;
  } catch {
    // Invalid/expired token on an optional-auth route just means "anonymous".
  }
  next();
});
