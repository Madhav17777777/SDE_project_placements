import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as videoService from '../services/video.service.js';

export const uploadVideo = asyncHandler(async (req, res) => {
  const video = await videoService.uploadVideo(req.user._id, req.body, req.file);
  new ApiResponse(201, { video }, 'Video uploaded').send(res);
});

export const updateThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Thumbnail image file is required');
  const video = await videoService.updateThumbnail(req.user._id, req.params.id, req.file.buffer);
  new ApiResponse(200, { video }, 'Thumbnail updated').send(res);
});

export const editVideo = asyncHandler(async (req, res) => {
  const video = await videoService.editVideo(req.user._id, req.params.id, req.body);
  new ApiResponse(200, { video }, 'Video updated').send(res);
});

export const deleteVideo = asyncHandler(async (req, res) => {
  await videoService.deleteVideo(req.user._id, req.params.id);
  new ApiResponse(200, null, 'Video deleted').send(res);
});

export const getVideoById = asyncHandler(async (req, res) => {
  const video = await videoService.getVideoById(req.params.id);
  new ApiResponse(200, { video }, 'Video fetched').send(res);
});

export const listVideos = asyncHandler(async (req, res) => {
  const result = await videoService.listVideos(req.query);
  new ApiResponse(200, result, 'Videos fetched').send(res);
});

export const getTrending = asyncHandler(async (req, res) => {
  const result = await videoService.getTrendingVideos(req.query);
  new ApiResponse(200, result, 'Trending videos fetched').send(res);
});

export const shareVideo = asyncHandler(async (req, res) => {
  const result = await videoService.shareVideo(req.params.id);
  new ApiResponse(200, result, 'Share link generated').send(res);
});
