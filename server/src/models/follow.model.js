import mongoose from 'mongoose';

const { Schema } = mongoose;

const followSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  },
  { timestamps: true }
);

// Prevents duplicate follows and doubles as the toggle/lookup key.
followSchema.index({ follower: 1, channel: 1 }, { unique: true });
followSchema.index({ channel: 1 });
followSchema.index({ follower: 1 });

const Follow = mongoose.model('Follow', followSchema);

export default Follow;
