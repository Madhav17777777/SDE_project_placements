// Admin surface: dashboard aggregates, user moderation, and stream removal.
// This was originally scoped for "Phase 4/10" but never actually implemented
// in any backend phase -- filling that gap now, before the frontend admin
// pages are built against it, so there's a real API to call.

import User from '../models/user.model.js';
import Channel from '../models/channel.model.js';
import Stream from '../models/stream.model.js';
import Video from '../models/video.model.js';
import Comment from '../models/comment.model.js';
import Like from '../models/like.model.js';
import ApiError from '../utils/ApiError.js';
import { STREAM_STATUS, TARGET_TYPES } from '../utils/constants.js';
import { parsePagination, buildPageMeta } from '../utils/paginate.js';

export const getDashboardStats = async () => {
  const [totalUsers, totalStreamers, liveStreamsCount, totalVideos, totalChannels] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'streamer' }),
    Stream.countDocuments({ status: STREAM_STATUS.LIVE }),
    Video.countDocuments(),
    Channel.countDocuments(),
  ]);

  return { totalUsers, totalStreamers, liveStreamsCount, totalVideos, totalChannels };
};

export const listUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.banned !== undefined) filter.isBanned = query.banned === 'true';

  const [users, totalCount] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users: users.map((u) => u.toSafeJSON()), meta: buildPageMeta(page, limit, totalCount) };
};

export const setUserBanStatus = async (userId, isBanned) => {
  const user = await User.findByIdAndUpdate(userId, { isBanned }, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  // Best-effort cascade cleanup. A production system would run this as a
  // background job; acceptable to do inline at portfolio-project scale.
  const channel = await Channel.findOne({ owner: userId });
  if (channel) {
    const videos = await Video.find({ channel: channel._id }).select('_id');
    const videoIds = videos.map((v) => v._id);

    await Comment.deleteMany({ video: { $in: videoIds } });
    await Like.deleteMany({ targetType: TARGET_TYPES.VIDEO, target: { $in: videoIds } });
    await Video.deleteMany({ channel: channel._id });
    await Stream.deleteMany({ channel: channel._id });
    await Channel.deleteOne({ _id: channel._id });
  }

  await Comment.deleteMany({ author: userId });
  await Like.deleteMany({ user: userId });
  await User.deleteOne({ _id: userId });
};

export const listStreamsForAdmin = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;

  const [streams, totalCount] = await Promise.all([
    Stream.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'channel', select: 'channelName slug owner', populate: { path: 'owner', select: 'username' } }),
    Stream.countDocuments(filter),
  ]);

  return { streams, meta: buildPageMeta(page, limit, totalCount) };
};

export const forceRemoveStream = async (streamId) => {
  const stream = await Stream.findById(streamId);
  if (!stream) throw ApiError.notFound('Stream not found');

  if (stream.status === STREAM_STATUS.LIVE) {
    await Channel.updateOne({ _id: stream.channel }, { isLive: false, currentStream: null });
  }
  await Stream.deleteOne({ _id: streamId });
};
