// Google OAuth2 strategy. Registered with `session: false` everywhere it's
// used — StreamVerse is stateless JWT auth, so Passport is only used to
// perform the OAuth handshake, never to manage a server-side session.

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import User from '../models/user.model.js';
import { ROLES, AUTH_PROVIDERS } from '../utils/constants.js';

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('Google account has no public email'), null);

          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (!user) {
            // Derive a unique-ish username from the email local-part.
            const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
            const username = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

            user = await User.create({
              username,
              email,
              fullName: profile.displayName || baseUsername,
              avatar: profile.photos?.[0]?.value || '',
              googleId: profile.id,
              authProvider: AUTH_PROVIDERS.GOOGLE,
              isEmailVerified: true, // Google already verified this address
              role: ROLES.USER,
            });
          } else if (!user.googleId) {
            // Existing local account, same email -> link the Google identity.
            user.googleId = profile.id;
            user.isEmailVerified = true;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

export default passport;
