// Business logic for the "logged-in user manages themselves" surface:
// profile edits, avatar/banner, password change, and the three saved-video
// lists (watch history, bookmarks, watch later). watchHistory / bookmarks /
// watchLater / likedVideos store Video ObjectIds on the User doc; now that
// the Video model exists (Phase 6) every list below returns fully populated
// video documents (channel + owner summary included) instead of raw ids.

import User from '../models/user.model.js';
import Like from '../models/like.model.js';
import Video from '../models/video.model.js';
import ApiError from '../utils/ApiError.js';
import { uploadBuffer, deleteAsset } from './cloudinary.service.js';
import { REACTION_TYPES, TARGET_TYPES } from '../utils/constants.js';
import { parsePagination, buildPageMeta } from '../utils/paginate.js';

const VIDEO_CARD_POPULATE = {
  path: 'channel',
  select: 'channelName slug owner',
  populate: { path: 'owner', select: 'username avatar' },
};

// Fetches a set of video ids and returns them as full documents, in the same
// order the ids were given in (Mongo's $in does not preserve input order).
const populateVideosInOrder = async (videoIds) => {
  if (videoIds.length === 0) return [];
  const videos = await Video.find({ _id: { $in: videoIds } }).populate(VIDEO_CARD_POPULATE);
  const byId = new Map(videos.map((v) => [v._id.toString(), v]));
  return videoIds.map((id) => byId.get(id.toString())).filter(Boolean);
};

export const updateProfile = async (userId, { fullName, bio }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { ...(fullName && { fullName }), ...(bio !== undefined && { bio }) } },
    { new: true, runValidators: true }
  );
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.isPasswordCorrect(currentPassword);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  user.refreshTokenVersion += 1; // force re-login on every other device
  await user.save();
  return user;
};

const replaceImage = async (userId, field, publicIdField, buffer, folder) => {
  const user = await User.findById(userId).select(`+${publicIdField}`);
  if (!user) throw ApiError.notFound('User not found');

  const result = await uploadBuffer(buffer, { folder, resourceType: 'image' });

  const oldPublicId = user[publicIdField];
  user[field] = result.secure_url;
  user[publicIdField] = result.public_id;
  await user.save();

  if (oldPublicId) await deleteAsset(oldPublicId, 'image'); // best-effort cleanup, after the new one is confirmed saved

  return user;
};

export const updateAvatar = (userId, buffer) =>
  replaceImage(userId, 'avatar', 'avatarPublicId', buffer, 'streamverse/avatars');

export const updateBanner = (userId, buffer) =>
  replaceImage(userId, 'banner', 'bannerPublicId', buffer, 'streamverse/banners');

// --- Watch history (most-recent-first, capped at 200 entries) ---
export const addToWatchHistory = async (userId, videoId) => {
  await User.updateOne({ _id: userId }, { $pull: { watchHistory: videoId } });
  await User.updateOne(
    { _id: userId },
    { $push: { watchHistory: { $each: [videoId], $position: 0, $slice: 200 } } }
  );
};

export const removeFromWatchHistory = (userId, videoId) =>
  User.updateOne({ _id: userId }, { $pull: { watchHistory: videoId } });

export const getWatchHistory = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const user = await User.findById(userId).select('watchHistory');
  if (!user) throw ApiError.notFound('User not found');

  const totalCount = user.watchHistory.length;
  const pageIds = user.watchHistory.slice(skip, skip + limit);
  const videos = await populateVideosInOrder(pageIds);
  return { videos, meta: buildPageMeta(page, limit, totalCount) };
};

// --- Bookmarks / Watch later (simple sets, no ordering guarantees needed) ---
const addToSetField = (field) => (userId, videoId) =>
  User.updateOne({ _id: userId }, { $addToSet: { [field]: videoId } });

const removeFromSetField = (field) => (userId, videoId) =>
  User.updateOne({ _id: userId }, { $pull: { [field]: videoId } });

const getSetField = (field) => async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const user = await User.findById(userId).select(field);
  if (!user) throw ApiError.notFound('User not found');

  const totalCount = user[field].length;
  const pageIds = user[field].slice(skip, skip + limit);
  const videos = await populateVideosInOrder(pageIds);
  return { videos, meta: buildPageMeta(page, limit, totalCount) };
};

export const addBookmark = addToSetField('bookmarks');
export const removeBookmark = removeFromSetField('bookmarks');
export const getBookmarks = getSetField('bookmarks');

export const addToWatchLater = addToSetField('watchLater');
export const removeFromWatchLater = removeFromSetField('watchLater');
export const getWatchLater = getSetField('watchLater');

// --- Liked videos (derived from the Like collection, not stored on User) ---
export const getLikedVideos = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = { user: userId, targetType: TARGET_TYPES.VIDEO, type: REACTION_TYPES.LIKE };
  const [likes, totalCount] = await Promise.all([
    Like.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Like.countDocuments(filter),
  ]);

  const videos = await populateVideosInOrder(likes.map((l) => l.target));
  return { videos, meta: buildPageMeta(page, limit, totalCount) };
};

export const getPublicProfile = async (username) => {
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};
