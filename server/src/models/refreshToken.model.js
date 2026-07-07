// Separate collection (rather than an array on User) so a user can hold
// multiple valid sessions (phone + laptop) and revoke exactly one without
// logging out every device. TTL index means MongoDB garbage-collects expired
// rows for us — no cron job needed.

import mongoose from 'mongoose';

const { Schema } = mongoose;

const refreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  userAgent: { type: String, default: '' },
  revokedAt: { type: Date, default: null },
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
