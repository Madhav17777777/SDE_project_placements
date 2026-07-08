// Stream lifecycle: scheduled -> live -> ended. There is no real RTMP/HLS
// ingest in this project (that's a whole media-server infrastructure piece
// beyond a portfolio app's scope) — `streamKey`/`playbackUrl` are mocked so
// the frontend player component has something realistic to point at.
//
// Note on Socket.io: this file intentionally never imports from `sockets/`.
// `sockets/index.js` already depends on this file (via sockets/stream.socket.js,
// which calls `setViewerCount`), so importing back would create a circular
// module graph. Where a service function needs to push a realtime event
// (`goLive`), the caller (the controller) passes the already-initialized
// `io` instance in explicitly -- see server.js's `app.set('io', io)`.

import crypto from 'crypto';
import Stream from '../models/stream.model.js';
import Channel from '../models/channel.model.js';
import Follow from '../models/follow.model.js';
import ApiError from '../utils/ApiError.js';
import { STREAM_STATUS, NOTIFICATION_TYPES, socketRooms } from '../utils/constants.js';
import { parsePagination, buildPageMeta } from '../utils/paginate.js';
import { uploadBuffer, deleteAsset } from './cloudinary.service.js';
import { createNotification } from './notification.service.js';
import { logger } from '../config/logger.js';

const getOwnedChannel = async (userId) => {
  const channel = await Channel.findOne({ owner: userId });
  if (!channel) throw ApiError.forbidden('You need a channel before you can manage streams');
  return channel;
};

const assertStreamOwnership = async (streamId, userId) => {
  const stream = await Stream.findById(streamId);
  if (!stream) throw ApiError.notFound('Stream not found');

  const channel = await Channel.findById(stream.channel);
  if (!channel || channel.owner.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not own this stream');
  }
  return { stream, channel };
};

export const createStream = async (userId, { title, category, tags, scheduledFor }) => {
  const channel = await getOwnedChannel(userId);

  return Stream.create({
    channel: channel._id,
    title,
    category: category || null,
    tags: tags || [],
    scheduledFor: scheduledFor || null,
    status: STREAM_STATUS.SCHEDULED,
  });
};

export const editStream = async (userId, streamId, updates) => {
  const { stream } = await assertStreamOwnership(streamId, userId);

  const editable = ['title', 'category', 'tags', 'scheduledFor'];
  editable.forEach((field) => {
    if (updates[field] !== undefined) stream[field] = updates[field];
  });

  await stream.save();
  return stream;
};

export const updateThumbnail = async (userId, streamId, buffer) => {
  const { stream } = await assertStreamOwnership(streamId, userId);

  const result = await uploadBuffer(buffer, { folder: 'streamverse/thumbnails' });
  const oldPublicId = stream.thumbnailPublicId;
  stream.thumbnail = result.secure_url;
  stream.thumbnailPublicId = result.public_id;
  await stream.save();

  if (oldPublicId) await deleteAsset(oldPublicId);
  return stream;
};

// `io` is optional -- tests that call goLive directly (or any caller that
// doesn't have a socket server, e.g. a future admin script) simply omit it
// and skip the realtime push, still getting the full DB-side transition.
export const goLive = async (userId, streamId, io = null) => {
  const { stream, channel } = await assertStreamOwnership(streamId, userId);
  if (stream.status === STREAM_STATUS.LIVE) throw ApiError.badRequest('Stream is already live');

  stream.status = STREAM_STATUS.LIVE;
  stream.startedAt = new Date();
  stream.streamKey = crypto.randomBytes(20).toString('hex');
  stream.playbackUrl = `https://stream.streamverse.dev/live/${stream._id}/index.m3u8`;
  await stream.save();

  channel.isLive = true;
  channel.currentStream = stream._id;
  await channel.save();

  // The stream is already live in the database at this point -- fanning out
  // "your followed streamer just went live" notifications is a nice-to-have,
  // not the core action, so a failure notifying any one follower (bad data,
  // a transient DB hiccup, a socket error) must not turn an already-successful
  // "go live" into an error response for the streamer, and must not stop the
  // rest of the followers from being notified either.
  const followers = await Follow.find({ channel: channel._id }).select('follower');
  if (followers.length > 0) {
    await Promise.all(
      followers.map(async (f) => {
        try {
          const notification = await createNotification({
            recipient: f.follower,
            sender: channel.owner,
            type: NOTIFICATION_TYPES.LIVE,
            message: `${channel.channelName} just went live: ${stream.title}`,
            link: `/stream/${stream._id}`,
            relatedEntity: { entityType: 'Stream', entityId: stream._id },
          });

          if (io) {
            io.to(socketRooms.user(f.follower)).emit('stream:live', {
              channel: { id: channel._id, channelName: channel.channelName, slug: channel.slug },
              stream: { id: stream._id, title: stream.title },
            });
            io.to(socketRooms.user(f.follower)).emit('notification:new', { notification });
          }
        } catch (error) {
          logger.warn(`goLive succeeded but notifying follower ${f.follower} failed: ${error.message}`);
        }
      })
    );
  }

  return stream;
};

export const endStream = async (userId, streamId) => {
  const { stream, channel } = await assertStreamOwnership(streamId, userId);
  if (stream.status !== STREAM_STATUS.LIVE) throw ApiError.badRequest('Stream is not currently live');

  stream.status = STREAM_STATUS.ENDED;
  stream.endedAt = new Date();
  stream.viewerCount = 0;
  await stream.save();

  channel.isLive = false;
  channel.currentStream = null;
  await channel.save();

  return stream;
};

// Called from sockets/stream.socket.js on join/leave/disconnect.
export const setViewerCount = async (streamId, count) => {
  const stream = await Stream.findById(streamId);
  if (!stream) return null;

  stream.viewerCount = Math.max(0, count);
  if (stream.viewerCount > stream.peakViewerCount) stream.peakViewerCount = stream.viewerCount;
  await stream.save();
  return stream;
};

export const getStreamById = async (streamId) => {
  const stream = await Stream.findById(streamId).populate({
    path: 'channel',
    populate: [
      { path: 'owner', select: 'username avatar' },
      { path: 'category', select: 'name slug' },
    ],
  });
  if (!stream) throw ApiError.notFound('Stream not found');
  return stream;
};

export const getViewerCount = async (streamId) => {
  const stream = await Stream.findById(streamId).select('viewerCount');
  if (!stream) throw ApiError.notFound('Stream not found');
  return stream.viewerCount;
};

const populateChannelSummary = (query) =>
  query.populate({
    path: 'channel',
    select: 'channelName slug followersCount owner',
    populate: { path: 'owner', select: 'username avatar' },
  });

export const getLiveFeed = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { status: STREAM_STATUS.LIVE };
  if (query.category) filter.category = query.category;

  const [streams, totalCount] = await Promise.all([
    populateChannelSummary(Stream.find(filter).sort({ viewerCount: -1 }).skip(skip).limit(limit)),
    Stream.countDocuments(filter),
  ]);

  return { streams, meta: buildPageMeta(page, limit, totalCount) };
};

export const getFeatured = async () => {
  const streams = await populateChannelSummary(
    Stream.find({ status: STREAM_STATUS.LIVE }).sort({ viewerCount: -1 }).limit(5)
  );
  return streams;
};

export const getScheduled = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { status: STREAM_STATUS.SCHEDULED };

  const [streams, totalCount] = await Promise.all([
    populateChannelSummary(Stream.find(filter).sort({ scheduledFor: 1 }).skip(skip).limit(limit)),
    Stream.countDocuments(filter),
  ]);

  return { streams, meta: buildPageMeta(page, limit, totalCount) };
};
