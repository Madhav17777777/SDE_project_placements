// Nested replies are stored flat -- every reply's `parentComment` always
// points at the top-level comment, never at another reply -- so a video with
// thousands of comments never risks an unbounded embedded array or a deep
// recursive query. See docs/03-database-design.md for the full rationale.

import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    video: { type: Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000, trim: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    likesCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ video: 1, parentComment: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
