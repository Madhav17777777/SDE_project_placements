import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    relatedEntity: {
      entityType: { type: String, enum: ['Stream', 'Video', 'Comment', 'Channel'], default: null },
      entityId: { type: Schema.Types.ObjectId, default: null },
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
