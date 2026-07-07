// Kept as its own collection (not embedded in Chat) since a popular live
// stream can generate thousands of messages per hour -- unbounded embedding
// would blow past MongoDB's 16MB document size limit quickly.

import mongoose from 'mongoose';

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 500, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
