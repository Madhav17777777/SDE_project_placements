import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as channelService from '../services/channel.service.js';

export const createChannel = asyncHandler(async (req, res) => {
  const channel = await channelService.createChannel(req.user._id, req.body);
  new ApiResponse(201, { channel }, 'Channel created — you are now a streamer').send(res);
});

export const editChannel = asyncHandler(async (req, res) => {
  const channel = await channelService.editChannel(req.user._id, req.body);
  new ApiResponse(200, { channel }, 'Channel updated').send(res);
});

export const getChannelBySlug = asyncHandler(async (req, res) => {
  const channel = await channelService.getChannelBySlug(req.params.slug);
  new ApiResponse(200, { channel }, 'Channel fetched').send(res);
});

export const getChannelStreams = asyncHandler(async (req, res) => {
  const result = await channelService.getChannelStreams(req.params.slug, req.query);
  new ApiResponse(200, result, 'Channel streams fetched').send(res);
});

export const getChannelVideos = asyncHandler(async (req, res) => {
  const result = await channelService.getChannelVideos(req.params.slug, req.query);
  new ApiResponse(200, result, 'Channel videos fetched').send(res);
});
