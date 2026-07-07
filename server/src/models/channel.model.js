// Full schema per docs/03-database-design.md. The model is introduced here
// (Phase 4) because Follow/Notification already need something to reference,
// but channel CREATE/EDIT controllers and Stream/Category integration land
// in Phase 5 — this file will not change when that phase lands.

import mongoose from 'mongoose';

const { Schema } = mongoose;

const channelSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    channelName: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, maxlength: 1000, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    tags: [{ type: String, trim: true, lowercase: true }],
    followersCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    isLive: { type: Boolean, default: false },
    currentStream: { type: Schema.Types.ObjectId, ref: 'Stream', default: null },
    socials: {
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      discord: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

channelSchema.index({ channelName: 'text', description: 'text' });

const Channel = mongoose.model('Channel', channelSchema);

export default Channel;
