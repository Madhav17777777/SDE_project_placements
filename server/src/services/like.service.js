// Toggle semantics: reacting with the same type again removes the reaction;
// reacting with the opposite type (like <-> dislike) flips it and adjusts
// both counters in one pass. Comments only ever support "like" (there is no
// commentsDislikesCount field in the schema, matching the API design, which
// only exposes a "like a comment" endpoint).

import Video from '../models/video.model.js';
import Comment from '../models/comment.model.js';
import Like from '../models/like.model.js';
import ApiError from '../utils/ApiError.js';
import { TARGET_TYPES, REACTION_TYPES } from '../utils/constants.js';

const COUNT_FIELD = {
  [REACTION_TYPES.LIKE]: 'likesCount',
  [REACTION_TYPES.DISLIKE]: 'dislikesCount',
};

export const reactToVideo = async (userId, videoId, type) => {
  if (!Object.values(REACTION_TYPES).includes(type)) throw ApiError.badRequest('Invalid reaction type');

  const video = await Video.findById(videoId);
  if (!video) throw ApiError.notFound('Video not found');

  const existing = await Like.findOne({ user: userId, target: videoId, targetType: TARGET_TYPES.VIDEO });

  if (!existing) {
    await Like.create({ user: userId, target: videoId, targetType: TARGET_TYPES.VIDEO, type });
    await Video.updateOne({ _id: videoId }, { $inc: { [COUNT_FIELD[type]]: 1 } });
    return { reaction: type };
  }

  if (existing.type === type) {
    await existing.deleteOne();
    await Video.updateOne({ _id: videoId }, { $inc: { [COUNT_FIELD[type]]: -1 } });
    return { reaction: null };
  }

  // Switching like <-> dislike: decrement the old counter, increment the new one.
  const oldType = existing.type;
  existing.type = type;
  await existing.save();
  await Video.updateOne(
    { _id: videoId },
    { $inc: { [COUNT_FIELD[oldType]]: -1, [COUNT_FIELD[type]]: 1 } }
  );
  return { reaction: type };
};

export const removeVideoReaction = async (userId, videoId) => {
  const existing = await Like.findOne({ user: userId, target: videoId, targetType: TARGET_TYPES.VIDEO });
  if (!existing) return;

  await existing.deleteOne();
  await Video.updateOne({ _id: videoId }, { $inc: { [COUNT_FIELD[existing.type]]: -1 } });
};

export const reactToComment = async (userId, commentId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw ApiError.notFound('Comment not found');

  const existing = await Like.findOne({ user: userId, target: commentId, targetType: TARGET_TYPES.COMMENT });

  if (existing) {
    await existing.deleteOne();
    await Comment.updateOne({ _id: commentId }, { $inc: { likesCount: -1 } });
    return { liked: false };
  }

  await Like.create({
    user: userId,
    target: commentId,
    targetType: TARGET_TYPES.COMMENT,
    type: REACTION_TYPES.LIKE,
  });
  await Comment.updateOne({ _id: commentId }, { $inc: { likesCount: 1 } });
  return { liked: true };
};

export const removeCommentReaction = async (userId, commentId) => {
  const existing = await Like.findOne({ user: userId, target: commentId, targetType: TARGET_TYPES.COMMENT });
  if (!existing) return;

  await existing.deleteOne();
  await Comment.updateOne({ _id: commentId }, { $inc: { likesCount: -1 } });
};
