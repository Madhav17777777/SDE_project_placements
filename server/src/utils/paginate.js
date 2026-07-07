// Shared pagination helper. Every list endpoint (watch history, followers,
// notifications, and — from Phase 5 onward — streams/videos/comments) reads
// `page`/`limit` the same way and returns the same meta shape, so the
// frontend's infinite-scroll hook only has to handle one response contract.

export const parsePagination = (query, { defaultLimit = 20, maxLimit = 50 } = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPageMeta = (page, limit, totalCount) => ({
  page,
  limit,
  totalCount,
  totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  hasNextPage: page * limit < totalCount,
});
