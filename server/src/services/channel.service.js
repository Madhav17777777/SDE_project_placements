import slugify from 'slugify';
import Channel from '../models/channel.model.js';
import Stream from '../models/stream.model.js';
import Video from '../models/video.model.js';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import { ROLES, VIDEO_VISIBILITY } from '../utils/constants.js';
import { parsePagination, buildPageMeta } from '../utils/paginate.js';

const buildUniqueSlug = async (channelName) => {
  const base = slugify(channelName, { lower: true, strict: true });
  let slug = base;
  let suffix = 1;
  // Extremely unlikely to loop more than once or twice in practice.
  while (await Channel.exists({ slug })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
};

export const createChannel = async (userId, { channelName, description, tags, category }) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.channel) throw ApiError.conflict('You already have a channel');

  const existingName = await Channel.findOne({ channelName });
  if (existingName) throw ApiError.conflict('That channel name is taken');

  const slug = await buildUniqueSlug(channelName);

  const channel = await Channel.create({
    owner: user._id,
    channelName,
    slug,
    description,
    tags,
    category: category || null,
  });

  user.channel = channel._id;
  if (user.role === ROLES.USER) user.role = ROLES.STREAMER;
  await user.save();

  return channel;
};

export const editChannel = async (userId, updates) => {
  const channel = await Channel.findOne({ owner: userId });
  if (!channel) throw ApiError.notFound('You do not have a channel yet');

  const editable = ['description', 'tags', 'category', 'socials'];
  // channelName/slug are intentionally left unchangeable post-creation so
  // shared links and the URL slug never go stale.
  editable.forEach((field) => {
    if (updates[field] !== undefined) channel[field] = updates[field];
  });

  await channel.save();
  return channel;
};

export const getChannelBySlug = async (slug) => {
  const channel = await Channel.findOne({ slug })
    .populate('owner', 'username fullName avatar')
    .populate('category', 'name slug')
    .populate('currentStream');
  if (!channel) throw ApiError.notFound('Channel not found');
  return channel;
};

export const getChannelStreams = async (slug, query) => {
  const channel = await Channel.findOne({ slug });
  if (!channel) throw ApiError.notFound('Channel not found');

  const { page, limit, skip } = parsePagination(query);
  const filter = { channel: channel._id };

  const [streams, totalCount] = await Promise.all([
    Stream.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Stream.countDocuments(filter),
  ]);

  return { streams, meta: buildPageMeta(page, limit, totalCount) };
};

export const getChannelVideos = async (slug, query) => {
  const channel = await Channel.findOne({ slug });
  if (!channel) throw ApiError.notFound('Channel not found');

  const { page, limit, skip } = parsePagination(query);
  const filter = { channel: channel._id, visibility: VIDEO_VISIBILITY.PUBLIC };

  const [videos, totalCount] = await Promise.all([
    Video.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Video.countDocuments(filter),
  ]);

  return { videos, meta: buildPageMeta(page, limit, totalCount) };
};
