import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as likeService from '../services/like.service.js';
import { REACTION_TYPES } from '../utils/constants.js';

export const reactToVideo = asyncHandler(async (req, res) => {
  const { type } = req.body;
  if (!Object.values(REACTION_TYPES).includes(type)) throw ApiError.badRequest('type must be like or dislike');

  const result = await likeService.reactToVideo(req.user._id, req.params.videoId, type);
  new ApiResponse(200, result, 'Reaction updated').send(res);
});

export const removeVideoReaction = asyncHandler(async (req, res) => {
  await likeService.removeVideoReaction(req.user._id, req.params.videoId);
  new ApiResponse(200, null, 'Reaction removed').send(res);
});

export const reactToComment = asyncHandler(async (req, res) => {
  const result = await likeService.reactToComment(req.user._id, req.params.commentId);
  new ApiResponse(200, result, 'Reaction updated').send(res);
});

export const removeCommentReaction = asyncHandler(async (req, res) => {
  await likeService.removeCommentReaction(req.user._id, req.params.commentId);
  new ApiResponse(200, null, 'Reaction removed').send(res);
});
