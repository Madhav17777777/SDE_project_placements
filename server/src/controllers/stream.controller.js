import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as streamService from '../services/stream.service.js';

export const createStream = asyncHandler(async (req, res) => {
  const stream = await streamService.createStream(req.user._id, req.body);
  new ApiResponse(201, { stream }, 'Stream created').send(res);
});

export const editStream = asyncHandler(async (req, res) => {
  const stream = await streamService.editStream(req.user._id, req.params.id, req.body);
  new ApiResponse(200, { stream }, 'Stream updated').send(res);
});

export const updateThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Thumbnail image file is required');
  const stream = await streamService.updateThumbnail(req.user._id, req.params.id, req.file.buffer);
  new ApiResponse(200, { stream }, 'Thumbnail updated').send(res);
});

export const goLive = asyncHandler(async (req, res) => {
  // `io` comes from server.js's `app.set('io', io)`; undefined in the test
  // environment (which never boots sockets), and goLive() handles that fine.
  const io = req.app.get('io');
  const stream = await streamService.goLive(req.user._id, req.params.id, io);
  new ApiResponse(200, { stream }, 'You are now live').send(res);
});

export const endStream = asyncHandler(async (req, res) => {
  const stream = await streamService.endStream(req.user._id, req.params.id);
  new ApiResponse(200, { stream }, 'Stream ended').send(res);
});

export const getStreamById = asyncHandler(async (req, res) => {
  const stream = await streamService.getStreamById(req.params.id);
  new ApiResponse(200, { stream }, 'Stream fetched').send(res);
});

export const getViewerCount = asyncHandler(async (req, res) => {
  const viewerCount = await streamService.getViewerCount(req.params.id);
  new ApiResponse(200, { viewerCount }, 'Viewer count fetched').send(res);
});

export const getLiveFeed = asyncHandler(async (req, res) => {
  const result = await streamService.getLiveFeed(req.query);
  new ApiResponse(200, result, 'Live streams fetched').send(res);
});

export const getFeatured = asyncHandler(async (req, res) => {
  const streams = await streamService.getFeatured();
  new ApiResponse(200, { streams }, 'Featured streams fetched').send(res);
});

export const getScheduled = asyncHandler(async (req, res) => {
  const result = await streamService.getScheduled(req.query);
  new ApiResponse(200, result, 'Scheduled streams fetched').send(res);
});
