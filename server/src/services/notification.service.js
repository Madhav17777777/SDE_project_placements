// Pure-DB notification service. Deliberately does not know about Socket.io —
// Phase 7 wires a thin layer on top (`io.to('user:' + recipient).emit(...)`)
// right after `createNotification` resolves, inside the controller/service
// that triggers it (follow, comment, like), so this module stays testable
// without a running socket server.

import Notification from '../models/notification.model.js';
import ApiError from '../utils/ApiError.js';
import { parsePagination, buildPageMeta } from '../utils/paginate.js';

export const createNotification = ({ recipient, sender = null, type, message, link = '', relatedEntity = null }) =>
  Notification.create({ recipient, sender, type, message, link, relatedEntity });

export const listNotifications = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { recipient: userId };

  const [notifications, totalCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar'),
    Notification.countDocuments(filter),
  ]);

  return { notifications, meta: buildPageMeta(page, limit, totalCount) };
};

export const getUnreadCount = (userId) => Notification.countDocuments({ recipient: userId, isRead: false });

export const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  return notification;
};

export const markAllAsRead = (userId) =>
  Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

export const deleteNotification = async (userId, notificationId) => {
  const result = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  if (!result) throw ApiError.notFound('Notification not found');
};
