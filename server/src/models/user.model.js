// See docs/03-database-design.md for the full field-level design rationale.

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ROLES, AUTH_PROVIDERS } from '../utils/constants.js';
import { hashToken, generateRawToken } from '../utils/hashToken.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      // Not required: Google-authenticated users have no local password.
      select: false,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    avatar: { type: String, default: '' },
    avatarPublicId: { type: String, select: false },
    banner: { type: String, default: '' },
    bannerPublicId: { type: String, select: false },
    bio: { type: String, maxlength: 300, default: '' },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    googleId: { type: String, index: true, sparse: true },
    authProvider: {
      type: String,
      enum: Object.values(AUTH_PROVIDERS),
      default: AUTH_PROVIDERS.LOCAL,
    },

    channel: { type: Schema.Types.ObjectId, ref: 'Channel', default: null },

    watchHistory: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    watchLater: [{ type: Schema.Types.ObjectId, ref: 'Video' }],

    // Bumped on password change / "log out everywhere" to invalidate every
    // refresh token issued before the bump, without needing to enumerate them.
    refreshTokenVersion: { type: Number, default: 0 },

    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ username: 'text', fullName: 'text' });

// --- Hooks ---
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// --- Instance methods ---
userSchema.methods.isPasswordCorrect = async function isPasswordCorrect(candidatePassword) {
  if (!this.password) return false; // Google-only account, no local password set
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createEmailVerificationToken = function createEmailVerificationToken() {
  const rawToken = generateRawToken();
  this.emailVerificationToken = hashToken(rawToken);
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  return rawToken;
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const rawToken = generateRawToken();
  this.passwordResetToken = hashToken(rawToken);
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return rawToken;
};

// Public-safe projection used whenever a user object is returned to a client.
userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    fullName: this.fullName,
    avatar: this.avatar,
    banner: this.banner,
    bio: this.bio,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    channel: this.channel,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
