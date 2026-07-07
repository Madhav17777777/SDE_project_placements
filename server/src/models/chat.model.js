// One chat room per stream. "Subscriber-only" from the original DB design
// is reinterpreted as "followers-only" here — this project has no paid
// subscription tier, but the Follow system already gives us a natural
// membership concept to gate chat with.

import mongoose from 'mongoose';

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    stream: { type: Schema.Types.ObjectId, ref: 'Stream', required: true, unique: true },
    isSlowMode: { type: Boolean, default: false },
    slowModeDelaySec: { type: Number, default: 0 },
    isFollowerOnly: { type: Boolean, default: false },
    bannedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
