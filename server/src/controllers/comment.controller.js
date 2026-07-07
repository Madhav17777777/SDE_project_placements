import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as commentService from '../services/comment.service.js';

export const getForVideo = asyncHandler(async (req, res) => {
  const result = await commentService.getCommentsForVideo(req.params.videoId, req.query);
  new ApiResponse(200, result, 'Comments fetched').send(res);
});

export const getReplies = asyncHandler(async (req, res) => {
  const result = await commentService.getReplies(req.params.commentId, req.query);
  new ApiResponse(200, result, 'Replies fetched').send(res);
});

export const addComment = asyncHandler(async (req, res) => {
  const comment = await commentService.addComment(req.user._id, req.params.videoId, req.body.content);
  new ApiResponse(201, { comment }, 'Comment added').send(res);
});

export const reply = asyncHandler(async (req, res) => {
  const comment = await commentService.replyToComment(req.user._id, req.params.commentId, req.body.content);
  new ApiResponse(201, { comment }, 'Reply added').send(res);
});

export const editComment = asyncHandler(async (req, res) => {
  const comment = await commentService.editComment(req.user._id, req.params.commentId, req.body.content);
  new ApiResponse(200, { comment }, 'Comment updated').send(res);
});

export const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment(req.user, req.params.commentId);
  new ApiResponse(200, null, 'Comment deleted').send(res);
});

export const pinComment = asyncHandler(async (req, res) => {
  const comment = await commentService.pinComment(req.user._id, req.params.commentId);
  new ApiResponse(200, { comment }, comment.isPinned ? 'Comment pinned' : 'Comment unpinned').send(res);
});
