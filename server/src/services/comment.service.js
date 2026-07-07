import Comment from '../models/comment.model.js';
import Video from '../models/video.model.js';
import Like from '../models/like.model.js';
import ApiError from '../utils/ApiError.js';
import { TARGET_TYPES } from '../utils/constants.js';
import { parsePagination, buildPageMeta } from '../utils/paginate.js';

const REPLY_PREVIEW_COUNT = 3;

export const addComment = async (userId, videoId, content) => {
  const video = await Video.findById(videoId);
  if (!video) throw ApiError.notFound('Video not found');

  const comment = await Comment.create({ video: videoId, author: userId, content });
  await Video.updateOne({ _id: videoId }, { $inc: { commentsCount: 1 } });

  return comment.populate('author', 'username avatar');
};

export const replyToComment = async (userId, commentId, content) => {
  const parent = await Comment.findById(commentId);
  if (!parent) throw ApiError.notFound('Comment not found');

  // Flatten to one level: replying to a reply attaches to *its* top-level parent.
  const topLevelParentId = parent.parentComment || parent._id;

  const reply = await Comment.create({
    video: parent.video,
    author: userId,
    content,
    parentComment: topLevelParentId,
  });
  await Video.updateOne({ _id: parent.video }, { $inc: { commentsCount: 1 } });

  return reply.populate('author', 'username avatar');
};

export const getCommentsForVideo = async (videoId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { video: videoId, parentComment: null };

  const [comments, totalCount] = await Promise.all([
    Comment.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar'),
    Comment.countDocuments(filter),
  ]);

  // Attach a first page of replies to each top-level comment so the client
  // can render "View N more replies" without a second round trip for the
  // common case of a handful of replies.
  const withReplies = await Promise.all(
    comments.map(async (comment) => {
      const [replies, replyCount] = await Promise.all([
        Comment.find({ parentComment: comment._id })
          .sort({ createdAt: 1 })
          .limit(REPLY_PREVIEW_COUNT)
          .populate('author', 'username avatar'),
        Comment.countDocuments({ parentComment: comment._id }),
      ]);
      return { ...comment.toObject(), replies, replyCount };
    })
  );

  return { comments: withReplies, meta: buildPageMeta(page, limit, totalCount) };
};

export const getReplies = async (commentId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { parentComment: commentId };

  const [replies, totalCount] = await Promise.all([
    Comment.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).populate('author', 'username avatar'),
    Comment.countDocuments(filter),
  ]);

  return { replies, meta: buildPageMeta(page, limit, totalCount) };
};

export const editComment = async (userId, commentId, content) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (comment.author.toString() !== userId.toString()) throw ApiError.forbidden('You do not own this comment');

  comment.content = content;
  comment.isEdited = true;
  await comment.save();
  return comment;
};

export const deleteComment = async (user, commentId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw ApiError.notFound('Comment not found');

  const video = await Video.findById(comment.video);
  const isAuthor = comment.author.toString() === user._id.toString();
  const isVideoOwner = video && video.owner.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isAuthor && !isVideoOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to delete this comment');
  }

  // If this is a top-level comment, cascade-delete its replies too.
  const replies = comment.parentComment ? [] : await Comment.find({ parentComment: comment._id }).select('_id');
  const allIds = [comment._id, ...replies.map((r) => r._id)];

  await Comment.deleteMany({ _id: { $in: allIds } });
  await Like.deleteMany({ targetType: TARGET_TYPES.COMMENT, target: { $in: allIds } });
  if (video) await Video.updateOne({ _id: video._id }, { $inc: { commentsCount: -allIds.length } });
};

export const pinComment = async (userId, commentId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw ApiError.notFound('Comment not found');

  const video = await Video.findById(comment.video);
  if (!video || video.owner.toString() !== userId.toString()) {
    throw ApiError.forbidden('Only the video owner can pin comments');
  }

  const nowPinned = !comment.isPinned;
  if (nowPinned) {
    // Only one pinned comment per video.
    await Comment.updateMany({ video: video._id, isPinned: true }, { isPinned: false });
  }
  comment.isPinned = nowPinned;
  await comment.save();
  return comment;
};
