import { body } from 'express-validator';

export const createStreamValidation = [
  body('title').trim().isLength({ min: 1, max: 140 }).withMessage('Title is required (max 140 chars)'),
  body('category').optional().isMongoId().withMessage('Invalid category id'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('scheduledFor').optional().isISO8601().withMessage('scheduledFor must be a valid date'),
];

export const editStreamValidation = [
  body('title').optional().trim().isLength({ min: 1, max: 140 }).withMessage('Title must be 1-140 chars'),
  body('category').optional().isMongoId().withMessage('Invalid category id'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('scheduledFor').optional().isISO8601().withMessage('scheduledFor must be a valid date'),
];
