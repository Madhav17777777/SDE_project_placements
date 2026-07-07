// SHA-256 hashing for opaque tokens we hand to users (email verification,
// password reset, refresh tokens). We only ever store the hash — never the
// raw token — so a leaked database dump can't be used to impersonate anyone.

import crypto from 'crypto';

export const hashToken = (rawToken) => crypto.createHash('sha256').update(rawToken).digest('hex');

export const generateRawToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
