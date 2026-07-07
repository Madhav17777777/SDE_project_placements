import mongoose from 'mongoose';
import { STREAM_STATUS } from '../utils/constants.js';

const { Schema } = mongoose;

const streamSchema = new Schema(
  {
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    title: { type: String, required: true, maxlength: 140, trim: true },
    thumbnail: { type: String, default: '' },
    thumbnailPublicId: { type: String, select: false },
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    tags: [{ type: String, trim: true, lowercase: true }],

    status: {
      type: String,
      enum: Object.values(STREAM_STATUS),
      default: STREAM_STATUS.SCHEDULED,
      index: true,
    },
    scheduledFor: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },

    // Mocked ingest — this project doesn't run a real RTMP/HLS pipeline.
    // streamKey is a bearer secret an OBS-style client would use to push
    // video; playbackUrl is what the player component points at.
    streamKey: { type: String, select: false },
    playbackUrl: { type: String, default: '' },

    viewerCount: { type: Number, default: 0 },
    peakViewerCount: { type: Number, default: 0 },
    totalChatMessages: { type: Number, default: 0 },
  },
  { timestamps: true }
);

streamSchema.index({ status: 1, startedAt: -1 });
streamSchema.index({ category: 1, status: 1 });
streamSchema.index({ title: 'text', tags: 'text' });

const Stream = mongoose.model('Stream', streamSchema);

export default Stream;
