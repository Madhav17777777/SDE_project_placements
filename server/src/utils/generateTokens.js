// JWT signing helpers, used by auth.service.js in Phase 3. Placed here now
// (Phase 2) since it's pure config-driven utility code with no dependency on
// the User model yet — the model lands in Phase 3.

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRY });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRY });

export const verifyAccessToken = (token) => jwt.verify(token, env.ACCESS_TOKEN_SECRET);

export const verifyRefreshToken = (token) => jwt.verify(token, env.REFRESH_TOKEN_SECRET);
