import mongoose from 'mongoose';
import { VIDEO_VISIBILITY } from '../utils/constants.js';

const { Schema } = mongoose;

const videoSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    title: { type: String, required: true, maxlength: 140, trim: true },
    description: { type: String, maxlength: 5000, default: '' },

    videoUrl: { type: String, required: true },
    videoPublicId: { type: String, select: false },
    thumbnail: { type: String, default: '' },
    thumbnailPublicId: { type: String, select: false },
    duration: { type: Number, default: 0 },

    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    tags: [{ type: String, trim: true, lowercase: true }],

    views: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    visibility: {
      type: String,
      enum: Object.values(VIDEO_VISIBILITY),
      default: VIDEO_VISIBILITY.PUBLIC,
    },

    isVodOfStream: { type: Schema.Types.ObjectId, ref: 'Stream', default: null },
  },
  { timestamps: true }
);

videoSchema.index({ channel: 1, createdAt: -1 });
videoSchema.index({ category: 1 });
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Video = mongoose.model('Video', videoSchema);

export default Video;
