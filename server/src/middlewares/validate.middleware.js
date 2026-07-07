// Runs after an express-validator chain (e.g. body('email').isEmail()).
// Collects any validation errors into the standard ApiError shape so
// controllers never manually check validationResult themselves.

import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new ApiError(400, 'Validation failed', formatted));
};
