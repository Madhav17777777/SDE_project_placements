// Unified search across the four searchable entities, each using the text
// index already defined on its own model (see the respective model files).
// `type=all` runs all four in parallel with a small per-type limit, suited
// for an omnibox-style dropdown; `type=<entity>` runs one paginated search,
// suited for a dedicated search-results page.

import User from '../models/user.model.js';
import Video from '../models/video.model.js';
import Stream from '../models/stream.model.js';
import Category from '../models/category.model.js';
import { VIDEO_VISIBILITY } from '../utils/constants.js';
import { parsePagination, buildPageMeta } from '../utils/paginate.js';

const searchUsers = (q, limit, skip = 0) =>
  User.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .select('username fullName avatar');

const searchVideos = (q, limit, skip = 0) =>
  Video.find(
    { $text: { $search: q }, visibility: VIDEO_VISIBILITY.PUBLIC },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .populate('channel', 'channelName slug');

const searchStreams = (q, limit, skip = 0) =>
  Stream.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .populate('channel', 'channelName slug');

const searchCategories = (q, limit, skip = 0) =>
  Category.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);

export const search = async (q, type = 'all', query = {}) => {
  if (!q || !q.trim()) {
    return { users: [], videos: [], streams: [], categories: [] };
  }

  if (type === 'all') {
    const [users, videos, streams, categories] = await Promise.all([
      searchUsers(q, 5),
      searchVideos(q, 5),
      searchStreams(q, 5),
      searchCategories(q, 5),
    ]);
    return { users, videos, streams, categories };
  }

  const { page, limit, skip } = parsePagination(query);
  const searchFns = { users: searchUsers, videos: searchVideos, streams: searchStreams, categories: searchCategories };
  const countModels = { users: User, videos: Video, streams: Stream, categories: Category };

  const fn = searchFns[type];
  if (!fn) return { results: [], meta: buildPageMeta(page, limit, 0) };

  const filter = { $text: { $search: q } };
  if (type === 'videos') filter.visibility = VIDEO_VISIBILITY.PUBLIC;

  const [results, totalCount] = await Promise.all([
    fn(q, limit, skip),
    countModels[type].countDocuments(filter),
  ]);

  return { results, meta: buildPageMeta(page, limit, totalCount) };
};
