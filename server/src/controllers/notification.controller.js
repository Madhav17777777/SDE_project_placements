import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as notificationService from '../services/notification.service.js';

export const list = asyncHandler(async (req, res) => {
  const result = await notificationService.listNotifications(req.user._id, req.query);
  new ApiResponse(200, result, 'Notifications fetched').send(res);
});

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  new ApiResponse(200, { count }, 'Unread count fetched').send(res);
});

export const markRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.user._id, req.params.id);
  new ApiResponse(200, null, 'Notification marked as read').send(res);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  new ApiResponse(200, null, 'All notifications marked as read').send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.user._id, req.params.id);
  new ApiResponse(200, null, 'Notification deleted').send(res);
});
