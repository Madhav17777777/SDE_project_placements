import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as adminService from '../services/admin.service.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  new ApiResponse(200, stats, 'Dashboard stats fetched').send(res);
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.query);
  new ApiResponse(200, result, 'Users fetched').send(res);
});

export const banUser = asyncHandler(async (req, res) => {
  const user = await adminService.setUserBanStatus(req.params.id, req.body.isBanned !== false);
  new ApiResponse(200, { user: user.toSafeJSON() }, user.isBanned ? 'User banned' : 'User unbanned').send(res);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  new ApiResponse(200, null, 'User deleted').send(res);
});

export const listStreams = asyncHandler(async (req, res) => {
  const result = await adminService.listStreamsForAdmin(req.query);
  new ApiResponse(200, result, 'Streams fetched').send(res);
});

export const removeStream = asyncHandler(async (req, res) => {
  await adminService.forceRemoveStream(req.params.id);
  new ApiResponse(200, null, 'Stream removed').send(res);
});
