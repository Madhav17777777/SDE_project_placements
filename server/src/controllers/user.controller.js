import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as userService from '../services/user.service.js';

export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await userService.getPublicProfile(req.params.username);
  new ApiResponse(200, { user: user.toSafeJSON() }, 'Profile fetched').send(res);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  new ApiResponse(200, { user: user.toSafeJSON() }, 'Profile updated').send(res);
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Avatar image file is required');
  const user = await userService.updateAvatar(req.user._id, req.file.buffer);
  new ApiResponse(200, { user: user.toSafeJSON() }, 'Avatar updated').send(res);
});

export const updateBanner = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Banner image file is required');
  const user = await userService.updateBanner(req.user._id, req.file.buffer);
  new ApiResponse(200, { user: user.toSafeJSON() }, 'Banner updated').send(res);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user._id, currentPassword, newPassword);
  new ApiResponse(200, null, 'Password changed. Please log in again on other devices.').send(res);
});

export const getWatchHistory = asyncHandler(async (req, res) => {
  const result = await userService.getWatchHistory(req.user._id, req.query);
  new ApiResponse(200, result, 'Watch history fetched').send(res);
});

export const removeFromWatchHistory = asyncHandler(async (req, res) => {
  await userService.removeFromWatchHistory(req.user._id, req.params.videoId);
  new ApiResponse(200, null, 'Removed from watch history').send(res);
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const result = await userService.getBookmarks(req.user._id, req.query);
  new ApiResponse(200, result, 'Bookmarks fetched').send(res);
});

export const addBookmark = asyncHandler(async (req, res) => {
  await userService.addBookmark(req.user._id, req.params.videoId);
  new ApiResponse(200, null, 'Bookmarked').send(res);
});

export const removeBookmark = asyncHandler(async (req, res) => {
  await userService.removeBookmark(req.user._id, req.params.videoId);
  new ApiResponse(200, null, 'Bookmark removed').send(res);
});

export const getWatchLater = asyncHandler(async (req, res) => {
  const result = await userService.getWatchLater(req.user._id, req.query);
  new ApiResponse(200, result, 'Watch later list fetched').send(res);
});

export const addToWatchLater = asyncHandler(async (req, res) => {
  await userService.addToWatchLater(req.user._id, req.params.videoId);
  new ApiResponse(200, null, 'Added to watch later').send(res);
});

export const removeFromWatchLater = asyncHandler(async (req, res) => {
  await userService.removeFromWatchLater(req.user._id, req.params.videoId);
  new ApiResponse(200, null, 'Removed from watch later').send(res);
});

export const getLikedVideos = asyncHandler(async (req, res) => {
  const result = await userService.getLikedVideos(req.user._id, req.query);
  new ApiResponse(200, result, 'Liked videos fetched').send(res);
});
