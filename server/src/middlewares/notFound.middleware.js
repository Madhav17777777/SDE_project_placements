// Catches any request that didn't match a route and hands it to the
// centralized error handler as a clean 404, instead of Express's default HTML
// "Cannot GET /x" page.

import ApiError from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found - ${req.method} ${req.originalUrl}`));
};
