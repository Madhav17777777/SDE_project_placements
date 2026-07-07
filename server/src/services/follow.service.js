import Channel from '../models/channel.model.js';
import Follow from '../models/follow.model.js';
import ApiError from '../utils/ApiError.js';
import { parsePagination, buildPageMeta } from '../utils/paginate.js';
import { createNotification } from './notification.service.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';
import { getIO } from '../sockets/index.js';
import { emitToUser } from '../sockets/stream.socket.js';

export const followChannel = async (followerId, channelId) => {
  const channel = await Channel.findById(channelId);
  if (!channel) throw ApiError.notFound('Channel not found');
  if (channel.owner.toString() === followerId.toString()) {
    throw ApiError.badRequest('You cannot follow your own channel');
  }

  try {
    await Follow.create({ follower: followerId, channel: channelId });
  } catch (error) {
    if (error.code === 11000) return; // already following — idempotent success
    throw error;
  }

  await Channel.updateOne({ _id: channelId }, { $inc: { followersCount: 1 } });

  const notification = await createNotification({
    recipient: channel.owner,
    sender: followerId,
    type: NOTIFICATION_TYPES.FOLLOW,
    message: 'You have a new follower',
    link: `/channel/${channel.slug}/followers`,
    relatedEntity: { entityType: 'Channel', entityId: channel._id },
  });

  const io = getIO();
  if (io) emitToUser(io, channel.owner, 'notification:new', { notification });
};

export const unfollowChannel = async (followerId, channelId) => {
  const result = await Follow.findOneAndDelete({ follower: followerId, channel: channelId });
  if (!result) return; // already not following — idempotent success

  await Channel.updateOne({ _id: channelId, followersCount: { $gt: 0 } }, { $inc: { followersCount: -1 } });
};

export const isFollowing = async (followerId, channelId) =>
  Boolean(await Follow.exists({ follower: followerId, channel: channelId }));

export const getFollowers = async (channelId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { channel: channelId };

  const [follows, totalCount] = await Promise.all([
    Follow.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('follower', 'username fullName avatar'),
    Follow.countDocuments(filter),
  ]);

  return { followers: follows.map((f) => f.follower), meta: buildPageMeta(page, limit, totalCount) };
};

export const getFollowing = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { follower: userId };

  const [follows, totalCount] = await Promise.all([
    Follow.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('channel'),
    Follow.countDocuments(filter),
  ]);

  return { channels: follows.map((f) => f.channel), meta: buildPageMeta(page, limit, totalCount) };
};
