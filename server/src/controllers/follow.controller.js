import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as followService from '../services/follow.service.js';

export const follow = asyncHandler(async (req, res) => {
  await followService.followChannel(req.user._id, req.params.channelId);
  new ApiResponse(200, null, 'Followed channel').send(res);
});

export const unfollow = asyncHandler(async (req, res) => {
  await followService.unfollowChannel(req.user._id, req.params.channelId);
  new ApiResponse(200, null, 'Unfollowed channel').send(res);
});

export const followStatus = asyncHandler(async (req, res) => {
  const following = await followService.isFollowing(req.user._id, req.params.channelId);
  new ApiResponse(200, { following }, 'Follow status fetched').send(res);
});

export const getFollowers = asyncHandler(async (req, res) => {
  const result = await followService.getFollowers(req.params.channelId, req.query);
  new ApiResponse(200, result, 'Followers fetched').send(res);
});

export const getFollowing = asyncHandler(async (req, res) => {
  const result = await followService.getFollowing(req.user._id, req.query);
  new ApiResponse(200, result, 'Following list fetched').send(res);
});
