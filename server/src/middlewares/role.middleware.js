// Role-based access control, applied after verifyJWT. Also exports an
// ownership check for routes like "edit my own channel" where the rule
// isn't just a role, but role-or-resource-owner.

import ApiError from '../utils/ApiError.js';

export const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };

// getOwnerId(req) should return the ObjectId (string) of the resource owner.
export const requireOwnerOrRole =
  (getOwnerId, ...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    const isOwner = getOwnerId(req) === req.user._id.toString();
    const hasRole = allowedRoles.includes(req.user.role);
    if (!isOwner && !hasRole) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
