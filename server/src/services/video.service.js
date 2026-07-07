import Video from '../models/video.model.js';
import Channel from '../models/channel.model.js';
import Comment from '../models/comment.model.js';
import Like from '../models/like.model.js';
import ApiError from '../utils/ApiError.js';
import { TARGET_TYPES, VIDEO_VISIBILITY } from '../utils/constants.js';
import { parsePagination, buildPageMeta } from '../utils/paginate.js';
import { uploadBuffer, deleteAsset } from './cloudinary.service.js';

const assertVideoOwnership = async (videoId, userId) => {
  const video = await Video.findById(videoId).select('+videoPublicId +thumbnailPublicId');
  if (!video) throw ApiError.notFound('Video not found');
  if (video.owner.toString() !== userId.toString()) throw ApiError.forbidden('You do not own this video');
  return video;
};

export const uploadVideo = async (userId, { title, description, category, tags, visibility }, videoFile) => {
  if (!videoFile) throw ApiError.badRequest('Video file is required');

  const channel = await Channel.findOne({ owner: userId });
  if (!channel) throw ApiError.forbidden('You need a channel before you can upload videos');

  const result = await uploadBuffer(videoFile.buffer, {
    folder: 'streamverse/videos',
    resourceType: 'video',
  });

  return Video.create({
    owner: userId,
    channel: channel._id,
    title,
    description: description || '',
    videoUrl: result.secure_url,
    videoPublicId: result.public_id,
    duration: result.duration || 0,
    category: category || null,
    tags: tags || [],
    visibility: visibility || VIDEO_VISIBILITY.PUBLIC,
  });
};

export const updateThumbnail = async (userId, videoId, buffer) => {
  const video = await assertVideoOwnership(videoId, userId);

  const result = await uploadBuffer(buffer, { folder: 'streamverse/thumbnails' });
  const oldPublicId = video.thumbnailPublicId;
  video.thumbnail = result.secure_url;
  video.thumbnailPublicId = result.public_id;
  await video.save();

  if (oldPublicId) await deleteAsset(oldPublicId);
  return video;
};

export const editVideo = async (userId, videoId, updates) => {
  const video = await assertVideoOwnership(videoId, userId);

  const editable = ['title', 'description', 'category', 'tags', 'visibility'];
  editable.forEach((field) => {
    if (updates[field] !== undefined) video[field] = updates[field];
  });

  await video.save();
  return video;
};

export const deleteVideo = async (userId, videoId) => {
  const video = await assertVideoOwnership(videoId, userId);

  if (video.videoPublicId) await deleteAsset(video.videoPublicId, 'video');
  if (video.thumbnailPublicId) await deleteAsset(video.thumbnailPublicId, 'image');

  // Cascade-clean dependent documents so we never leak orphaned comments/likes.
  await Comment.deleteMany({ video: video._id });
  await Like.deleteMany({ targetType: TARGET_TYPES.VIDEO, target: video._id });

  await video.deleteOne();
};

export const getVideoById = async (videoId) => {
  const video = await Video.findById(videoId).populate({
    path: 'channel',
    select: 'channelName slug followersCount owner',
    populate: { path: 'owner', select: 'username avatar' },
  });
  if (!video || video.visibility === VIDEO_VISIBILITY.PRIVATE) throw ApiError.notFound('Video not found');

  // Fire-and-forget view increment — not worth blocking the response on.
  Video.updateOne({ _id: videoId }, { $inc: { views: 1 } }).exec();

  return video;
};

const populateChannelSummary = (query) =>
  query.populate({
    path: 'channel',
    select: 'channelName slug owner',
    populate: { path: 'owner', select: 'username avatar' },
  });

export const listVideos = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { visibility: VIDEO_VISIBILITY.PUBLIC };
  if (query.category) filter.category = query.category;
  if (query.tag) filter.tags = query.tag;

  const sortMap = { newest: { createdAt: -1 }, popular: { views: -1 } };
  const sort = sortMap[query.sort] || sortMap.newest;

  const [videos, totalCount] = await Promise.all([
    populateChannelSummary(Video.find(filter).sort(sort).skip(skip).limit(limit)),
    Video.countDocuments(filter),
  ]);

  return { videos, meta: buildPageMeta(page, limit, totalCount) };
};

// Hacker-News-style decay: views / (hours-since-upload + 2)^1.5, computed in
// an aggregation pipeline so ranking happens in the DB, not in app memory.
export const getTrendingVideos = async (query) => {
  const { page, limit, skip } = parsePagination(query);

  const pipeline = [
    { $match: { visibility: VIDEO_VISIBILITY.PUBLIC } },
    {
      $addFields: {
        ageInHours: { $divide: [{ $subtract: [new Date(), '$createdAt'] }, 1000 * 60 * 60] },
      },
    },
    {
      $addFields: {
        trendingScore: {
          $divide: ['$views', { $pow: [{ $add: ['$ageInHours', 2] }, 1.5] }],
        },
      },
    },
    { $sort: { trendingScore: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const [videos, totalCount] = await Promise.all([
    Video.aggregate(pipeline),
    Video.countDocuments({ visibility: VIDEO_VISIBILITY.PUBLIC }),
  ]);

  const populated = await Video.populate(videos, {
    path: 'channel',
    select: 'channelName slug owner',
    populate: { path: 'owner', select: 'username avatar' },
  });

  return { videos: populated, meta: buildPageMeta(page, limit, totalCount) };
};

export const shareVideo = async (videoId) => {
  const video = await Video.findById(videoId).select('_id visibility');
  if (!video || video.visibility === VIDEO_VISIBILITY.PRIVATE) throw ApiError.notFound('Video not found');
  return { link: `/watch/${videoId}` };
};
